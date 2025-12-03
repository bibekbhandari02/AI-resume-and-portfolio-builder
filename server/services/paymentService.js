import crypto from 'crypto';
import User from '../models/User.js';
import { ESEWA_CONFIG, PLANS } from '../config/esewa.js';
import { trackEvent } from './analytics.js';

// Transaction storage (in production, use Redis or database)
const transactionStore = new Map();

// Generate unique transaction ID
export const generateTransactionId = (plan, userId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `TXN_${timestamp}_${plan}_${userId}_${random}`;
};

// Create payment signature
export const createPaymentSignature = (amount, transactionUuid, productCode) => {
  const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto
    .createHmac('sha256', ESEWA_CONFIG.secretKey)
    .update(message)
    .digest('base64');
};

// Verify payment signature
export const verifyPaymentSignature = (data, signature) => {
  const message = `transaction_uuid=${data.transaction_uuid},product_code=${data.product_code},total_amount=${data.total_amount},status=${data.status}`;
  const expectedSignature = crypto
    .createHmac('sha256', ESEWA_CONFIG.secretKey)
    .update(message)
    .digest('base64');
  return signature === expectedSignature;
};

// Store transaction details
export const storeTransaction = (transactionId, data) => {
  transactionStore.set(transactionId, {
    ...data,
    createdAt: new Date(),
    status: 'pending'
  });
  
  // Auto-cleanup after 10 minutes (reduced from 1 hour)
  setTimeout(() => {
    if (transactionStore.has(transactionId)) {
      const transaction = transactionStore.get(transactionId);
      if (transaction.status === 'pending') {
        transactionStore.delete(transactionId);
      }
    }
  }, 10 * 60 * 1000);
};

// Get transaction details
export const getTransaction = (transactionId) => {
  return transactionStore.get(transactionId);
};

// Update transaction status
export const updateTransactionStatus = (transactionId, status, metadata = {}) => {
  const transaction = transactionStore.get(transactionId);
  if (transaction) {
    transaction.status = status;
    transaction.updatedAt = new Date();
    transaction.metadata = { ...transaction.metadata, ...metadata };
    transactionStore.set(transactionId, transaction);
  }
  return transaction;
};

// Process successful payment
export const processSuccessfulPayment = async (transactionId, paymentData, req = null) => {
  try {
    const transaction = getTransaction(transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    if (transaction.status === 'completed') {
      throw new Error('Transaction already processed');
    }
    
    const { plan, userId } = transaction;
    const planDetails = PLANS[plan];
    
    if (!planDetails) {
      throw new Error('Invalid plan');
    }
    
    // Update user subscription and credits (SET credits, don't increment)
    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscription: plan,
        credits: planDetails.credits,
        $push: {
          paymentHistory: {
            transactionId,
            plan,
            amount: planDetails.amount,
            date: new Date(),
            status: 'completed',
            paymentMethod: 'esewa',
            paymentData: {
              transaction_uuid: paymentData.transaction_uuid,
              ref_id: paymentData.ref_id
            }
          }
        }
      },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update transaction status
    updateTransactionStatus(transactionId, 'completed', {
      processedAt: new Date(),
      paymentData
    });
    
    // Track analytics
    await trackEvent(userId, 'payment_completed', {
      plan,
      amount: planDetails.amount,
      transactionId,
      creditsAdded: planDetails.credits
    }, req);
    
    return {
      success: true,
      user,
      transaction,
      creditsAdded: planDetails.credits
    };
    
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

// Handle failed payment
export const processFailedPayment = async (transactionId, reason, req = null) => {
  try {
    const transaction = getTransaction(transactionId);
    
    if (!transaction) {
      return { success: false, message: 'Transaction not found' };
    }
    
    updateTransactionStatus(transactionId, 'failed', {
      failedAt: new Date(),
      reason
    });
    
    // Track analytics
    await trackEvent(transaction.userId, 'payment_failed', {
      plan: transaction.plan,
      transactionId,
      reason
    }, req);
    
    return {
      success: false,
      message: 'Payment failed',
      reason
    };
    
  } catch (error) {
    console.error('Failed payment processing error:', error);
    throw error;
  }
};

// Get user payment history
export const getUserPaymentHistory = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId).select('paymentHistory').lean();
    
    if (!user || !user.paymentHistory) {
      return [];
    }
    
    return user.paymentHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
      
  } catch (error) {
    console.error('Get payment history error:', error);
    throw error;
  }
};

// Validate plan and check eligibility
export const validatePlanPurchase = async (userId, plan) => {
  try {
    if (!PLANS[plan]) {
      return { valid: false, message: 'Invalid plan selected' };
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return { valid: false, message: 'User not found' };
    }
    
    // Check if user already has this plan
    if (user.subscription === plan) {
      return { valid: false, message: 'You already have this plan' };
    }
    
    // Check for pending transactions (only recent ones - within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const pendingTransactions = Array.from(transactionStore.values()).filter(
      t => t.userId === userId.toString() && 
           t.status === 'pending' &&
           new Date(t.createdAt) > tenMinutesAgo
    );
    
    // Clean up old pending transactions
    if (pendingTransactions.length === 0) {
      // Remove any old pending transactions for this user
      Array.from(transactionStore.entries()).forEach(([key, t]) => {
        if (t.userId === userId.toString() && 
            t.status === 'pending' && 
            new Date(t.createdAt) <= tenMinutesAgo) {
          transactionStore.delete(key);
        }
      });
    }
    
    if (pendingTransactions.length > 0) {
      return { 
        valid: false, 
        message: 'You have a pending payment. Please wait a moment or try again.' 
      };
    }
    
    return { valid: true, user, planDetails: PLANS[plan] };
    
  } catch (error) {
    console.error('Plan validation error:', error);
    throw error;
  }
};

// Cancel pending transaction
export const cancelPendingTransaction = (userId) => {
  try {
    let cancelled = false;
    Array.from(transactionStore.entries()).forEach(([key, transaction]) => {
      if (transaction.userId === userId.toString() && transaction.status === 'pending') {
        transactionStore.delete(key);
        cancelled = true;
      }
    });
    return { success: true, cancelled };
  } catch (error) {
    console.error('Cancel transaction error:', error);
    throw error;
  }
};

// Refund credits (for support/admin use)
export const refundPayment = async (userId, transactionId, reason) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const payment = user.paymentHistory.find(
      p => p.transactionId === transactionId
    );
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status === 'refunded') {
      throw new Error('Payment already refunded');
    }
    
    const planDetails = PLANS[payment.plan];
    
    // Deduct credits
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'credits.resumeGenerations': -planDetails.credits.resumeGenerations,
        'credits.portfolios': -planDetails.credits.portfolios
      },
      $set: {
        'paymentHistory.$[elem].status': 'refunded',
        'paymentHistory.$[elem].refundReason': reason,
        'paymentHistory.$[elem].refundedAt': new Date()
      }
    }, {
      arrayFilters: [{ 'elem.transactionId': transactionId }]
    });
    
    // Track analytics
    await trackEvent(userId, 'payment_refunded', {
      transactionId,
      plan: payment.plan,
      amount: payment.amount,
      reason
    });
    
    return { success: true, message: 'Payment refunded successfully' };
    
  } catch (error) {
    console.error('Refund error:', error);
    throw error;
  }
};

export default {
  generateTransactionId,
  createPaymentSignature,
  verifyPaymentSignature,
  storeTransaction,
  getTransaction,
  updateTransactionStatus,
  processSuccessfulPayment,
  processFailedPayment,
  getUserPaymentHistory,
  validatePlanPurchase,
  cancelPendingTransaction,
  refundPayment
};

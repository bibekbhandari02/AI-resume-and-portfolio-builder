import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { ESEWA_CONFIG, PLANS } from '../config/esewa.js';
import {
  generateTransactionId,
  createPaymentSignature,
  storeTransaction,
  validatePlanPurchase,
  processSuccessfulPayment,
  processFailedPayment,
  getUserPaymentHistory,
  cancelPendingTransaction
} from '../services/paymentService.js';
import { trackEvent } from '../services/analytics.js';

const router = express.Router();

// Get available plans
router.get('/plans', authenticate, async (req, res) => {
  try {
    const plans = Object.entries(PLANS).map(([key, value]) => ({
      id: key,
      ...value
    }));
    
    res.json({ plans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initiate payment (eSewa API v2)
router.post('/initiate', authenticate, async (req, res) => {
  try {
    // Check if payments are enabled
    if (process.env.PAYMENTS_ENABLED === 'false') {
      return res.status(403).json({ 
        error: 'Payments are temporarily disabled. Please contact support for premium access.' 
      });
    }
    
    const { plan } = req.body;
    
    // Validate plan purchase
    const validation = await validatePlanPurchase(req.userId, plan);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }
    
    const planDetails = validation.planDetails;
    
    // Generate transaction ID
    const transactionUuid = generateTransactionId(plan, req.userId);
    
    // For EPAYTEST, use test amount of 100
    const isTestMode = ESEWA_CONFIG.merchantId === 'EPAYTEST';
    const amount = isTestMode ? 100 : planDetails.amount;
    
    // Generate signature
    const signature = createPaymentSignature(amount, transactionUuid, ESEWA_CONFIG.merchantId);
    
    // Store transaction details
    storeTransaction(transactionUuid, {
      plan,
      userId: req.userId.toString(),
      amount,
      planDetails
    });
    
    // Track analytics
    await trackEvent(req.userId, 'payment_initiated', {
      plan,
      amount,
      transactionId: transactionUuid
    }, req);
    
    // Payment data for eSewa v2
    const paymentData = {
      amount: amount.toString(),
      failure_url: ESEWA_CONFIG.failureUrl,
      product_delivery_charge: '0',
      product_service_charge: '0',
      product_code: ESEWA_CONFIG.merchantId,
      signature: signature,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      success_url: ESEWA_CONFIG.successUrl,
      tax_amount: '0',
      total_amount: amount.toString(),
      transaction_uuid: transactionUuid
    };

    res.json({
      success: true,
      paymentUrl: ESEWA_CONFIG.paymentUrl,
      paymentData,
      transactionId: transactionUuid
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify eSewa payment (API v2)
router.post('/verify', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Missing payment data' });
    }

    // Decode base64 data
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    
    if (!decodedData.transaction_uuid || !decodedData.total_amount) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    // If payment status is COMPLETE, process it
    if (decodedData.status === 'COMPLETE') {
      const result = await processSuccessfulPayment(
        decodedData.transaction_uuid,
        decodedData,
        req
      );
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        transactionId: decodedData.transaction_uuid,
        plan: result.transaction.plan,
        creditsAdded: result.creditsAdded,
        user: {
          subscription: result.user.subscription,
          credits: result.user.credits
        }
      });
    } else {
      await processFailedPayment(
        decodedData.transaction_uuid,
        'Payment status not complete',
        req
      );
      
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle payment failure callback
router.post('/failure', async (req, res) => {
  try {
    const { transaction_uuid, reason } = req.body;
    
    if (transaction_uuid) {
      await processFailedPayment(transaction_uuid, reason || 'User cancelled', req);
    }
    
    res.json({
      success: false,
      message: 'Payment cancelled or failed'
    });
  } catch (error) {
    console.error('Payment failure handler error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await getUserPaymentHistory(req.userId, limit);
    
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current subscription details
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId).select('subscription credits paymentHistory');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentPlan = PLANS[user.subscription] || null;
    
    res.json({
      subscription: user.subscription,
      credits: user.credits,
      planDetails: currentPlan,
      lastPayment: user.paymentHistory?.[user.paymentHistory.length - 1] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel pending transaction
router.post('/cancel-pending', authenticate, async (req, res) => {
  try {
    const result = cancelPendingTransaction(req.userId);
    
    if (result.cancelled) {
      res.json({
        success: true,
        message: 'Pending transaction cancelled successfully'
      });
    } else {
      res.json({
        success: true,
        message: 'No pending transactions found'
      });
    }
  } catch (error) {
    console.error('Cancel pending transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

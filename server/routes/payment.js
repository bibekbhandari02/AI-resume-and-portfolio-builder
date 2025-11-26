import express from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { ESEWA_CONFIG, PLANS } from '../config/esewa.js';

const router = express.Router();

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
    
    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const planDetails = PLANS[plan];
    
    // Encode plan and userId in transaction UUID
    const transactionUuid = `TXN${Date.now()}${plan}${req.userId}`;
    
    // For EPAYTEST, use test amount of 100
    const isTestMode = ESEWA_CONFIG.merchantId === 'EPAYTEST';
    const amount = isTestMode ? 100 : planDetails.amount;
    
    // Create message for signature (must match exactly what's sent)
    const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${ESEWA_CONFIG.merchantId}`;
    
    // Generate signature using HMAC SHA256
    const signature = crypto
      .createHmac('sha256', ESEWA_CONFIG.secretKey)
      .update(message)
      .digest('base64');
    
    // Store transaction mapping (for verification later)
    // In production, you should store this in a database
    global.transactionMap = global.transactionMap || {};
    global.transactionMap[transactionUuid] = { plan, userId: req.userId.toString() };
    
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
      paymentData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify eSewa payment (API v2)
router.post('/verify', async (req, res) => {
  try {
    const { data, plan, userId } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Missing payment data' });
    }

    // Decode base64 data
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    
    if (!decodedData.transaction_uuid || !decodedData.total_amount) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    // If payment status is already COMPLETE in decoded data, trust it
    // (eSewa already verified it before redirecting)
    if (decodedData.status === 'COMPLETE') {
      // Get transaction details from map
      const transactionInfo = global.transactionMap?.[decodedData.transaction_uuid];
      
      if (!transactionInfo) {
        return res.status(400).json({
          success: false,
          error: 'Transaction not found'
        });
      }
      
      const { plan: planToActivate, userId: userIdToUpdate } = transactionInfo;
      
      // Update user subscription
      await User.findByIdAndUpdate(userIdToUpdate, {
        subscription: planToActivate,
        credits: PLANS[planToActivate].credits
      });

      // Clean up transaction map
      delete global.transactionMap[decodedData.transaction_uuid];

      res.json({
        success: true,
        message: 'Payment verified successfully',
        transactionId: decodedData.transaction_uuid,
        plan: planToActivate
      });
    } else {
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

export default router;

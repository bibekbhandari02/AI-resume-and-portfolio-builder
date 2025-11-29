import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUserAnalytics, getResumeAnalytics, getPortfolioAnalytics, getDashboardStats } from '../services/analytics.js';
import Analytics from '../models/Analytics.js';

const router = express.Router();

// Get user dashboard analytics
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const stats = await getDashboardStats(req.userId, days);
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics insights
router.get('/insights', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const { getAnalyticsInsights } = await import('../services/analytics.js');
    const insights = await getAnalyticsInsights(req.userId, days);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get resume-specific analytics
router.get('/resume/:id', authenticate, async (req, res) => {
  try {
    const analytics = await getResumeAnalytics(req.params.id);
    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get portfolio-specific analytics
router.get('/portfolio/:id', authenticate, async (req, res) => {
  try {
    const analytics = await getPortfolioAnalytics(req.params.id);
    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const analytics = await getUserAnalytics(req.userId, days);
    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track event (manual tracking from frontend)
router.post('/track', authenticate, async (req, res) => {
  try {
    const { action, metadata } = req.body;
    const { trackEvent } = await import('../services/analytics.js');
    await trackEvent(req.userId, action, metadata, req);
    res.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint - check raw analytics data
router.get('/debug', authenticate, async (req, res) => {
  try {
    const recentEvents = await Analytics.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    const eventCounts = await Analytics.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);
    
    res.json({ recentEvents, eventCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

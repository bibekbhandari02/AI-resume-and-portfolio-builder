import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio'
  },
  eventType: {
    type: String,
    enum: [
      // Resume events
      'resume_view', 
      'resume_download', 
      'resume_created', 
      'resume_updated',
      'resume_deleted',
      'resume_shared',
      
      // Portfolio events
      'portfolio_view', 
      'portfolio_created', 
      'portfolio_updated',
      'portfolio_published',
      'portfolio_deleted',
      
      // Cover letter events
      'cover_letter_generated', 
      'cover_letter_download',
      'cover_letter_updated',
      
      // AI events
      'ai_enhancement',
      'ai_enhancement_used',
      'job_description_analyzed',
      'resume_job_match_calculated',
      'skill_gap_analyzed',
      'interview_questions_generated',
      'linkedin_profile_optimized',
      'salary_negotiation_advice_generated',
      
      // Payment events
      'payment_initiated',
      'payment_completed',
      'payment_failed',
      'payment_refunded',
      
      // User events
      'user_login',
      'user_logout',
      'user_registered',
      'profile_updated',
      
      // Feature usage
      'feature_used',
      'search_performed',
      'export_completed',
      'template_changed'
    ],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for faster queries
analyticsSchema.index({ userId: 1, createdAt: -1 });
analyticsSchema.index({ resumeId: 1, eventType: 1 });
analyticsSchema.index({ portfolioId: 1, eventType: 1 });
analyticsSchema.index({ eventType: 1, createdAt: -1 });

export default mongoose.model('Analytics', analyticsSchema);

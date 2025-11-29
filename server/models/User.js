import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subscription: {
    type: String,
    enum: ['free', 'starter', 'pro'],
    default: 'free'
  },
  credits: {
    resumeGenerations: { type: Number, default: 5 },
    portfolios: { type: Number, default: 1 },
    coverLetters: { type: Number, default: 3 }
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  paymentHistory: [{
    transactionId: String,
    plan: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    paymentMethod: {
      type: String,
      enum: ['esewa', 'stripe', 'manual'],
      default: 'esewa'
    },
    paymentData: mongoose.Schema.Types.Mixed,
    refundReason: String,
    refundedAt: Date
  }],
  profile: {
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    github: String,
    summary: String
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);

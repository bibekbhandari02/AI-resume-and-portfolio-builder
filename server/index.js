import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import resumeRoutes from './routes/resume.js';
import portfolioRoutes from './routes/portfolio.js';
import aiRoutes from './routes/ai.js';
import aiEnhancedRoutes from './routes/aiEnhanced.js';
import paymentRoutes from './routes/payment.js';
import uploadRoutes from './routes/upload.js';
import coverLetterRoutes from './routes/coverLetter.js';
import analyticsRoutes from './routes/analytics.js';
import versionsRoutes from './routes/versions.js';
import jobAnalyzerRoutes from './routes/jobAnalyzer.js';
import publicRoutes from './routes/public.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware - CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://portfolio-builder-client-9ejw.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Additional CORS headers for preflight requests
app.options('*', cors());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // Lazy session update (24 hours)
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-enhanced', aiEnhancedRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/versions', versionsRoutes);
app.use('/api/job-analyzer', jobAnalyzerRoutes);
app.use('/api/public', publicRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CareerCraft AI API is running',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      resume: '/api/resume',
      portfolio: '/api/portfolio',
      ai: '/api/ai',
      aiEnhanced: '/api/ai-enhanced',
      payment: '/api/payment',
      upload: '/api/upload',
      coverLetter: '/api/cover-letter',
      analytics: '/api/analytics',
      versions: '/api/versions',
      jobAnalyzer: '/api/job-analyzer',
      public: '/api/public'
    },
    features: {
      payment: 'Enhanced payment flow with transaction tracking',
      ai: 'Advanced AI features including job matching, skill gap analysis, interview prep',
      analytics: 'Comprehensive analytics with insights and trends'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Keep-alive endpoint for preventing cold starts
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
});

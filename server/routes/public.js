import express from 'express';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Portfolio from '../models/Portfolio.js';
import CoverLetter from '../models/CoverLetter.js';

const router = express.Router();

// Get public statistics for landing page
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const [userCount, resumeCount, portfolioCount, coverLetterCount] = await Promise.all([
      User.countDocuments(),
      Resume.countDocuments(),
      Portfolio.countDocuments(),
      CoverLetter.countDocuments()
    ]);

    // Calculate success rate based on users who have created at least one resume
    // Count users who have resumes in the database
    const usersWithResumes = await Resume.distinct('userId').then(ids => ids.length);
    
    const successRate = userCount > 0 
      ? Math.round((usersWithResumes / userCount) * 100) 
      : 0;

    const stats = {
      users: userCount,
      resumes: resumeCount,
      portfolios: portfolioCount,
      coverLetters: coverLetterCount,
      successRate: successRate
    };

    console.log('Public stats:', stats);

    // Return real-time stats
    res.json(stats);
  } catch (error) {
    console.error('Error fetching public stats:', error);
    // Return fallback stats on error
    res.json({
      users: 100,
      resumes: 250,
      portfolios: 50,
      coverLetters: 150,
      successRate: 85
    });
  }
});

export default router;

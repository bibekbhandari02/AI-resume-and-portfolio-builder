import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  analyzeJobDescription,
  calculateResumeJobMatch,
  analyzeSkillGaps,
  generateInterviewQuestions,
  optimizeLinkedInProfile,
  generateSalaryNegotiationAdvice
} from '../services/aiEnhanced.js';
import Resume from '../models/Resume.js';

const router = express.Router();

// Analyze job description
router.post('/analyze-job', authenticate, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ 
        error: 'Please provide a valid job description (minimum 50 characters)' 
      });
    }
    
    const analysis = await analyzeJobDescription(jobDescription, req.userId, req);
    
    res.json({ 
      success: true,
      analysis 
    });
  } catch (error) {
    console.error('Job analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate resume-job match score
router.post('/resume-job-match', authenticate, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ 
        error: 'Resume ID and job description are required' 
      });
    }
    
    // Get resume data
    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const matchScore = await calculateResumeJobMatch(
      resume.content,
      jobDescription,
      req.userId,
      req
    );
    
    res.json({ 
      success: true,
      matchScore,
      resumeTitle: resume.title
    });
  } catch (error) {
    console.error('Resume-job match error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze skill gaps
router.post('/skill-gap-analysis', authenticate, async (req, res) => {
  try {
    const { currentSkills, targetRole } = req.body;
    
    if (!currentSkills || !targetRole) {
      return res.status(400).json({ 
        error: 'Current skills and target role are required' 
      });
    }
    
    const analysis = await analyzeSkillGaps(
      currentSkills,
      targetRole,
      req.userId,
      req
    );
    
    res.json({ 
      success: true,
      analysis 
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate interview questions
router.post('/interview-prep', authenticate, async (req, res) => {
  try {
    const { jobTitle, resumeId } = req.body;
    
    if (!jobTitle) {
      return res.status(400).json({ 
        error: 'Job title is required' 
      });
    }
    
    let resumeData = {};
    
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
      if (resume) {
        resumeData = resume.content;
      }
    }
    
    const questions = await generateInterviewQuestions(
      jobTitle,
      resumeData,
      req.userId,
      req
    );
    
    res.json({ 
      success: true,
      questions 
    });
  } catch (error) {
    console.error('Interview prep error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Optimize LinkedIn profile
router.post('/linkedin-optimize', authenticate, async (req, res) => {
  try {
    const { resumeId } = req.body;
    
    if (!resumeId) {
      return res.status(400).json({ 
        error: 'Resume ID is required' 
      });
    }
    
    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const optimization = await optimizeLinkedInProfile(
      resume.content,
      req.userId,
      req
    );
    
    res.json({ 
      success: true,
      optimization 
    });
  } catch (error) {
    console.error('LinkedIn optimization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate salary negotiation advice
router.post('/salary-advice', authenticate, async (req, res) => {
  try {
    const { jobTitle, experience, location } = req.body;
    
    if (!jobTitle || !experience || !location) {
      return res.status(400).json({ 
        error: 'Job title, experience, and location are required' 
      });
    }
    
    const advice = await generateSalaryNegotiationAdvice(
      jobTitle,
      experience,
      location,
      req.userId,
      req
    );
    
    res.json({ 
      success: true,
      advice 
    });
  } catch (error) {
    console.error('Salary advice error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

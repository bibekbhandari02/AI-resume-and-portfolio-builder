import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { parseJobDescription, analyzeResumeMatch, tailorResumeForJob } from '../services/jobAnalyzer.js';
import Resume from '../models/Resume.js';

const router = express.Router();

// Parse job description
router.post('/parse', authenticate, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ 
        error: 'Please provide a valid job description (at least 50 characters)' 
      });
    }
    
    const analysis = await parseJobDescription(jobDescription);
    
    res.json({ analysis });
  } catch (error) {
    console.error('Job description parsing error:', error);
    res.status(500).json({ error: error.message || 'Failed to parse job description' });
  }
});

// Analyze resume against job description
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { resumeId, jobDescription, jobAnalysis } = req.body;
    
    if (!resumeId) {
      return res.status(400).json({ error: 'Resume ID is required' });
    }
    
    // Get resume
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Parse job description if not already parsed
    let analysis = jobAnalysis;
    if (!analysis && jobDescription) {
      analysis = await parseJobDescription(jobDescription);
    }
    
    if (!analysis) {
      return res.status(400).json({ error: 'Job description or analysis is required' });
    }
    
    // Analyze match
    const matchAnalysis = await analyzeResumeMatch(resume.toObject(), analysis);
    
    res.json({ 
      matchAnalysis,
      jobAnalysis: analysis
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
});

// Tailor resume for job
router.post('/tailor', authenticate, async (req, res) => {
  try {
    const { resumeId, jobAnalysis, saveAs } = req.body;
    
    if (!resumeId || !jobAnalysis) {
      return res.status(400).json({ error: 'Resume ID and job analysis are required' });
    }
    
    // Get resume
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Tailor resume
    const tailoredData = await tailorResumeForJob(resume.toObject(), jobAnalysis);
    
    // Save as new resume or update existing
    if (saveAs === 'new') {
      // CRITICAL: Ensure skills are properly formatted
      const formattedSkills = tailoredData.skills && Array.isArray(tailoredData.skills) 
        ? tailoredData.skills.map(skill => {
            let items;
            if (Array.isArray(skill.items)) {
              // Array format - join with proper spacing
              items = skill.items.join(', ');
            } else if (typeof skill.items === 'string') {
              // String format - ensure proper spacing after commas
              items = skill.items.split(',').map(s => s.trim()).filter(Boolean).join(', ');
            } else {
              items = '';
            }
            
            return {
              category: skill.category || 'Skills',
              items: items
            };
          }).filter(skill => skill.items && skill.items.trim().length > 0)
        : resume.skills;
      
      console.log('Creating new resume with skills:', JSON.stringify(formattedSkills, null, 2));
      
      // Create new resume with tailored data
      const newResume = new Resume({
        userId: req.user._id,
        title: `${resume.title || 'Resume'} - Tailored for ${jobAnalysis.jobTitle}`,
        template: resume.template,
        personalInfo: resume.personalInfo,
        summary: tailoredData.summary || resume.summary,
        education: resume.education,
        experience: tailoredData.experience || resume.experience,
        skills: formattedSkills,
        projects: tailoredData.projects || resume.projects,
        certifications: resume.certifications,
        aiEnhanced: true
      });
      
      await newResume.save();
      
      console.log('Saved resume skills:', JSON.stringify(newResume.skills, null, 2));
      
      res.json({ 
        message: 'Tailored resume created successfully',
        resume: newResume
      });
    } else {
      // Update existing resume with tailored data
      if (tailoredData.summary) resume.summary = tailoredData.summary;
      
      // CRITICAL: Ensure skills are properly formatted before saving
      if (tailoredData.skills && Array.isArray(tailoredData.skills)) {
        resume.skills = tailoredData.skills.map(skill => {
          let items;
          if (Array.isArray(skill.items)) {
            // Array format - join with proper spacing
            items = skill.items.join(', ');
          } else if (typeof skill.items === 'string') {
            // String format - ensure proper spacing after commas
            items = skill.items.split(',').map(s => s.trim()).filter(Boolean).join(', ');
          } else {
            items = '';
          }
          
          return {
            category: skill.category || 'Skills',
            items: items
          };
        }).filter(skill => skill.items && skill.items.trim().length > 0);
        
        console.log('Updating resume with skills:', JSON.stringify(resume.skills, null, 2));
      }
      
      if (tailoredData.experience) resume.experience = tailoredData.experience;
      if (tailoredData.projects) resume.projects = tailoredData.projects;
      
      resume.aiEnhanced = true;
      resume.markModified('skills');
      await resume.save();
      
      console.log('Saved resume skills:', JSON.stringify(resume.skills, null, 2));
      
      res.json({ 
        message: 'Resume tailored successfully',
        resume
      });
    }
  } catch (error) {
    console.error('Resume tailoring error:', error);
    res.status(500).json({ error: error.message || 'Failed to tailor resume' });
  }
});

// Get suggestions for improving match
router.post('/suggestions', authenticate, async (req, res) => {
  try {
    const { resumeId, jobAnalysis } = req.body;
    
    if (!resumeId || !jobAnalysis) {
      return res.status(400).json({ error: 'Resume ID and job analysis are required' });
    }
    
    // Get resume
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Analyze match
    const matchAnalysis = await analyzeResumeMatch(resume.toObject(), jobAnalysis);
    
    // Return only suggestions
    res.json({ 
      suggestions: matchAnalysis.recommendations,
      missingSkills: matchAnalysis.missingSkills,
      score: matchAnalysis.overallScore
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate suggestions' });
  }
});

export default router;

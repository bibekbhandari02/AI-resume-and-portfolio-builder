import express from 'express';
import { authenticate } from '../middleware/auth.js';
import CoverLetter from '../models/CoverLetter.js';

const router = express.Router();

// Get all cover letters for user
router.get('/', authenticate, async (req, res) => {
  try {
    const coverLetters = await CoverLetter.find({ user: req.user.id })
      .sort({ updatedAt: -1 });
    res.json({ coverLetters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single cover letter
router.get('/:id', authenticate, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!coverLetter) {
      return res.status(404).json({ error: 'Cover letter not found' });
    }
    
    res.json({ coverLetter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create cover letter
router.post('/', authenticate, async (req, res) => {
  try {
    const coverLetter = new CoverLetter({
      ...req.body,
      user: req.user.id
    });
    
    await coverLetter.save();
    res.status(201).json({ coverLetter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cover letter
router.put('/:id', authenticate, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!coverLetter) {
      return res.status(404).json({ error: 'Cover letter not found' });
    }
    
    res.json({ coverLetter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete cover letter
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!coverLetter) {
      return res.status(404).json({ error: 'Cover letter not found' });
    }
    
    res.json({ message: 'Cover letter deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

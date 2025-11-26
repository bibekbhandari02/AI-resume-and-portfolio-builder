import mongoose from 'mongoose';

const coverLetterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  companyName: String,
  hiringManager: String,
  content: {
    type: String,
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  }
}, {
  timestamps: true
});

export default mongoose.model('CoverLetter', coverLetterSchema);

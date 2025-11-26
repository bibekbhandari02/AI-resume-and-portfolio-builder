import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!'), false);
    }
  }
});

// Configure multer for resume uploads (PDF and Word documents)
const resumeUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed!'), false);
    }
  }
});

// Upload image
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('File:', req.file ? 'Present' : 'Missing');
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary not configured');
      return res.status(500).json({ error: 'Image upload service not configured' });
    }

    console.log('☁️ Uploading to Cloudinary...');

    // Re-configure Cloudinary to ensure it's set
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Determine resource type and upload options
    const isPDF = req.file.mimetype === 'application/pdf';
    const uploadOptions = {
      folder: 'resume-builder',
      resource_type: isPDF ? 'raw' : 'image',
    };

    // Preserve original filename for PDFs
    if (isPDF) {
      // Remove extension and sanitize filename (remove spaces and special chars)
      const originalName = req.file.originalname
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[^a-zA-Z0-9_-]/g, '_'); // Replace special chars with underscore
      uploadOptions.public_id = `${originalName}_${Date.now()}`;
    } else {
      // Add transformations only for images
      uploadOptions.transformation = [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' }
      ];
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary error:', error);
            reject(error);
          } else {
            console.log('✅ Upload successful');
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // For PDFs, return our server URL that will proxy the file
    let fileUrl = result.secure_url;
    if (isPDF) {
      const encodedPublicId = encodeURIComponent(result.public_id);
      fileUrl = `/api/upload/pdf/${encodedPublicId}`;
    }

    res.json({
      success: true,
      url: fileUrl,
      publicId: result.public_id,
      format: result.format
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve PDF file (proxy to bypass Cloudinary restrictions)
router.get('/pdf/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);
    
    // Get the PDF from Cloudinary
    const pdfUrl = cloudinary.url(decodedPublicId, {
      resource_type: 'raw',
      secure: true
    });
    
    // Fetch the PDF
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    const buffer = await response.arrayBuffer();
    
    // Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('PDF serve error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload resume file for cover letter generation
router.post('/resume', authenticate, resumeUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // For now, we'll create a simple resume data structure
    // In a production app, you'd want to use a PDF parser library like pdf-parse
    // or mammoth for Word documents to extract actual text
    
    const resumeData = {
      personalInfo: {
        fullName: 'Uploaded Resume',
        email: 'user@example.com',
        phone: '',
        location: ''
      },
      summary: 'Resume content from uploaded file',
      experience: [
        {
          position: 'Professional',
          company: 'Various Companies',
          startDate: '',
          endDate: '',
          description: 'Experience details from uploaded resume'
        }
      ],
      education: [
        {
          degree: 'Degree',
          institution: 'Institution',
          graduationDate: ''
        }
      ],
      skills: ['Skills from uploaded resume'],
      uploadedFile: true,
      fileName: req.file.originalname
    };

    res.json({
      success: true,
      resumeData: resumeData,
      message: 'Resume uploaded successfully. AI will generate cover letter based on the file.'
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete image
router.delete('/image/:publicId', authenticate, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    await cloudinary.uploader.destroy(publicId);
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

# Resume Upload Feature - Future Enhancement

## Current Implementation
The resume upload feature currently accepts PDF and Word documents but creates a placeholder resume data structure. The AI will still generate a cover letter, but it won't be based on the actual content of the uploaded file.

## Future Enhancement: PDF/Word Parsing

To properly extract text from uploaded resume files, you'll need to add these npm packages:

### For PDF Files:
```bash
npm install pdf-parse
```

### For Word Documents:
```bash
npm install mammoth
```

### Implementation Example:

```javascript
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// In server/routes/upload.js - resume upload endpoint

if (req.file.mimetype === 'application/pdf') {
  // Parse PDF
  const pdfData = await pdfParse(req.file.buffer);
  const extractedText = pdfData.text;
  
  // Use AI to structure the extracted text into resume format
  const resumeData = await parseResumeText(extractedText);
  
} else if (req.file.mimetype.includes('word')) {
  // Parse Word document
  const result = await mammoth.extractRawText({ buffer: req.file.buffer });
  const extractedText = result.value;
  
  // Use AI to structure the extracted text into resume format
  const resumeData = await parseResumeText(extractedText);
}

// Helper function to parse resume text using AI
async function parseResumeText(text) {
  // Use your Gemini AI to extract structured data from the text
  const prompt = `Extract resume information from this text and return as JSON:
  ${text}
  
  Return format:
  {
    "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "" },
    "summary": "",
    "experience": [{ "position": "", "company": "", "startDate": "", "endDate": "", "description": "" }],
    "education": [{ "degree": "", "institution": "", "graduationDate": "" }],
    "skills": []
  }`;
  
  const result = await callGeminiAPI(prompt);
  return JSON.parse(result);
}
```

## Benefits of Adding PDF/Word Parsing:
1. More accurate cover letters based on actual resume content
2. Better personalization
3. Automatic extraction of skills, experience, and education
4. No need for users to manually create resumes in the system first

## Current Workaround:
Users can still:
1. Select from their existing resumes in the system
2. Upload a resume file (which will work but with generic content)
3. Edit the generated cover letter manually

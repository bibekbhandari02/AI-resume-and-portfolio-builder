import fetch from 'node-fetch';
import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

// Helper function to call Gemini API with retry logic
export async function callGeminiAPI(prompt, options = {}) {
  const { maxRetries = 2, timeout = 30000 } = options;
  
  // Get API key at runtime (after dotenv has loaded)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    throw new Error('GEMINI_API_KEY not configured');
  }

  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  };

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: wait 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }
        
        // Retry on server errors (5xx)
        lastError = new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        continue;
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      return generatedText;
      
    } catch (error) {
      console.error(`Gemini API call failed (attempt ${attempt + 1}):`, error.message);
      lastError = error;
      
      // Don't retry on abort/timeout or client errors
      if (error.name === 'AbortError' || error.message.includes('Gemini API error:')) {
        throw error;
      }
    }
  }
  
  throw lastError || new Error('Failed to generate content after retries');
}

export const enhanceResume = async (resumeData) => {
  const hasExperience = resumeData.experience?.[0]?.company;
  const hasProjects = resumeData.projects?.[0]?.name;
  
  const prompt = `You are an expert ATS resume optimizer with a track record of creating resumes that score 90+ on ATS systems.

CRITICAL REQUIREMENTS FOR 90+ ATS SCORE:
1. Use STRONG action verbs (Spearheaded, Architected, Engineered, Optimized, Implemented)
2. Include QUANTIFIABLE metrics (%, $, numbers, time saved, users impacted)
3. Add INDUSTRY-SPECIFIC keywords relevant to the role
4. Use ACHIEVEMENT-FOCUSED language (not just responsibilities)
5. Include TECHNICAL TERMS and tools that ATS systems scan for
6. Ensure proper FORMATTING with clear section headers
7. Add IMPACT STATEMENTS showing business value

${!hasExperience ? 'NOTE: This is a FRESHER/STUDENT resume. Compensate with strong project descriptions, technical skills, and measurable achievements in academic/personal projects.' : ''}

Resume Data:
Personal Info: ${JSON.stringify(resumeData.personalInfo)}
Education: ${JSON.stringify(resumeData.education)}
${hasExperience ? `Work Experience: ${JSON.stringify(resumeData.experience)}` : 'Work Experience: None (Fresher/Student)'}
${hasProjects ? `Projects: ${JSON.stringify(resumeData.projects)}` : ''}
Skills: ${JSON.stringify(resumeData.skills)}
Certifications: ${JSON.stringify(resumeData.certifications || [])}

OPTIMIZATION GOAL: Transform this resume to achieve 90+ ATS score by:
- Adding powerful action verbs
- Including specific metrics and numbers
- Incorporating industry keywords
- Highlighting measurable achievements
- Emphasizing technical proficiency

CRITICAL OUTPUT FORMAT REQUIREMENTS:
- Return ONLY plain text markdown
- Use **Header** for section headers (e.g., **Summary**, **Skills**, **Projects**)
- DO NOT return JSON format
- DO NOT wrap in code blocks or backticks
- Start directly with **Summary**

EXAMPLE OF CORRECT FORMAT:
**Summary**
Highly motivated software engineer with 3+ years...

**Skills**
Frontend: React, TypeScript, Tailwind CSS
Backend: Node.js, Express, Python

Return in this EXACT format with clear section headers:

**Summary**
[Write a powerful 2-3 sentence summary with:
- Key technical skills and expertise areas
- Years of experience or academic background
- Specific achievements or specializations
- Industry-relevant keywords
${!hasExperience ? 'For freshers: Emphasize technical skills, academic projects, and learning capabilities' : 'For experienced: Quantify impact and highlight leadership'}]

${hasExperience ? `**Experience**
[Transform each role into ATS-optimized bullet points. Each bullet MUST include:]
* [ACTION VERB] + [What you did] + [Quantifiable result/impact] + [Technologies used]
* Example: "Engineered scalable microservices architecture using Node.js and Docker, reducing API response time by 40% and serving 100K+ daily users"
* Example: "Spearheaded migration to React framework, improving page load speed by 60% and increasing user engagement by 25%"
* Include metrics: percentages, dollar amounts, time saved, users impacted, performance improvements` : ''}

**Skills**
[Organize ALL technical skills by category with specific tools/technologies]
Frontend: [List specific frameworks, libraries - e.g., React, Vue.js, TypeScript, Tailwind CSS]
Backend: [List languages, frameworks - e.g., Node.js, Python, Django, Express.js]
Database: [List database systems - e.g., MongoDB, PostgreSQL, Redis]
DevOps/Tools: [List tools - e.g., Docker, AWS, Git, CI/CD, Kubernetes]
[Add more categories as relevant: Testing, Mobile, Cloud, etc.]

${hasProjects ? `**Projects**
IMPORTANT: Enhance ALL ${resumeData.projects?.length || 1} projects listed below. For EACH project, provide:

${resumeData.projects?.map((proj, idx) => `
Project ${idx + 1}: ${proj.name || '[Project Name]'}
Description: [Write ATS-optimized description with ACTION VERB + impact + metrics. Example: "Engineered full-stack application using React and Node.js, reducing load time by 40% and serving 1000+ users"]
Technologies: [Comprehensive tech stack: React, Node.js, MongoDB, Express, Redux, JWT, etc.]
${proj.github ? `GitHub: ${proj.github}` : ''}
${proj.link ? `Live: ${proj.link}` : ''}
`).join('\n')}

Format: Use "Project: [Name]" for each project, followed by Description and Technologies on separate lines.` : `**Projects**
[Suggest 2-3 impressive project ideas based on their skills that would boost ATS score]
For each project:
Project: [Professional-sounding name]
Description: [What it does with measurable impact - include numbers like "handles 1000+ requests/sec" or "reduces processing time by 50%"]
Technologies: [Comprehensive tech stack with industry-standard tools]`}

**Education**
[Enhance with:
- Degree, Major, University name
- GPA if strong (3.5+)
- Relevant coursework with technical keywords
- Academic achievements, honors, scholarships
- Technical projects or research]

${!hasExperience ? `**ATS Optimization Tips Applied**
✓ Added strong action verbs (Engineered, Developed, Implemented)
✓ Included quantifiable metrics and impact
✓ Incorporated industry-specific keywords
✓ Emphasized technical skills and tools
✓ Structured for ATS parsing
✓ Highlighted measurable achievements` : ''}`;

  try {
    const result = await callGeminiAPI(prompt);
    return result;
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback to mock response in development
    if (process.env.NODE_ENV !== 'production') {
      return getMockResumeEnhancement(resumeData);
    }
    throw error;
  }
};

export const generateCoverLetter = async (jobTitle, resumeData, companyName = '', hiringManager = '', customPrompt = '', jobDescription = '', tone = 'professional') => {
  const companyText = companyName ? ` at ${companyName}` : '';
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Extract contact info from resume - handle different field names
  const personalInfo = resumeData.personalInfo || {};
  const fullName = personalInfo.fullName || personalInfo.name || '[Your Name]';
  const phone = personalInfo.phone || personalInfo.phoneNumber || personalInfo.mobile || '[Phone Number]';
  const email = personalInfo.email || personalInfo.emailAddress || '[Email Address]';
  const location = personalInfo.location || personalInfo.address || personalInfo.city || '[Location]';
  const linkedin = personalInfo.linkedin || personalInfo.linkedinUrl || '';
  const github = personalInfo.github || personalInfo.githubUrl || '';
  
  // Parse job description if provided
  let jobRequirements = null;
  if (jobDescription && jobDescription.trim().length > 50) {
    try {
      // Extract key requirements from job description
      const jdAnalysisPrompt = `Analyze this job description and extract key information in JSON format:

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON (no markdown):
{
  "keyResponsibilities": ["resp1", "resp2", "resp3"],
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "companyValues": ["value1", "value2"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;
      
      const jdAnalysis = await callGeminiAPI(jdAnalysisPrompt, { timeout: 15000 });
      const cleaned = jdAnalysis.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      jobRequirements = JSON.parse(cleaned);
    } catch (error) {
      console.log('Job description analysis failed, continuing without it');
    }
  }
  
  // Analyze custom prompt for specific instructions
  const promptLower = customPrompt?.toLowerCase() || '';
  
  // Check for date preference
  const includeDate = !promptLower.includes('remove the date') && 
                      !promptLower.includes('without date') &&
                      !promptLower.includes('no date');
  
  // Determine greeting
  let greeting = 'Dear Hiring Manager,';
  if (hiringManager && !promptLower.includes('no name') && !promptLower.includes('generic')) {
    greeting = `Dear ${hiringManager},`;
  }
  
  // Build header
  let header = `${fullName}\n${phone} | ${email}\n${location}`;
  if (linkedin || github) {
    if (linkedin) header += `\nLinkedIn: ${linkedin}`;
    if (github) header += `\nGitHub: ${github}`;
  }
  
  // Add date if not explicitly removed
  if (includeDate) {
    header += `\n\n${currentDate}\n\n`;
  } else {
    header += `\n\n`;
  }
  
  // Add recipient info if available
  if (hiringManager || companyName) {
    if (hiringManager) header += `${hiringManager}\n`;
    if (companyName) header += `${companyName}\n`;
    header += '\n';
  }
  
  // Analyze prompt for specific requirements
  let paragraphCount = 3;
  let wordLimit = null;
  let toneDescription = 'professional and enthusiastic';
  let focusAreas = [];
  
  // Map tone selection to description
  const toneMap = {
    'professional': 'professional, confident, and results-oriented',
    'enthusiastic': 'enthusiastic, passionate, and energetic',
    'creative': 'creative, unique, and memorable',
    'formal': 'formal, traditional, and respectful',
    'conversational': 'conversational, friendly, yet professional'
  };
  toneDescription = toneMap[tone] || toneDescription;
  
  if (customPrompt) {
    // Paragraph count
    if (promptLower.includes('1 paragraph')) paragraphCount = 1;
    else if (promptLower.includes('2 paragraph')) paragraphCount = 2;
    else if (promptLower.includes('4 paragraph')) paragraphCount = 4;
    else if (promptLower.includes('5 paragraph')) paragraphCount = 5;
    
    // Word limit - specific numbers
    const wordMatch = promptLower.match(/(\d+)\s*words?/);
    if (wordMatch) wordLimit = parseInt(wordMatch[1]);
    
    // Word limit - relative terms
    if (promptLower.includes('smaller') || promptLower.includes('shorter') || promptLower.includes('more concise')) {
      wordLimit = 200; // Short version
      paragraphCount = 2;
    } else if (promptLower.includes('longer') || promptLower.includes('more detailed') || promptLower.includes('comprehensive')) {
      wordLimit = 400; // Longer version
      paragraphCount = 4;
    } else if (promptLower.includes('brief') || promptLower.includes('quick')) {
      wordLimit = 150; // Very brief
      paragraphCount = 1;
    }
    
    // Override tone if specified in custom prompt
    if (promptLower.includes('formal')) toneDescription = 'formal and professional';
    else if (promptLower.includes('casual') || promptLower.includes('friendly')) toneDescription = 'friendly yet professional';
    else if (promptLower.includes('enthusiastic') || promptLower.includes('passionate')) toneDescription = 'enthusiastic and passionate';
    else if (promptLower.includes('concise') || promptLower.includes('brief')) toneDescription = 'concise and direct';
    
    // Focus areas
    if (promptLower.includes('leadership')) focusAreas.push('leadership experience and team management');
    if (promptLower.includes('technical') || promptLower.includes('tech')) focusAreas.push('technical skills and expertise');
    if (promptLower.includes('achievement') || promptLower.includes('accomplishment')) focusAreas.push('quantifiable achievements and results');
    if (promptLower.includes('passion') || promptLower.includes('motivation')) focusAreas.push('passion and motivation for the role');
    if (promptLower.includes('culture fit') || promptLower.includes('values')) focusAreas.push('cultural fit and shared values');
    if (promptLower.includes('innovation') || promptLower.includes('creative')) focusAreas.push('innovation and creative problem-solving');
  }
  
  // Extract comprehensive resume data
  const resumeAnalysis = {
    name: fullName,
    currentRole: resumeData.experience?.[0]?.position || 'Professional',
    yearsOfExperience: resumeData.experience?.length || 0,
    recentExperience: resumeData.experience?.slice(0, 3).map(exp => ({
      position: exp.position,
      company: exp.company,
      description: exp.description?.substring(0, 300),
      achievements: exp.description?.match(/\d+%|\$\d+|increased|improved|reduced|led|managed/gi) || []
    })),
    topSkills: resumeData.skills?.slice(0, 5).map(s => ({
      category: s.category,
      items: Array.isArray(s.items) ? s.items : s.items?.split(',').map(i => i.trim())
    })),
    education: resumeData.education?.[0] ? {
      degree: resumeData.education[0].degree,
      institution: resumeData.education[0].institution,
      graduationDate: resumeData.education[0].graduationDate
    } : null,
    projects: resumeData.projects?.slice(0, 2).map(p => ({
      name: p.name,
      description: p.description?.substring(0, 150)
    })),
    certifications: resumeData.certifications?.slice(0, 3).map(c => c.name)
  };
  
  const prompt = `You are an expert cover letter writer who creates compelling, personalized cover letters that get interviews.

JOB APPLICATION:
Position: ${jobTitle}${companyText}
${hiringManager ? `Hiring Manager: ${hiringManager}` : ''}

${jobRequirements ? `JOB REQUIREMENTS (from job description):
Key Responsibilities: ${jobRequirements.keyResponsibilities?.join(', ')}
Required Skills: ${jobRequirements.requiredSkills?.join(', ')}
Company Values: ${jobRequirements.companyValues?.join(', ')}
Important Keywords: ${jobRequirements.keywords?.join(', ')}

⚠️ CRITICAL: Address these specific requirements in the cover letter!
` : ''}

CANDIDATE PROFILE:
Name: ${resumeAnalysis.name}
Current Role: ${resumeAnalysis.currentRole}
Years of Experience: ${resumeAnalysis.yearsOfExperience}+

Recent Experience:
${resumeAnalysis.recentExperience?.map((exp, i) => `${i + 1}. ${exp.position} at ${exp.company}
   - ${exp.description}
   - Key achievements: ${exp.achievements.join(', ') || 'Multiple accomplishments'}`).join('\n')}

Top Skills:
${resumeAnalysis.topSkills?.map(s => `- ${s.category}: ${s.items?.join(', ')}`).join('\n')}

Education: ${resumeAnalysis.education ? `${resumeAnalysis.education.degree} from ${resumeAnalysis.education.institution}` : 'Not specified'}

${resumeAnalysis.projects?.length > 0 ? `Notable Projects:\n${resumeAnalysis.projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}` : ''}

${resumeAnalysis.certifications?.length > 0 ? `Certifications: ${resumeAnalysis.certifications.join(', ')}` : ''}

${customPrompt ? `\n🎯 CUSTOM INSTRUCTIONS (HIGHEST PRIORITY):\n${customPrompt}\n\nFollow these instructions precisely while maintaining professional quality.\n` : ''}

WRITING REQUIREMENTS:

1. STRUCTURE:
   - Write EXACTLY ${paragraphCount} paragraph${paragraphCount > 1 ? 's' : ''} (body only, excluding greeting and closing)
   ${wordLimit ? `- Keep total length around ${wordLimit} words` : '- Keep it concise and impactful (250-350 words ideal)'}
   - Use ${toneDescription} tone throughout

2. CONTENT FOCUS:
   ${jobRequirements ? `- MUST address the job requirements listed above
   - Match candidate's experience to specific responsibilities
   - Highlight skills that align with required skills
   - Use keywords from the job description naturally` : ''}
   ${focusAreas.length > 0 ? `- Emphasize: ${focusAreas.join(', ')}` : '- Highlight relevant experience, skills, and enthusiasm for the role'}
   - Include specific examples and achievements from their background (use STAR method when possible)
   - Show genuine interest in the company and position
   - Demonstrate value they'll bring to the role
   - Use quantifiable results when possible (percentages, numbers, impact)
   - Tell a compelling story, not just list qualifications

3. PARAGRAPH STRUCTURE (for ${paragraphCount} paragraphs):
   ${paragraphCount === 1 ? `- Single powerful paragraph covering: interest in role, key qualifications, and enthusiasm` : ''}
   ${paragraphCount === 2 ? `- Paragraph 1: Express interest and highlight 2-3 key qualifications
   - Paragraph 2: Demonstrate value and express enthusiasm for next steps` : ''}
   ${paragraphCount === 3 ? `- Paragraph 1: Strong opening expressing interest and mentioning 1-2 key qualifications
   - Paragraph 2: Detailed examples of relevant experience and achievements
   - Paragraph 3: Express enthusiasm, cultural fit, and call to action` : ''}
   ${paragraphCount >= 4 ? `- Paragraph 1: Compelling opening and interest in the role
   - Paragraph 2: Relevant experience and technical skills
   - Paragraph 3: Achievements and impact with specific examples
   - Paragraph 4: Cultural fit, enthusiasm, and call to action` : ''}

4. FORMAT REQUIREMENTS:
   - DO NOT include header (name, contact, date) - this is added automatically
   - Start with: "${greeting}"
   - Add blank line after greeting
   - Add blank line between each paragraph
   - Add blank line before closing
   - End with: "Sincerely,\n${fullName}"
   - Use actual line breaks, NOT literal "\\n" text

5. QUALITY STANDARDS:
   - ATS-friendly language with relevant keywords ${jobRequirements ? '(especially from job description)' : ''}
   - Professional yet personable tone
   - No clichés or generic statements ("I am writing to apply", "I am a hard worker", etc.)
   - Specific to this candidate and role
   - Compelling and memorable opening hook
   - Action-oriented language with strong verbs
   - Shows research/knowledge about the role
   - Use storytelling and specific examples
   - Demonstrate cultural fit and enthusiasm
   - End with a confident call to action

EXAMPLE FORMAT:
${greeting}

[Paragraph 1: Compelling opening with specific qualifications]

[Paragraph 2: Detailed experience and achievements]

${paragraphCount >= 3 ? '[Paragraph 3: Value proposition and enthusiasm]\n' : ''}${paragraphCount >= 4 ? '[Paragraph 4: Cultural fit and call to action]\n' : ''}
Sincerely,
${fullName}

Write a cover letter that will make the hiring manager want to interview this candidate immediately!`;

  try {
    let letterBody = await callGeminiAPI(prompt, { timeout: 30000, maxRetries: 2 });
    
    // Convert literal \n to actual line breaks if AI returned them as text
    letterBody = letterBody.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
    
    return `${header}${letterBody}`;
  } catch (error) {
    console.error('Cover letter generation failed:', error);
    
    // Provide fallback only in development
    if (process.env.NODE_ENV !== 'production') {
      const fallbackBody = `${greeting},

I am writing to express my strong interest in the ${jobTitle} position${companyText}. With my background in ${resumeData.experience?.[0]?.position || 'software development'} and proven track record of success, I am confident I would be a valuable addition to your team.

In my current role at ${resumeData.experience?.[0]?.company || 'my current company'}, I have successfully delivered multiple projects and consistently exceeded expectations. My technical skills combined with my problem-solving abilities make me an ideal candidate for this position.

I am excited about the opportunity to contribute to your organization and would welcome the chance to discuss how my skills and experience align with your needs.

Sincerely,
${fullName}`;
      
      return `${header}${fallbackBody}`;
    }
    throw error;
  }
};

export const generatePortfolioContent = async (userData, customPrompt = '') => {
  // Analyze the user's request to understand intent
  const hasSpecificRequest = customPrompt && customPrompt.trim().length > 0;
  const fillAllRequest = customPrompt.toLowerCase().includes('fill all') || 
                         customPrompt.toLowerCase().includes('complete') || 
                         customPrompt.toLowerCase().includes('generate everything') ||
                         customPrompt.toLowerCase().includes('generate all') ||
                         customPrompt.toLowerCase().includes('fill everything') ||
                         customPrompt.toLowerCase().includes('all data') ||
                         customPrompt.toLowerCase().includes('all details') ||
                         customPrompt.toLowerCase().includes('all form') ||
                         customPrompt.toLowerCase().includes('fill') && customPrompt.toLowerCase().includes('data') ||
                         customPrompt.toLowerCase().includes('generate') && !customPrompt.toLowerCase().includes('project') && !customPrompt.toLowerCase().includes('skill') ||
                         customPrompt.toLowerCase().match(/^(fill|generate|create)$/i);
  
  // Extract current data for context
  const currentHero = userData?.content?.hero || {};
  const currentAbout = userData?.content?.about || '';
  const currentSkills = userData?.content?.skills || [];
  const currentProjects = userData?.content?.projects || [];
  const currentServices = userData?.content?.services || [];
  const currentTestimonials = userData?.content?.testimonials || [];
  
  // Analyze user intent
  const lowerPrompt = customPrompt.toLowerCase();
  const isEnhanceRequest = lowerPrompt.includes('enhance') || lowerPrompt.includes('improve') || lowerPrompt.includes('better');
  const isAddRequest = lowerPrompt.includes('add') || lowerPrompt.includes('create') || lowerPrompt.includes('more');
  const isFieldSpecific = lowerPrompt.includes('about') || lowerPrompt.includes('hero') || lowerPrompt.includes('project') || 
                          lowerPrompt.includes('skill') || lowerPrompt.includes('service') || lowerPrompt.includes('testimonial') ||
                          lowerPrompt.includes('education') || lowerPrompt.includes('certification') ||
                          lowerPrompt.includes('frontend') || lowerPrompt.includes('backend') || lowerPrompt.includes('technology');

  // Check if portfolio has existing data
  const hasExistingData = currentAbout || currentSkills.length > 0 || currentProjects.length > 0 || 
                          currentServices.length > 0 || Object.keys(currentHero).length > 0;
  
  // Check if multiple items are requested in one prompt
  const multipleItemsRequested = (lowerPrompt.match(/project|skill|service|testimonial|about|hero/g) || []).length > 1;
  
  let instructions = '';
  let shouldPreserveExisting = false;
  
  if (fillAllRequest) {
    instructions = 'Generate COMPLETE portfolio with ALL sections filled.';
  } else if (hasSpecificRequest && multipleItemsRequested) {
    // Handle multiple items in one request
    shouldPreserveExisting = hasExistingData;
    const parts = [];
    
    if (lowerPrompt.includes('project')) {
      const numberMatch = lowerPrompt.match(/(\d+)\s*project/);
      const count = numberMatch ? parseInt(numberMatch[1]) : 2;
      parts.push(`Generate EXACTLY ${count} projects (no more, no less)`);
      if (hasExistingData && currentProjects.length > 0) {
        parts.push(`Current projects count: ${currentProjects.length}. Keep them and add ${count} more for total of ${currentProjects.length + count}`);
      }
    }
    if (lowerPrompt.includes('skill')) {
      const numberMatch = lowerPrompt.match(/(\d+)\s*skill/);
      const count = numberMatch ? parseInt(numberMatch[1]) : 2;
      parts.push(`Generate EXACTLY ${count} skill categories`);
    }
    if (lowerPrompt.includes('service')) {
      const numberMatch = lowerPrompt.match(/(\d+)\s*service/);
      const count = numberMatch ? parseInt(numberMatch[1]) : 2;
      parts.push(`Generate EXACTLY ${count} services`);
    }
    if (lowerPrompt.includes('testimonial')) {
      const numberMatch = lowerPrompt.match(/(\d+)\s*testimonial/);
      const count = numberMatch ? parseInt(numberMatch[1]) : 2;
      parts.push(`Generate EXACTLY ${count} testimonials (no more, no less)`);
      if (hasExistingData && currentTestimonials.length > 0) {
        parts.push(`Current testimonials count: ${currentTestimonials.length}. Keep them and add ${count} more for total of ${currentTestimonials.length + count}`);
      }
    }
    
    instructions = parts.join('. ') + `. CRITICAL: Follow the EXACT numbers specified. Do not generate more or less than requested.`;
  } else if (hasSpecificRequest) {
    // Only preserve existing data if there IS existing data
    shouldPreserveExisting = hasExistingData;
    
    if (lowerPrompt.includes('about') && !lowerPrompt.includes('project') && !lowerPrompt.includes('skill')) {
      if (hasExistingData) {
        instructions = `ONLY generate/update the about section. Leave ALL other fields (hero, skills, projects, services, testimonials) EMPTY or unchanged.`;
      } else {
        instructions = `Generate ONLY the about section. Return empty strings for hero fields, empty arrays for skills/projects/services/testimonials.`;
      }
    } else if (lowerPrompt.includes('hero') && !lowerPrompt.includes('about')) {
      if (hasExistingData) {
        instructions = `ONLY generate/update hero section. Leave ALL other fields unchanged.`;
      } else {
        instructions = `Generate ONLY hero section. Return empty string for about, empty arrays for skills/projects/services/testimonials.`;
      }
    } else if (isAddRequest && (lowerPrompt.includes('skill') || lowerPrompt.includes('frontend') || lowerPrompt.includes('backend') || lowerPrompt.includes('technology'))) {
      // Extract number from prompt
      const numberMatch = lowerPrompt.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/);
      const numberMap = {one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10};
      const requestedCount = numberMatch ? (numberMap[numberMatch[1]] || parseInt(numberMatch[1])) : 2;
      instructions = `ADD exactly ${requestedCount} new skill categories. ${hasExistingData ? `Current skills: ${JSON.stringify(currentSkills)}. Keep ALL existing skill categories and ADD exactly ${requestedCount} new ones. Total should be ${currentSkills.length + requestedCount} skill categories.` : `Generate exactly ${requestedCount} skill categories.`}`;
    } else if (isAddRequest && lowerPrompt.includes('project')) {
      // Extract number from prompt
      const numberMatch = lowerPrompt.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/);
      const numberMap = {one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10};
      const requestedCount = numberMatch ? (numberMap[numberMatch[1]] || parseInt(numberMatch[1])) : 2;
      instructions = `ADD exactly ${requestedCount} new projects. ${hasExistingData ? `Current projects: ${JSON.stringify(currentProjects)}. Keep ALL existing projects and ADD exactly ${requestedCount} new ones. Total should be ${currentProjects.length + requestedCount} projects.` : `Generate exactly ${requestedCount} new projects.`}`;
    } else if (isAddRequest && lowerPrompt.includes('service')) {
      // Extract number from prompt
      const numberMatch = lowerPrompt.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/);
      const numberMap = {one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10};
      const requestedCount = numberMatch ? (numberMap[numberMatch[1]] || parseInt(numberMatch[1])) : 2;
      instructions = `ADD exactly ${requestedCount} new services. ${hasExistingData ? `Current services: ${JSON.stringify(currentServices)}. Keep ALL existing services and ADD exactly ${requestedCount} new ones. Total should be ${currentServices.length + requestedCount} services.` : `Generate exactly ${requestedCount} new services.`}`;
    } else if (isAddRequest && lowerPrompt.includes('testimonial')) {
      // Extract number from prompt
      const numberMatch = lowerPrompt.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/);
      const numberMap = {one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10};
      const requestedCount = numberMatch ? (numberMap[numberMatch[1]] || parseInt(numberMatch[1])) : 2;
      instructions = `ADD exactly ${requestedCount} new testimonials. ${hasExistingData ? `Current testimonials: ${JSON.stringify(currentTestimonials)}. Keep ALL existing testimonials and ADD exactly ${requestedCount} new ones. Total should be ${currentTestimonials.length + requestedCount} testimonials.` : `Generate exactly ${requestedCount} new testimonials.`}`;
    } else {
      instructions = `User request: "${customPrompt}". ${hasExistingData ? 'Modify ONLY what is requested. Keep everything else unchanged.' : 'Generate only what is requested.'}`;
    }
  } else {
    instructions = 'Enhance existing content while keeping the structure.';
  }

  let prompt = `You are a portfolio content editor. ${instructions}

${shouldPreserveExisting ? `
CRITICAL: You MUST return ALL existing data EXACTLY as is, except for the specific field mentioned.

EXISTING DATA (COPY THESE EXACTLY - DO NOT MODIFY):
Hero: ${JSON.stringify(currentHero)}
About: "${currentAbout}"
Skills: ${JSON.stringify(currentSkills)}
Projects: ${JSON.stringify(currentProjects)}
Services: ${JSON.stringify(currentServices)}
Testimonials: ${JSON.stringify(currentTestimonials)}

ONLY modify the field mentioned in the request. Copy all other fields EXACTLY as shown above.
` : `
If generating only specific fields, leave other fields as empty strings or empty arrays.
For example, if only generating "about", return:
- about: "generated content"
- hero: {"title": "", "subtitle": "", "description": "", "roles": ""}
- skills: []
- projects: []
- services: []
- testimonials: []
`}

CRITICAL RULES:
- Keep ALL text SHORT (under 120 chars per field)
- NO quotes or apostrophes in strings - use simple words
- Use \\n for line breaks
- Return ONLY valid JSON - no markdown, no explanations
- Keep testimonials array to MAX 3 items
- Keep projects array to MAX 4 items
- Keep services array to MAX 3 items
- Keep skills array to MAX 4 categories

Return complete JSON with this EXACT structure:

{
  "hero": {
    "title": "Full name",
    "subtitle": "Professional title under 100 chars",
    "description": "Short pitch under 150 chars",
    "roles": "3-4 roles with \\n separator"
  },
  "about": "Professional background in 2-3 short paragraphs. Max 500 chars total.",
  "aboutSubtitle": "Short tagline under 50 chars",
  "personalNote": "Philosophy in 1 sentence under 100 chars",
  "whatIDo": "3-4 activities with \\n separator. Each under 80 chars",
  "education": "2 entries: Degree | University | Year with \\n separator",
  "certifications": "2 entries: Cert | Provider | Date with \\n separator",
  "stats": "3 stats: Number | + | Label with \\n separator",
  "skills": [
    {"category": "Frontend", "items": ["React", "Vue", "Angular", "TypeScript", "Next.js"]},
    {"category": "Backend", "items": ["Node.js", "Python", "Express", "Django", "GraphQL"]},
    {"category": "Database", "items": ["MongoDB", "PostgreSQL", "Redis", "MySQL"]},
    {"category": "DevOps", "items": ["Docker", "AWS", "CI/CD", "Kubernetes"]}
  ],
  "services": [
    {"title": "Service name", "description": "Short desc under 120 chars", "icon": "CodeBracketIcon", "badge": "Popular", "deliverables": "Item1\\nItem2\\nItem3"}
  ],
  "projects": [
    {"name": "Project name", "description": "Short desc under 120 chars", "technologies": ["React", "Node", "MongoDB"], "features": "Feature1\\nFeature2\\nFeature3", "tags": ["Recent", "Full-Stack"], "liveLink": "", "githubLink": ""}
  ],
  "testimonials": [
    {"name": "Name", "role": "Role", "company": "Company", "text": "Short testimonial under 120 chars", "rating": 5, "projectType": "E-Commerce", "image": "https://ui-avatars.com/api/?name=John+Doe&background=a855f7&color=fff"}
  ],
  "footerDescription": "Footer text under 100 chars",
  "contact": {
    "email": "email@example.com",
    "phone": "+1234567890",
    "linkedin": "https://linkedin.com/in/username",
    "github": "https://github.com/username"
  }
}

Rules:
- Use \\n for line breaks in strings
- Keep descriptions under 200 characters
- All strings must be properly escaped
- Return valid JSON only`;

  try {
    console.log('=== CALLING GEMINI API ===');
    const result = await callGeminiAPI(prompt);
    console.log('=== GEMINI API RESPONSE RECEIVED ===');
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedResult = result.trim();
    console.log('Cleaned result length:', cleanedResult.length);
    if (cleanedResult.startsWith('```json')) {
      cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/```\n?/g, '');
    }
    
    // Try to parse JSON, if it fails, log the error and retry with simpler prompt
    let parsed;
    try {
      parsed = JSON.parse(cleanedResult);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      console.log('Raw response preview:', cleanedResult.substring(0, 500));
      console.log('Attempting to fix JSON...');
      
      // Try to fix common JSON issues
      try {
        // Remove any trailing commas
        cleanedResult = cleanedResult.replace(/,(\s*[}\]])/g, '$1');
        
        // Try to fix unterminated strings by finding the last complete object
        const errorMatch = parseError.message.match(/position (\d+)/);
        if (errorMatch && parseError.message.includes('Unterminated string')) {
          const pos = parseInt(errorMatch[1]);
          console.log('Unterminated string at position:', pos);
          
          // Find the last complete closing brace before the error
          let lastValidPos = pos;
          let braceCount = 0;
          for (let i = pos - 1; i >= 0; i--) {
            if (cleanedResult[i] === '}') {
              braceCount++;
              if (braceCount === 1) {
                lastValidPos = i + 1;
                break;
              }
            } else if (cleanedResult[i] === '{') {
              braceCount--;
            }
          }
          
          // Truncate to last valid position and close the JSON
          cleanedResult = cleanedResult.substring(0, lastValidPos);
          console.log('Truncated to last valid position. New length:', cleanedResult.length);
        }
        
        // Try parsing again
        parsed = JSON.parse(cleanedResult);
        console.log('✅ JSON repaired successfully!');
      } catch (secondError) {
        console.error('Still failed after cleanup.');
        console.error('Error:', secondError.message);
        // Log the problematic part
        const errorMatch2 = secondError.message.match(/position (\d+)/);
        if (errorMatch2) {
          const pos = parseInt(errorMatch2[1]);
          console.log('Error near:', cleanedResult.substring(Math.max(0, pos - 100), pos + 100));
        }
        throw new Error('AI generated invalid JSON. The response contains syntax errors. Please try again.');
      }
    }
    
    // Normalize field names (AI sometimes capitalizes them)
    const normalizedParsed = {};
    for (const key in parsed) {
      const lowerKey = key.toLowerCase();
      normalizedParsed[lowerKey] = parsed[key];
    }
    parsed = normalizedParsed;
    
    // Log what AI generated
    console.log('AI Raw Response Fields:', Object.keys(parsed));
    if (parsed.hero) console.log('Hero Fields:', Object.keys(parsed.hero));
    console.log('Fill All Request:', fillAllRequest);
    console.log('Custom Prompt:', customPrompt);
    
    // ALWAYS validate and ensure all required fields are present (not just for fillAllRequest)
    // This ensures comprehensive data regardless of how AI responds
    console.log('Validating and filling missing fields...');
    console.log('Before validation - aboutSubtitle:', parsed.aboutSubtitle);
    console.log('Before validation - personalNote:', parsed.personalNote);
    console.log('Before validation - whatIDo:', parsed.whatIDo);
    
    // Ensure all required fields exist - be aggressive about filling missing fields
    if (!parsed.hero) parsed.hero = {};
    if (!parsed.hero.roles || parsed.hero.roles.trim() === '') {
      parsed.hero.roles = "Full Stack Developer\\nUI/UX Designer\\nTech Consultant\\nOpen Source Contributor";
    }
    if (!parsed.aboutSubtitle || parsed.aboutSubtitle.trim() === '') {
      parsed.aboutSubtitle = "Crafting Digital Experiences That Matter";
    }
    if (!parsed.personalNote || parsed.personalNote.trim() === '') {
      parsed.personalNote = "I believe in creating elegant solutions that make a real difference in people's lives.";
    }
    if (!parsed.whatIDo || parsed.whatIDo.trim() === '') {
      parsed.whatIDo = "Design and develop modern web applications\\nBuild scalable backend systems with Node.js\\nCreate intuitive user interfaces\\nOptimize performance and user experience\\nMentor junior developers";
    }
    if (!parsed.education || parsed.education.trim() === '') {
      parsed.education = "Bachelor of Computer Science | Stanford University | 2020\\nMaster of Software Engineering | MIT | 2022";
    }
    if (!parsed.certifications || parsed.certifications.trim() === '') {
      parsed.certifications = "AWS Certified Solutions Architect | Amazon Web Services | 2023\\nGoogle Cloud Professional Developer | Google | 2023\\nCertified Kubernetes Administrator | CNCF | 2023";
    }
    if (!parsed.stats || parsed.stats.trim() === '') {
      parsed.stats = "50 | + | Projects Completed\\n5 | + | Years Experience\\n100 | % | Client Satisfaction\\n20 | + | Happy Clients";
    }
    if (!parsed.footerDescription || parsed.footerDescription.trim() === '') {
      parsed.footerDescription = "Full Stack Developer crafting modern web applications with clean code and seamless user experiences.";
    }
    
    // Ensure services array has items with all fields
    if (!parsed.services || parsed.services.length === 0) {
        parsed.services = [
          {
            title: "Web Application Development",
            description: "Build modern, responsive web applications using cutting-edge technologies.",
            icon: "CodeBracketIcon",
            badge: "Popular",
            deliverables: "Custom web application development\\nResponsive UI/UX design\\nAPI integration\\nDatabase optimization\\nDeployment and maintenance"
          },
          {
            title: "Mobile App Development",
            description: "Create cross-platform mobile applications for iOS and Android.",
            icon: "DevicePhoneMobileIcon",
            badge: "New",
            deliverables: "iOS and Android development\\nCross-platform solutions\\nApp store deployment\\nPush notifications\\nOffline functionality"
          },
          {
            title: "E-Commerce Solutions",
            description: "Develop complete e-commerce platforms with payment integration.",
            icon: "ShoppingCartIcon",
            badge: "Premium",
            deliverables: "Custom e-commerce platform\\nPayment gateway integration\\nInventory management\\nAdmin dashboard\\nSEO optimization"
          }
        ];
    } else {
      // Ensure each service has all required fields
      parsed.services = parsed.services.map(service => ({
        ...service,
        icon: service.icon || "CodeBracketIcon",
        badge: service.badge || "",
        deliverables: service.deliverables || "Service deliverable 1\\nService deliverable 2\\nService deliverable 3"
      }));
    }
    
    // Ensure projects have features and tags
    if (parsed.projects && Array.isArray(parsed.projects)) {
      parsed.projects = parsed.projects.map((project, index) => ({
        ...project,
        features: project.features || `Advanced feature ${index + 1}\\nReal-time updates\\nResponsive design\\nSecure authentication\\nPerformance optimized`,
        tags: project.tags && project.tags.length > 0 ? project.tags : ["Recent", "Full-Stack"]
      }));
    } else {
      // If no projects at all, create default ones
      parsed.projects = [{
        name: "E-Commerce Platform",
        description: "Full-featured online shopping platform with payment integration and inventory management.",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        features: "Real-time inventory tracking\\nSecure payment processing\\nAdmin dashboard\\nOrder management",
        tags: ["Recent", "E-commerce", "Full-Stack"],
        liveLink: "",
        githubLink: ""
      }];
    }
    
    // Ensure testimonials exist with all fields
    if (!parsed.testimonials || parsed.testimonials.length === 0) {
        parsed.testimonials = [
          {
            name: "Sarah Johnson",
            role: "CEO",
            company: "TechStart Inc.",
            text: "Outstanding work! Delivered our project ahead of schedule with exceptional quality. Highly professional and responsive throughout the entire process.",
            rating: 5,
            projectType: "E-Commerce",
            image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=a855f7&color=fff"
          },
          {
            name: "Michael Chen",
            role: "Product Manager",
            company: "InnovateLabs",
            text: "Excellent technical skills and great communication. The final product exceeded our expectations and our users love it!",
            rating: 5,
            projectType: "Dashboard",
            image: "https://ui-avatars.com/api/?name=Michael+Chen&background=ec4899&color=fff"
          },
          {
            name: "Emily Rodriguez",
            role: "Founder",
            company: "Creative Studio",
            text: "Built our portfolio website with stunning design and smooth animations. Very professional and easy to work with.",
            rating: 5,
            projectType: "Portfolio",
            image: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=10b981&color=fff"
          }
        ];
    } else {
      // Ensure each testimonial has all required fields
      parsed.testimonials = parsed.testimonials.map(testimonial => ({
        ...testimonial,
        rating: testimonial.rating || 5,
        projectType: testimonial.projectType || "Web Development",
        image: testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name || 'User')}&background=a855f7&color=fff`
      }));
    }
    
    console.log('After validation - aboutSubtitle:', parsed.aboutSubtitle);
    console.log('After validation - services count:', parsed.services?.length);
    console.log('After validation - testimonials count:', parsed.testimonials?.length);
    console.log('Validation complete. All required fields present.');
    
    // Convert escaped newlines to actual newlines in string fields
    const convertNewlines = (obj) => {
      if (typeof obj === 'string') {
        return obj.replace(/\\n/g, '\n');
      }
      if (Array.isArray(obj)) {
        return obj.map(item => convertNewlines(item));
      }
      if (obj && typeof obj === 'object') {
        const converted = {};
        for (const key in obj) {
          converted[key] = convertNewlines(obj[key]);
        }
        return converted;
      }
      return obj;
    };
    
    const finalParsed = convertNewlines(parsed);
    console.log('After newline conversion - whatIDo:', finalParsed.whatIDo);
    
    return finalParsed;
  } catch (error) {
    console.error('=== PORTFOLIO GENERATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Don't use fallback - throw the error so user knows AI generation failed
    throw new Error('AI generation failed. Please try again or check your API configuration.');
  }
};

// Mock response helper
function getMockResumeEnhancement(resumeData) {
  return `
**PROFESSIONAL SUMMARY**
Results-driven professional with expertise in ${resumeData.skills?.[0]?.items || 'various technologies'}. Proven track record of delivering high-quality solutions and exceeding expectations.

**WORK EXPERIENCE**

${resumeData.experience?.[0]?.company || 'Company Name'} - ${resumeData.experience?.[0]?.position || 'Position'}
• Spearheaded development initiatives resulting in 30% improvement in efficiency
• Collaborated with cross-functional teams to deliver projects on time and within budget
• Implemented best practices and coding standards across the organization
• Mentored junior team members and conducted code reviews

**KEY ACHIEVEMENTS**
• Increased productivity by 25% through process optimization
• Successfully delivered 10+ projects with 100% client satisfaction
• Reduced system downtime by 40% through proactive monitoring

**TECHNICAL SKILLS**
${resumeData.skills?.[0]?.items || 'JavaScript, React, Node.js, MongoDB, Git'}

*Note: This is an AI-enhanced version optimized for ATS systems*
`;
}

// Parse resume from uploaded file using AI
export const parseResumeFromFile = async (file) => {
  try {
    let extractedText = '';
    
    // Extract text based on file type
    if (file.mimetype === 'application/pdf') {
      // Parse PDF
      const pdfData = await pdfParse(file.buffer);
      extractedText = pdfData.text;
    } else if (file.mimetype.includes('word')) {
      // Parse Word document
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    } else {
      throw new Error('Unsupported file type');
    }
    
    // Use AI to parse the extracted text into structured data
    const prompt = `You are a resume parser. Extract information from this resume text and return it as JSON.

Resume Text:
${extractedText}

Extract and return ONLY valid JSON in this exact format:
{
  "personalInfo": {
    "fullName": "extract full name",
    "email": "extract email",
    "phone": "extract phone number",
    "location": "extract location/address"
  },
  "summary": "extract professional summary or objective",
  "experience": [
    {
      "position": "job title",
      "company": "company name",
      "startDate": "start date",
      "endDate": "end date or Present",
      "description": "job responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "university/college name",
      "graduationDate": "graduation year"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}

Return ONLY the JSON, no markdown or explanations.`;

    console.log('🤖 Parsing resume with AI...');
    const response = await callGeminiAPI(prompt);
    
    // Parse the JSON response
    let parsedData;
    try {
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanedResponse);
      console.log('✅ Resume parsed successfully:', parsedData.personalInfo?.fullName);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }
    
    return {
      ...parsedData,
      uploadedFile: true,
      fileName: file.originalname
    };
    
  } catch (error) {
    console.error('❌ Resume parsing error:', error);
    throw error;
  }
};

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
      maxOutputTokens: 2048,
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
  
  // Extract current data for context
  const currentHero = userData?.content?.hero || {};
  const currentAbout = userData?.content?.about || '';
  const currentSkills = userData?.content?.skills || [];
  const currentProjects = userData?.content?.projects || [];
  
  let prompt = `You are an expert portfolio content writer and AI assistant with the ability to understand and execute specific user requests.

CURRENT PORTFOLIO DATA:
Hero: ${JSON.stringify(currentHero)}
About: ${currentAbout}
Skills: ${JSON.stringify(currentSkills)}
Projects: ${JSON.stringify(currentProjects)}

${hasSpecificRequest ? `
USER'S REQUEST: "${customPrompt}"

CRITICAL TASK ANALYSIS:
1. READ the user's request carefully
2. UNDERSTAND what they want:
   - ADD = append new items to existing content
   - CREATE = generate new items
   - IMPROVE/ENHANCE = modify existing content
   - REMOVE = delete specific items
3. EXECUTE the request precisely
4. PRESERVE all existing content unless specifically asked to change it

EXAMPLES:
Request: "Add React and TypeScript to my skills"
→ Keep ALL existing skills, ADD React and TypeScript to appropriate category

Request: "Create a project about e-commerce"  
→ Keep ALL existing projects, ADD 1 new e-commerce project

Request: "Add 3 more web development projects"
→ Keep ALL existing projects, ADD 3 new web development projects

Request: "Make my about section more professional"
→ Keep hero and all other sections, ONLY rewrite about section

Request: "Improve project descriptions"
→ Keep all projects, ONLY enhance their descriptions
` : `
TASK: Generate professional portfolio content. If sections are empty, create compelling content. If sections have content, enhance it.
`}

CRITICAL OUTPUT REQUIREMENTS:
1. Return ONLY valid JSON (no markdown, no code blocks, no backticks)
2. Start directly with { and end with }
3. Use this EXACT structure:

{
  "hero": {
    "title": "${currentHero.title || 'Your Name'}",
    "subtitle": "${currentHero.subtitle || 'Professional Title'}",
    "description": "${currentHero.description || 'Brief introduction'}"
  },
  "about": "2-3 paragraph about section",
  "skills": [
    {
      "category": "Category Name",
      "items": ["skill1", "skill2", "skill3"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "2-3 sentence description focusing on impact and features",
      "technologies": ["tech1", "tech2"],
      "liveLink": "",
      "githubLink": ""
    }
  ]
}

EXECUTION RULES:
${hasSpecificRequest ? `
- If request mentions "add" or "create": KEEP all existing items + ADD new ones
- If request mentions "improve" or "enhance": MODIFY only the mentioned section
- If request mentions specific skills/projects: ADD them to existing list
- If request mentions a number (e.g., "3 more projects"): ADD exactly that many
- ALWAYS preserve existing content unless explicitly asked to change it
` : `
- If sections are empty, generate professional content
- If sections have content, enhance and improve it
- Keep it concise and impactful
`}

CONTENT GUIDELINES:
- About: 2-3 paragraphs max, professional yet personable
- Skills: Organize by category (Frontend, Backend, Tools, etc.)
- Projects: 2-3 sentences each, focus on impact and technologies
- Be specific and achievement-focused
- Use professional language`;

  try {
    const result = await callGeminiAPI(prompt);
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedResult = result.trim();
    if (cleanedResult.startsWith('```json')) {
      cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/```\n?/g, '');
    }
    
    // Parse to validate JSON
    const parsed = JSON.parse(cleanedResult);
    
    return parsed;
  } catch (error) {
    console.error('Portfolio generation error:', error.message);
    
    if (process.env.NODE_ENV !== 'production') {
      return {
        hero: {
          title: userData?.content?.hero?.title || 'Your Name',
          subtitle: 'Full Stack Developer',
          description: 'Passionate developer with expertise in building modern web applications using cutting-edge technologies.'
        },
        about: 'Dedicated software developer specializing in full-stack web development. Experienced in building scalable applications with modern technologies and best practices. Strong foundation in both frontend and backend development.\n\nPassionate about creating elegant solutions to complex problems. Committed to writing clean, maintainable code and staying current with industry trends.',
        skills: [
          {
            category: 'Frontend Development',
            items: ['React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Next.js']
          },
          {
            category: 'Backend Development',
            items: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs']
          },
          {
            category: 'Tools & DevOps',
            items: ['Git', 'Docker', 'AWS', 'CI/CD', 'Jest']
          }
        ],
        projects: [
          {
            name: 'E-Commerce Platform',
            description: 'Full-featured online shopping platform with authentication, product management, and payment integration. Includes real-time inventory tracking.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux'],
            liveLink: '',
            githubLink: ''
          },
          {
            name: 'Task Management App',
            description: 'Collaborative task management tool with real-time updates and drag-and-drop interface. Supports team collaboration and customizable workflows.',
            technologies: ['Vue.js', 'Firebase', 'Vuex', 'Tailwind CSS'],
            liveLink: '',
            githubLink: ''
          }
        ]
      };
    }
    throw error;
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

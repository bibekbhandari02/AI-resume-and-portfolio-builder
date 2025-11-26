import fetch from 'node-fetch';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

// Helper function to call Gemini API
async function callGeminiAPI(prompt) {
  // Get API key at runtime (after dotenv has loaded)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('✅ Using Gemini API key:', GEMINI_API_KEY.substring(0, 20) + '...');
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

  try {
    console.log('🤖 Calling Gemini API...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('✅ Gemini API response received');
    
    return generatedText;
    
  } catch (error) {
    console.error('❌ Gemini API call failed:', error.message);
    throw error;
  }
}

export const enhanceResume = async (resumeData) => {
  const hasExperience = resumeData.experience?.[0]?.company;
  const hasProjects = resumeData.projects?.[0]?.name;
  
  const prompt = `You are an expert resume writer specializing in ATS-friendly formatting.
Your task is to create compelling resume content using action-oriented bullet points with strong verbs, 
quantified results, and job-specific keywords. Ensure the final output is clean, concise, 
and optimized for Applicant Tracking Systems.

${!hasExperience ? 'NOTE: This is a FRESHER/STUDENT resume with NO work experience. Focus heavily on projects, skills, education, and potential.' : ''}

Resume Data:
Personal Info: ${JSON.stringify(resumeData.personalInfo)}
Education: ${JSON.stringify(resumeData.education)}
${hasExperience ? `Work Experience: ${JSON.stringify(resumeData.experience)}` : 'Work Experience: None (Fresher/Student)'}
${hasProjects ? `Projects: ${JSON.stringify(resumeData.projects)}` : ''}
Skills: ${JSON.stringify(resumeData.skills)}
Certifications: ${JSON.stringify(resumeData.certifications || [])}

Return in this EXACT format with clear section headers:

**Summary**
[Professional summary here - ${!hasExperience ? 'emphasize skills, education, and eagerness to learn' : 'highlight experience and achievements'}]

${hasExperience ? `**Experience**
[Enhanced bullet points for work experience, each starting with *]
* [Bullet point 1]
* [Bullet point 2]
* [Bullet point 3]` : ''}

**Skills**
[Organize skills by category, one per line]
Frontend: [list]
Backend: [list]
Tools: [list]

${hasProjects ? `**Projects**
Project: [Enhanced project name]
Description: [Enhanced description with impact and results]
Technologies: [comma-separated list like: React, Node.js, MongoDB]
${resumeData.projects?.[0]?.github ? 'GitHub: [URL if available]' : ''}
${resumeData.projects?.[0]?.link ? 'Live: [URL if available]' : ''}` : `**Projects**
[Suggest 2-3 project ideas they could add based on their skills]
For each project include:
Project: [Name]
Description: [What it does and impact]
Technologies: [Suggested tech stack]`}

**Education**
[Any enhancements like GPA, achievements, relevant coursework]

${!hasExperience ? '**Tips for Freshers**\n[Specific advice to stand out]' : ''}`;

  try {
    const result = await callGeminiAPI(prompt);
    console.log('✅ Real Gemini AI response used');
    return result;
  } catch (error) {
    console.error('❌ Gemini API Error Details:', error);
    // Fallback to mock response in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Using mock AI response (development mode)');
      return getMockResumeEnhancement(resumeData);
    }
    throw error;
  }
};

export const generateCoverLetter = async (jobTitle, resumeData, companyName = '') => {
  const companyText = companyName ? ` at ${companyName}` : '';
  const prompt = `You are a professional cover letter writer.

Write a professional cover letter for the position: ${jobTitle}${companyText}.

Use the following resume data and customize it to match the role.

Resume: ${JSON.stringify(resumeData)}

Keep it:
- 3 short paragraphs
- Personalized and enthusiastic
- ATS friendly
- Professional tone
- Highlight relevant experience and skills from the resume`;

  try {
    return await callGeminiAPI(prompt);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position${companyText}. With my background in ${resumeData.experience?.[0]?.position || 'software development'} and proven track record of success, I am confident I would be a valuable addition to your team.

In my current role at ${resumeData.experience?.[0]?.company || 'my current company'}, I have successfully delivered multiple projects and consistently exceeded expectations. My technical skills combined with my problem-solving abilities make me an ideal candidate for this position.

I am excited about the opportunity to contribute to your organization and would welcome the chance to discuss how my skills and experience align with your needs.

Sincerely,
${resumeData.personalInfo?.fullName || 'Your Name'}`;
    }
    throw error;
  }
};

export const generatePortfolioContent = async (userData, customPrompt = '') => {
  let prompt = `You are an expert portfolio content writer.

Generate professional portfolio content based on the user's information.`;

  if (customPrompt) {
    prompt += `\n\nUser's Request: "${customPrompt}"\n\nCurrent Data: ${JSON.stringify(userData)}\n\nGenerate content that fulfills their request while maintaining professional quality.`;
  } else {
    prompt += `\n\nUser Data: ${JSON.stringify(userData)}\n\nEnhance and improve their portfolio content.`;
  }

  prompt += `

Return ONLY a valid JSON object (no markdown, no code blocks) in this EXACT format:
{
  "hero": {
    "title": "Full Name",
    "subtitle": "Professional Title (e.g., Full Stack Developer, UI/UX Designer)",
    "description": "Compelling 2-3 sentence introduction highlighting expertise and passion"
  },
  "about": "A concise 2 paragraph about section. First paragraph: 2-3 sentences about background and expertise. Second paragraph: 2-3 sentences about passion and what drives them. Keep it professional and impactful.",
  "skills": [
    {
      "category": "Frontend Development",
      "items": ["React", "Vue.js", "TypeScript", "Tailwind CSS"]
    },
    {
      "category": "Backend Development",
      "items": ["Node.js", "Express", "MongoDB", "PostgreSQL"]
    },
    {
      "category": "Tools & Others",
      "items": ["Git", "Docker", "AWS", "CI/CD"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Concise description of the project (2-3 sentences max). Focus on key features and impact.",
      "technologies": ["React", "Node.js", "MongoDB"],
      "liveLink": "",
      "githubLink": ""
    }
  ]
}

Make the content:
- CONCISE and to the point (no long paragraphs)
- Professional yet personable
- Achievement-focused with specific examples
- Tailored to their field/industry
- Include 2-3 impressive project ideas if no projects provided`;

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
    console.error('Portfolio generation error:', error);
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

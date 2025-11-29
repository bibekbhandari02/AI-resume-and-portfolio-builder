import { callGeminiAPI } from './ai.js';
import { trackEvent } from './analytics.js';

// AI-powered job description analyzer
export const analyzeJobDescription = async (jobDescription, userId = null, req = null) => {
  const prompt = `Analyze this job description and extract key information in a structured format.

JOB DESCRIPTION:
${jobDescription}

Extract and return ONLY valid JSON (no markdown, no code blocks):
{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "location": "location if mentioned",
  "jobType": "full-time/part-time/contract/remote",
  "experienceLevel": "entry/mid/senior",
  "salaryRange": "salary if mentioned",
  "keyResponsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "requiredSkills": ["skill 1", "skill 2", "skill 3"],
  "preferredSkills": ["skill 1", "skill 2"],
  "requiredQualifications": ["qualification 1", "qualification 2"],
  "benefits": ["benefit 1", "benefit 2"],
  "companyValues": ["value 1", "value 2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "atsKeywords": ["ats keyword 1", "ats keyword 2"],
  "summary": "brief 2-3 sentence summary of the role"
}`;

  try {
    const result = await callGeminiAPI(prompt, { timeout: 20000 });
    const cleaned = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    
    // Track analytics
    if (userId) {
      await trackEvent(userId, 'job_description_analyzed', {
        jobTitle: parsed.jobTitle,
        skillsCount: parsed.requiredSkills?.length || 0
      }, req);
    }
    
    return parsed;
  } catch (error) {
    console.error('Job description analysis error:', error);
    throw error;
  }
};

// AI-powered resume-job matching score
export const calculateResumeJobMatch = async (resumeData, jobDescription, userId = null, req = null) => {
  const prompt = `You are an ATS (Applicant Tracking System) analyzer. Compare this resume with the job description and provide a detailed matching score.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Analyze and return ONLY valid JSON (no markdown):
{
  "overallScore": 85,
  "breakdown": {
    "skillsMatch": 90,
    "experienceMatch": 80,
    "educationMatch": 85,
    "keywordsMatch": 88
  },
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword3", "keyword4"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": [
    "Add specific skill X to your resume",
    "Highlight experience with Y",
    "Include keywords: Z"
  ],
  "atsOptimizationTips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ],
  "summary": "Brief summary of the match quality"
}

Score from 0-100 where:
- 90-100: Excellent match
- 75-89: Good match
- 60-74: Fair match
- Below 60: Poor match`;

  try {
    const result = await callGeminiAPI(prompt, { timeout: 25000 });
    const cleaned = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    
    // Track analytics
    if (userId) {
      await trackEvent(userId, 'resume_job_match_calculated', {
        overallScore: parsed.overallScore,
        skillsMatch: parsed.breakdown?.skillsMatch
      }, req);
    }
    
    return parsed;
  } catch (error) {
    console.error('Resume-job matching error:', error);
    throw error;
  }
};

// AI-powered skill gap analysis
export const analyzeSkillGaps = async (currentSkills, targetRole, userId = null, req = null) => {
  const prompt = `Analyze the skill gap between current skills and target role requirements.

CURRENT SKILLS:
${JSON.stringify(currentSkills)}

TARGET ROLE:
${targetRole}

Return ONLY valid JSON (no markdown):
{
  "targetRole": "${targetRole}",
  "currentSkillLevel": "beginner/intermediate/advanced",
  "requiredSkills": [
    {
      "skill": "skill name",
      "importance": "critical/important/nice-to-have",
      "currentLevel": "none/beginner/intermediate/advanced",
      "gap": "description of gap"
    }
  ],
  "learningPath": [
    {
      "phase": "Phase 1: Foundations",
      "duration": "2-3 months",
      "skills": ["skill1", "skill2"],
      "resources": ["resource type 1", "resource type 2"]
    }
  ],
  "quickWins": ["skill you can learn quickly 1", "skill 2"],
  "longTermGoals": ["advanced skill 1", "advanced skill 2"],
  "certifications": ["recommended certification 1", "certification 2"],
  "estimatedTimeToReady": "6-12 months",
  "summary": "Brief assessment of readiness"
}`;

  try {
    const result = await callGeminiAPI(prompt, { timeout: 25000 });
    const cleaned = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    
    // Track analytics
    if (userId) {
      await trackEvent(userId, 'skill_gap_analyzed', {
        targetRole,
        skillsCount: currentSkills.length,
        gapsIdentified: parsed.requiredSkills?.length || 0
      }, req);
    }
    
    return parsed;
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    throw error;
  }
};

// AI-powered interview preparation
export const generateInterviewQuestions = async (jobTitle, resumeData, userId = null, req = null) => {
  const prompt = `Generate interview questions for this candidate based on their resume and the target role.

JOB TITLE: ${jobTitle}

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

Return ONLY valid JSON (no markdown):
{
  "technicalQuestions": [
    {
      "question": "technical question",
      "difficulty": "easy/medium/hard",
      "topic": "topic area",
      "sampleAnswer": "brief sample answer approach"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "behavioral question",
      "framework": "STAR",
      "focusArea": "leadership/teamwork/problem-solving",
      "tips": "tips for answering"
    }
  ],
  "roleSpecificQuestions": [
    {
      "question": "role-specific question",
      "relevance": "why this is asked for this role"
    }
  ],
  "questionsToAsk": [
    "intelligent question to ask interviewer 1",
    "question 2"
  ],
  "preparationTips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ]
}

Generate 5 technical, 5 behavioral, and 3 role-specific questions.`;

  try {
    const result = await callGeminiAPI(prompt, { timeout: 30000 });
    const cleaned = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    
    // Track analytics
    if (userId) {
      await trackEvent(userId, 'interview_questions_generated', {
        jobTitle,
        questionsCount: (parsed.technicalQuestions?.length || 0) + 
                       (parsed.behavioralQuestions?.length || 0) +
                       (parsed.roleSpecificQuestions?.length || 0)
      }, req);
    }
    
    return parsed;
  } catch (error) {
    console.error('Interview questions generation error:', error);
    throw error;
  }
};

// AI-powered LinkedIn profile optimization
export const optimizeLinkedInProfile = async (resumeData, userId = null, req = null) => {
  const prompt = `Transform this resume data into an optimized LinkedIn profile.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

Return ONLY valid JSON (no markdown):
{
  "headline": "compelling LinkedIn headline (120 chars max)",
  "about": "engaging about section (2-3 paragraphs, first-person)",
  "experienceDescriptions": [
    {
      "position": "position title",
      "company": "company name",
      "optimizedDescription": "LinkedIn-optimized description with achievements"
    }
  ],
  "skills": {
    "top5": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "additional": ["skill6", "skill7", "skill8"]
  },
  "featuredSection": [
    "suggestion for featured content 1",
    "suggestion 2"
  ],
  "optimizationTips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ]
}

Make it engaging, keyword-rich, and optimized for LinkedIn's algorithm.`;

  try {
    const result = await callGeminiAPI(prompt, { timeout: 25000 });
    const cleaned = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    
    // Track analytics
    if (userId) {
      await trackEvent(userId, 'linkedin_profile_optimized', {
        sectionsOptimized: Object.keys(parsed).length
      }, req);
    }
    
    return parsed;
  } catch (error) {
    console.error('LinkedIn optimization error:', error);
    throw error;
  }
};

// AI-powered salary negotiation tips
export const generateSalaryNegotiationAdvice = async (jobTitle, experience, location, userId = null, req = null) => {
  const prompt = `Provide salary negotiation advice for this scenario.

JOB TITLE: ${jobTitle}
EXPERIENCE: ${experience} years
LOCATION: ${location}

Return ONLY valid JSON (no markdown):
{
  "marketRate": {
    "min": 50000,
    "max": 80000,
    "median": 65000,
    "currency": "USD",
    "note": "based on market data"
  },
  "negotiationStrategies": [
    "strategy 1",
    "strategy 2",
    "strategy 3"
  ],
  "whatToSay": [
    "script example 1",
    "script example 2"
  ],
  "whatNotToSay": [
    "avoid saying this",
    "avoid this"
  ],
  "benefitsToNegotiate": [
    "benefit 1",
    "benefit 2",
    "benefit 3"
  ],
  "timingTips": [
    "tip 1",
    "tip 2"
  ],
  "redFlags": [
    "red flag to watch for 1",
    "red flag 2"
  ]
}`;

  try {
    const result = await callGeminiAPI(prompt, { timeout: 20000 });
    const cleaned = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    
    // Track analytics
    if (userId) {
      await trackEvent(userId, 'salary_negotiation_advice_generated', {
        jobTitle,
        experience
      }, req);
    }
    
    return parsed;
  } catch (error) {
    console.error('Salary negotiation advice error:', error);
    throw error;
  }
};

export default {
  analyzeJobDescription,
  calculateResumeJobMatch,
  analyzeSkillGaps,
  generateInterviewQuestions,
  optimizeLinkedInProfile,
  generateSalaryNegotiationAdvice
};

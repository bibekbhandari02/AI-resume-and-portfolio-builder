import { callGeminiAPI } from './ai.js';

/**
 * Parse job description to extract key information
 */
export async function parseJobDescription(jobDescription) {
  const prompt = `You are an expert job description analyzer. Analyze this job description and extract structured information.

JOB DESCRIPTION:
${jobDescription}

Extract and return ONLY valid JSON (no markdown, no code blocks) in this EXACT format:
{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "location": "location if mentioned",
  "jobType": "full-time/part-time/contract/remote",
  "experienceLevel": "entry/mid/senior/lead",
  "requiredSkills": {
    "technical": ["skill1", "skill2"],
    "soft": ["Communication", "Problem Solving", "Teamwork"],
    "tools": ["tool1", "tool2"]
  },
  "preferredSkills": {
    "technical": ["skill1", "skill2"],
    "soft": ["Leadership", "Time Management"],
    "tools": ["tool1", "tool2"]
  },
  "responsibilities": ["responsibility1", "responsibility2"],
  "qualifications": {
    "education": ["degree requirement"],
    "experience": "X years",
    "certifications": ["cert1", "cert2"]
  },
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "industryTerms": ["term1", "term2", "term3"]
}

IMPORTANT:
- Extract ALL technical skills mentioned (programming languages, frameworks, tools)
- List each skill SEPARATELY - if job says "Python (Pandas, NumPy)", extract as: ["Python", "Pandas", "NumPy"]
- If job says "SQL", "Excel", "Power BI" - list each one separately
- Identify soft skills (leadership, communication, problem-solving, teamwork, debugging, testing, code reviews, collaboration)
- Look for implicit soft skills in phrases like "work with team", "participate in code reviews", "debugging", "testing"
- Separate required vs preferred/nice-to-have skills
- Extract 10-15 important keywords from the job description (action verbs, key responsibilities, domain terms)
- Extract industry-specific terms
- Be comprehensive but accurate
- Common soft skills to look for: Communication, Problem Solving, Teamwork, Debugging, Testing, Code Reviews, Collaboration, Time Management, Leadership`;

  try {
    const result = await callGeminiAPI(prompt);
    
    // Clean up response
    let cleanedResult = result.trim();
    if (cleanedResult.startsWith('```json')) {
      cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleanedResult);
    
    // Normalize skills - expand "Python (Pandas, NumPy)" into separate skills
    const normalizeSkills = (skills) => {
      if (!skills || !Array.isArray(skills)) return [];
      const normalized = [];
      skills.forEach(skill => {
        const parenMatch = skill.match(/^([^(]+)\s*\(([^)]+)\)$/);
        if (parenMatch) {
          normalized.push(parenMatch[1].trim()); // Main skill
          parenMatch[2].split(',').forEach(sub => normalized.push(sub.trim())); // Sub-skills
        } else {
          normalized.push(skill);
        }
      });
      return normalized;
    };
    
    // Normalize all skill arrays
    if (parsed.requiredSkills) {
      if (parsed.requiredSkills.technical) parsed.requiredSkills.technical = normalizeSkills(parsed.requiredSkills.technical);
      if (parsed.requiredSkills.tools) parsed.requiredSkills.tools = normalizeSkills(parsed.requiredSkills.tools);
      if (parsed.requiredSkills.soft) parsed.requiredSkills.soft = normalizeSkills(parsed.requiredSkills.soft);
    }
    if (parsed.preferredSkills) {
      if (parsed.preferredSkills.technical) parsed.preferredSkills.technical = normalizeSkills(parsed.preferredSkills.technical);
      if (parsed.preferredSkills.tools) parsed.preferredSkills.tools = normalizeSkills(parsed.preferredSkills.tools);
      if (parsed.preferredSkills.soft) parsed.preferredSkills.soft = normalizeSkills(parsed.preferredSkills.soft);
    }
    
    return parsed;
  } catch (error) {
    console.error('Job description parsing error:', error);
    console.error('Raw result:', result);
    throw new Error('Failed to parse job description');
  }
}

/**
 * Extract skills from resume in proper format
 */
function extractResumeSkills(resumeData) {
  // Just collect ALL skills in one flat array - no classification needed!
  const allSkillsList = [];
  
  // Extract from skills section
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    resumeData.skills.forEach(skillGroup => {
      // Handle both array and comma-separated string formats
      let items = [];
      if (Array.isArray(skillGroup.items)) {
        // If it's an array, each item might still be a comma-separated string
        skillGroup.items.forEach(item => {
          if (typeof item === 'string') {
            // Split by comma in case it's a comma-separated string
            items.push(...item.split(',').map(s => s.trim()).filter(Boolean));
          } else {
            items.push(item);
          }
        });
      } else if (typeof skillGroup.items === 'string') {
        items = skillGroup.items.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      items.forEach(item => {
        // Handle skills with parentheses like "Python (Pandas, NumPy)"
        const parenMatch = item.match(/^([^(]+)\s*\(([^)]+)\)$/);
        if (parenMatch) {
          allSkillsList.push(parenMatch[1].trim());
          parenMatch[2].split(',').forEach(s => allSkillsList.push(s.trim()));
        } else {
          allSkillsList.push(item);
        }
      });
    });
  }
  
  // Extract from experience descriptions
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach(exp => {
      if (exp.description) {
        const desc = Array.isArray(exp.description) ? exp.description.join(' ') : exp.description;
        // Extract technical terms
        const techTerms = desc.match(/\b[A-Z][a-z]+(?:\.[a-z]+|JS|SQL|API|AWS|CI\/CD)\b/g) || [];
        techTerms.forEach(term => allSkillsList.push(term));
      }
    });
  }
  
  // Extract from projects
  if (resumeData.projects && Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach(project => {
      if (project.technologies) {
        let techs = [];
        if (Array.isArray(project.technologies)) {
          techs = project.technologies;
        } else if (typeof project.technologies === 'string') {
          techs = project.technologies.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        techs.forEach(tech => allSkillsList.push(tech));
      }
    });
  }
  
  // Deduplicate and return flat list
  return [...new Set(allSkillsList.map(s => s.trim()))].filter(Boolean);
}

/**
 * Better skill matching with fuzzy logic
 */
function calculateSkillMatch(resumeSkills, jobSkills) {
  if (jobSkills.length === 0) return 100;
  
  const matches = jobSkills.filter(jobSkill => {
    const jobLower = jobSkill.toLowerCase().trim();
    
    return resumeSkills.some(resumeSkill => {
      const resumeLower = resumeSkill.toLowerCase().trim();
      
      // Exact match
      if (resumeLower === jobLower) return true;
      
      // Partial match
      if (resumeLower.includes(jobLower) || jobLower.includes(resumeLower)) return true;
      
      // Word-level matching with better logic
      const resumeWords = resumeLower.split(/[\s,.-]+/).filter(w => w.length > 1);
      const jobWords = jobLower.split(/[\s,.-]+/).filter(w => w.length > 1);
      
      // If job skill is single word, check if it exists in resume words
      if (jobWords.length === 1) {
        return resumeWords.some(rw => 
          rw === jobWords[0] || 
          rw.includes(jobWords[0]) || 
          jobWords[0].includes(rw)
        );
      }
      
      // For multi-word skills, check if all significant words match
      const significantJobWords = jobWords.filter(w => w.length > 2);
      if (significantJobWords.length === 0) return false;
      
      const matchedWords = significantJobWords.filter(jw => 
        resumeWords.some(rw => 
          rw === jw || 
          (rw.includes(jw) && jw.length > 2) || 
          (jw.includes(rw) && rw.length > 2)
        )
      );
      
      // Match if at least 50% of significant words match
      return matchedWords.length >= Math.ceil(significantJobWords.length * 0.5);
    });
  });
  
  return Math.round((matches.length / jobSkills.length) * 100);
}

function findMissing(resumeSkills, jobSkills) {
  return jobSkills.filter(jobSkill => {
    const jobLower = jobSkill.toLowerCase().trim();
    
    return !resumeSkills.some(resumeSkill => {
      const resumeLower = resumeSkill.toLowerCase().trim();
      
      // Exact match
      if (resumeLower === jobLower) return true;
      
      // Partial match
      if (resumeLower.includes(jobLower) || jobLower.includes(resumeLower)) return true;
      
      // Word-level matching
      const resumeWords = resumeLower.split(/[\s,.-]+/).filter(w => w.length > 1);
      const jobWords = jobLower.split(/[\s,.-]+/).filter(w => w.length > 1);
      
      // Single word check
      if (jobWords.length === 1) {
        return resumeWords.some(rw => 
          rw === jobWords[0] || 
          rw.includes(jobWords[0]) || 
          jobWords[0].includes(rw)
        );
      }
      
      // Multi-word check
      const significantJobWords = jobWords.filter(w => w.length > 2);
      if (significantJobWords.length === 0) return false;
      
      const matchedWords = significantJobWords.filter(jw => 
        resumeWords.some(rw => 
          rw === jw || 
          (rw.includes(jw) && jw.length > 2) || 
          (jw.includes(rw) && rw.length > 2)
        )
      );
      
      return matchedWords.length >= Math.ceil(significantJobWords.length * 0.5);
    });
  });
}

function calculateKeywordMatch(resumeData, keywords) {
  const resumeText = JSON.stringify(resumeData).toLowerCase();
  const matchedKeywords = keywords.filter(keyword => 
    resumeText.includes(keyword.toLowerCase())
  );
  
  return keywords.length > 0 ? Math.round((matchedKeywords.length / keywords.length) * 100) : 100;
}

function calculateATSScore(metrics) {
  const weights = {
    technicalMatch: 0.35,
    toolsMatch: 0.25,
    softSkillsMatch: 0.15,
    keywordMatch: 0.25
  };
  
  let score = 
    metrics.technicalMatch * weights.technicalMatch +
    metrics.toolsMatch * weights.toolsMatch +
    metrics.softSkillsMatch * weights.softSkillsMatch +
    metrics.keywordMatch * weights.keywordMatch;
  
  if (!metrics.hasRequiredSkills) {
    score *= 0.7;
  }
  
  return Math.round(Math.min(100, Math.max(0, score)));
}

function generateRecommendations(score, missingRequired, missingPreferred, keywordMatch) {
  const recommendations = [];
  
  if (score < 60) {
    recommendations.push({
      type: 'critical',
      message: 'Your resume needs significant improvements to match this job',
      action: 'Consider tailoring your resume or gaining more relevant experience'
    });
  } else if (score < 80) {
    recommendations.push({
      type: 'warning',
      message: 'Your resume is a moderate match but could be improved',
      action: 'Add missing skills and optimize keywords'
    });
  } else {
    recommendations.push({
      type: 'success',
      message: 'Your resume is a strong match for this position!',
      action: 'Consider applying with confidence'
    });
  }
  
  const allMissingRequired = [
    ...missingRequired.technical,
    ...missingRequired.tools,
    ...missingRequired.soft
  ];
  
  if (allMissingRequired.length > 0) {
    recommendations.push({
      type: 'critical',
      message: `Missing ${allMissingRequired.length} required skill(s)`,
      action: `Add these skills if you have them: ${allMissingRequired.slice(0, 5).join(', ')}${allMissingRequired.length > 5 ? '...' : ''}`
    });
  }
  
  const allMissingPreferred = [
    ...missingPreferred.technical,
    ...missingPreferred.tools,
    ...missingPreferred.soft
  ];
  
  if (allMissingPreferred.length > 0 && allMissingPreferred.length <= 5) {
    recommendations.push({
      type: 'info',
      message: `Consider adding ${allMissingPreferred.length} preferred skill(s)`,
      action: `These would strengthen your application: ${allMissingPreferred.join(', ')}`
    });
  }
  
  if (keywordMatch < 70) {
    recommendations.push({
      type: 'warning',
      message: 'Low keyword match - ATS systems may filter out your resume',
      action: 'Incorporate more job-specific keywords naturally throughout your resume'
    });
  }
  
  return recommendations;
}

/**
 * Analyze resume against job description
 */
export async function analyzeResumeMatch(resumeData, jobAnalysis) {
  const resumeSkills = extractResumeSkills(resumeData); // Flat array of all skills
  

  
  // Match against all resume skills regardless of category
  const technicalMatch = calculateSkillMatch(
    resumeSkills,
    [...jobAnalysis.requiredSkills.technical, ...jobAnalysis.preferredSkills.technical]
  );
  
  const toolsMatch = calculateSkillMatch(
    resumeSkills,
    [...jobAnalysis.requiredSkills.tools, ...jobAnalysis.preferredSkills.tools]
  );
  
  const softSkillsMatch = calculateSkillMatch(
    resumeSkills,
    [...jobAnalysis.requiredSkills.soft, ...jobAnalysis.preferredSkills.soft]
  );
  
  const missingRequired = {
    technical: findMissing(resumeSkills, jobAnalysis.requiredSkills.technical),
    tools: findMissing(resumeSkills, jobAnalysis.requiredSkills.tools),
    soft: findMissing(resumeSkills, jobAnalysis.requiredSkills.soft)
  };
  
  const missingPreferred = {
    technical: findMissing(resumeSkills, jobAnalysis.preferredSkills.technical),
    tools: findMissing(resumeSkills, jobAnalysis.preferredSkills.tools),
    soft: findMissing(resumeSkills, jobAnalysis.preferredSkills.soft)
  };
  
  const keywordMatch = calculateKeywordMatch(resumeData, jobAnalysis.keywords);
  
  const atsScore = calculateATSScore({
    technicalMatch,
    toolsMatch,
    softSkillsMatch,
    keywordMatch,
    hasRequiredSkills: missingRequired.technical.length === 0 && missingRequired.tools.length === 0
  });
  
  return {
    overallScore: atsScore,
    breakdown: {
      technicalSkills: technicalMatch,
      tools: toolsMatch,
      softSkills: softSkillsMatch,
      keywords: keywordMatch
    },
    matchedSkills: {
      technical: resumeSkills.filter(s => 
        [...jobAnalysis.requiredSkills.technical, ...jobAnalysis.preferredSkills.technical]
          .some(js => {
            const sLower = s.toLowerCase();
            const jsLower = js.toLowerCase();
            return sLower.includes(jsLower) || jsLower.includes(sLower);
          })
      ),
      tools: resumeSkills.filter(s => 
        [...jobAnalysis.requiredSkills.tools, ...jobAnalysis.preferredSkills.tools]
          .some(js => {
            const sLower = s.toLowerCase();
            const jsLower = js.toLowerCase();
            return sLower.includes(jsLower) || jsLower.includes(sLower);
          })
      ),
      soft: resumeSkills.filter(s => 
        [...jobAnalysis.requiredSkills.soft, ...jobAnalysis.preferredSkills.soft]
          .some(js => {
            const sLower = s.toLowerCase();
            const jsLower = js.toLowerCase();
            return sLower.includes(jsLower) || jsLower.includes(sLower);
          })
      )
    },
    missingSkills: {
      required: missingRequired,
      preferred: missingPreferred
    },
    recommendations: generateRecommendations(atsScore, missingRequired, missingPreferred, keywordMatch)
  };
}

/**
 * Intelligently infer missing skills from experience and projects
 */
function inferSkillsFromExperience(resumeData, missingSkills) {
  const inferredSkills = [];
  const allText = JSON.stringify(resumeData).toLowerCase();
  
  missingSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    
    // Check if skill is mentioned in experience or projects
    if (allText.includes(skillLower)) {
      inferredSkills.push(skill);
      return;
    }
    
    // Infer related skills
    const inferences = {
      'debugging': ['debug', 'troubleshoot', 'fix', 'resolve', 'issue'],
      'testing': ['test', 'qa', 'quality', 'validation'],
      'backend services': ['backend', 'api', 'server', 'microservice'],
      'security best practices': ['security', 'authentication', 'authorization', 'jwt', 'auth', 'secure', 'encryption', 'password', 'token'],
      'query optimization': ['query', 'database', 'optimization', 'performance'],
      'system performance optimization': ['performance', 'optimization', 'scalability', 'efficient'],
      'code reviews': ['review', 'code quality', 'best practices'],
      'version control': ['git', 'github', 'version'],
      'collaboration': ['team', 'collaborative', 'agile', 'teamwork'],
      'teamwork': ['team', 'collaborative', 'agile', 'collaboration', 'group', 'together'],
      'problem solving': ['problem', 'solution', 'resolve', 'implement'],
      'communication': ['communicate', 'present', 'document'],
      'automated workflows': ['automat', 'workflow', 'pipeline', 'script', 'process'],
      'scripting': ['script', 'automat', 'python', 'code', 'program'],
      'sql': ['sql', 'query', 'database', 'postgresql', 'mysql'],
      'excel': ['excel', 'spreadsheet', 'data', 'analysis'],
      'python': ['python', 'pandas', 'numpy', 'script']
    };
    
    const keywords = inferences[skillLower] || [];
    if (keywords.some(kw => allText.includes(kw))) {
      inferredSkills.push(skill);
    }
  });
  
  return inferredSkills;
}

/**
 * SMART Tailor resume - Addresses ALL issues
 */
export async function tailorResumeForJob(resumeData, jobAnalysis) {
  // Extract current data
  const currentSummary = resumeData.summary || '';
  const currentSkills = resumeData.skills || [];
  const currentExperience = resumeData.experience || [];
  const currentProjects = resumeData.projects || [];
  
  // Normalize skills
  const normalizedSkills = currentSkills.map(skill => ({
    category: skill.category,
    items: Array.isArray(skill.items) ? skill.items : 
           typeof skill.items === 'string' ? skill.items.split(',').map(s => s.trim()).filter(Boolean) : []
  })).filter(skill => skill.items.length > 0);
  
  // Get all current skills as flat array
  const currentSkillsList = normalizedSkills.flatMap(s => s.items);
  
  // Get missing skills
  const allMissingSkills = [
    ...(jobAnalysis.requiredSkills?.technical || []),
    ...(jobAnalysis.requiredSkills?.tools || []),
    ...(jobAnalysis.requiredSkills?.soft || [])
  ].filter(skill => 
    !currentSkillsList.some(cs => 
      cs.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(cs.toLowerCase())
    )
  );
  
  // Infer skills from experience
  const inferredSkills = inferSkillsFromExperience(resumeData, allMissingSkills);
  
  const prompt = `You are an expert resume writer. Tailor this resume for a ${jobAnalysis.jobTitle} position.

CURRENT RESUME:
Summary: ${currentSummary}

Skills:
${normalizedSkills.map(s => `${s.category}: ${s.items.join(', ')}`).join('\n')}

Experience: ${currentExperience.map(e => `${e.position} at ${e.company}`).join('; ')}

JOB REQUIREMENTS:
Required Technical Skills: ${jobAnalysis.requiredSkills?.technical?.join(', ') || 'None'}
Required Tools: ${jobAnalysis.requiredSkills?.tools?.join(', ') || 'None'}
Required Soft Skills: ${jobAnalysis.requiredSkills?.soft?.join(', ') || 'None'}
Key Responsibilities: ${jobAnalysis.responsibilities?.slice(0, 3).join('; ') || 'None'}

SKILLS TO ADD (inferred from experience):
${inferredSkills.length > 0 ? inferredSkills.join(', ') : 'None - only reorganize existing skills'}

MISSING REQUIRED SKILLS:
${allMissingSkills.slice(0, 5).join(', ')}

CRITICAL INSTRUCTIONS:
1. Rewrite summary to emphasize ${jobAnalysis.jobTitle} skills and experience
2. Create 4 skill categories:
   - "${jobAnalysis.jobTitle} Skills" (job-specific + inferred skills + missing skills if evidence exists)
   - "Technical Skills" (programming, frameworks, databases)
   - "Tools & Technologies" (Git, IDEs, platforms)
   - "Soft Skills" (communication, problem-solving, teamwork, debugging, testing)
3. ADD inferred skills to appropriate categories
4. ADD missing required skills ONLY if there's evidence in experience (e.g., if "Security Best Practices" is missing but user has JWT/authentication experience, ADD it)
5. ALWAYS INCLUDE these soft skills: Problem Solving, Debugging, Testing, Code Reviews, Collaboration, Teamwork, Communication
6. Keep all information truthful - only add skills if evidence exists in experience
7. Use comma-separated format with spaces: "skill1, skill2, skill3" (NOT "skill1,skill2,skill3")

Return ONLY valid JSON (no markdown):
{
  "summary": "Enhanced summary mentioning ${jobAnalysis.jobTitle} and key skills",
  "skills": [
    {
      "category": "${jobAnalysis.jobTitle} Skills",
      "items": "skill1, skill2, skill3"
    },
    {
      "category": "Technical Skills",
      "items": "skill1, skill2, skill3"
    },
    {
      "category": "Tools & Technologies",
      "items": "tool1, tool2, tool3"
    },
    {
      "category": "Soft Skills",
      "items": "Problem Solving, Debugging, Testing, Code Reviews, Collaboration, Teamwork, Communication"
    }
  ]
}

IMPORTANT: Return skills as comma-separated STRINGS, not arrays!`;

  try {
    const result = await callGeminiAPI(prompt, { timeout: 35000 });
    
    let cleanedResult = result.trim();
    if (cleanedResult.startsWith('```json')) {
      cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/```\n?/g, '');
    }
    
    const tailoredData = JSON.parse(cleanedResult);
    
    // Normalize skills format (handle both string and array)
    if (tailoredData.skills && Array.isArray(tailoredData.skills)) {
      tailoredData.skills = tailoredData.skills.map(skill => {
        let items;
        if (Array.isArray(skill.items)) {
          items = skill.items.join(', ');
        } else if (typeof skill.items === 'string') {
          items = skill.items;
        } else {
          items = '';
        }
        
        return {
          category: skill.category || 'Skills',
          items: items
        };
      }).filter(skill => skill.items && skill.items.trim().length > 0);
    }
    
    // Ensure we have soft skills and add missing ones
    let softSkillsCategory = tailoredData.skills?.find(s => 
      s.category.toLowerCase().includes('soft')
    );
    
    if (!softSkillsCategory) {
      // Create soft skills category
      const softSkills = [];
      if (inferredSkills.some(s => s.toLowerCase().includes('debug'))) softSkills.push('Debugging');
      if (inferredSkills.some(s => s.toLowerCase().includes('test'))) softSkills.push('Testing');
      softSkills.push('Problem Solving', 'Code Reviews', 'Collaboration', 'Teamwork', 'Communication');
      
      tailoredData.skills.push({
        category: 'Soft Skills',
        items: softSkills.join(', ')
      });
    } else {
      // Add missing soft skills to existing category
      const currentSoftSkills = typeof softSkillsCategory.items === 'string' 
        ? softSkillsCategory.items.split(',').map(s => s.trim())
        : softSkillsCategory.items;
      
      const standardSoftSkills = ['Problem Solving', 'Debugging', 'Testing', 'Code Reviews', 'Collaboration', 'Teamwork', 'Communication'];
      
      standardSoftSkills.forEach(skill => {
        if (!currentSoftSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))) {
          currentSoftSkills.push(skill);
        }
      });
      
      softSkillsCategory.items = currentSoftSkills.join(', ');
    }
    
    return {
      summary: tailoredData.summary || currentSummary,
      skills: tailoredData.skills || normalizedSkills,
      experience: currentExperience,
      projects: currentProjects
    };
  } catch (error) {
    console.error('Tailoring error:', error);
    
    // Smart fallback - add soft skills
    const fallbackSkills = [...normalizedSkills];
    if (!fallbackSkills.some(s => s.category.toLowerCase().includes('soft'))) {
      fallbackSkills.push({
        category: 'Soft Skills',
        items: 'Problem Solving, Debugging, Testing, Code Reviews, Collaboration, Teamwork, Communication'
      });
    }
    
    return {
      summary: currentSummary,
      skills: fallbackSkills,
      experience: currentExperience,
      projects: currentProjects
    };
  }
}

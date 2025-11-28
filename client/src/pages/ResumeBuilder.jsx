import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Sparkles, Download, Save, ArrowLeft, Eye, X, Trash2, Award, History, Plus, EyeOff, Maximize2, Minimize2, User, Briefcase, GraduationCap, Code, FileText as FileTextIcon } from 'lucide-react';
import api, { trackEvent } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { downloadResumePDF } from '../utils/pdfGenerator';
import ResumePreview from '../components/ResumePreview';
import ResumeScore from '../components/ResumeScore';
import VersionHistory from '../components/VersionHistory';

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [livePreview, setLivePreview] = useState(false); // Real-time side-by-side preview
  const [previewScale, setPreviewScale] = useState(0.6); // Scale for preview
  const [showScore, setShowScore] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [enhancingSection, setEnhancingSection] = useState(null); // Track which section is being enhanced
  const [previousValues, setPreviousValues] = useState(null); // For undo functionality
  const [resumeType, setResumeType] = useState('experienced'); // 'experienced' or 'fresher'
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const { register, handleSubmit, setValue, watch, reset, control } = useForm({
    defaultValues: {
      experience: [{ company: '', position: '', startDate: '', endDate: '', description: [''] }],
      projects: [{ name: '', description: '', technologies: '', link: '', github: '' }],
      certifications: [{ name: '', issuer: '', date: '', link: '' }]
    }
  });
  
  // Field arrays for dynamic sections
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience'
  });
  
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  });
  
  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  });
  const templateToastShown = useRef(false);

  // Map template IDs to display names
  const getTemplateDisplayName = (templateId) => {
    const templateNames = {
      'professional': 'Professional',
      'classic': 'ATS-Friendly',
      'chronological': 'Chronological',
      'modern': 'Modern',
      'creative': 'Creative',
      'minimal': 'Minimal',
      'executive': 'Executive',
      'technical': 'Technical'
    };
    return templateNames[templateId] || templateId;
  };

  useEffect(() => {
    if (id) {
      fetchResume();
    } else {
      // Check if template is specified in URL
      const templateParam = searchParams.get('template');
      if (templateParam && !templateToastShown.current) {
        setSelectedTemplate(templateParam);
        toast.success(`Using ${templateParam} template!`);
        templateToastShown.current = true;
      }
    }
  }, [id, searchParams]);

  // Keyboard shortcut for live preview (Ctrl/Cmd + P)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && window.innerWidth >= 1024) {
        e.preventDefault();
        setLivePreview(prev => !prev);
        toast.success(livePreview ? 'Live preview hidden' : 'Live preview enabled!');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [livePreview]);

  const fetchResume = async () => {
    try {
      const { data } = await api.get(`/resume/${id}`);
      Object.keys(data.resume).forEach(key => {
        setValue(key, data.resume[key]);
      });
      // Set the template if it exists
      if (data.resume.template) {
        setSelectedTemplate(data.resume.template);
      }
    } catch (error) {
      toast.error('Failed to load resume');
    }
  };

  const onSubmit = async (data) => {
    // Check if creating new resume
    if (!id) {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;
    }

    // Auto-generate title from full name if available
    const resumeData = {
      ...data,
      title: data.personalInfo?.fullName 
        ? `${data.personalInfo.fullName}'s Resume` 
        : 'My Resume',
      template: selectedTemplate
    };

    setLoading(true);
    try {
      if (id) {
        await api.put(`/resume/${id}`, resumeData);
        toast.success('Resume updated!');
      } else {
        const response = await api.post('/resume', resumeData);
        toast.success('Resume created!');
        navigate(`/resume/${response.data.resume._id}`);
      }
      
      // Clear undo state after successful save (changes are now permanent)
      setPreviousValues(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save resume');
    } finally {
      setLoading(false);
    }
  };

  // Undo last AI enhancement
  const undoEnhancement = () => {
    if (previousValues) {
      Object.keys(previousValues).forEach(key => {
        setValue(key, previousValues[key]);
      });
      setPreviousValues(null);
      toast.success('Changes undone!');
    }
  };

  // Enhance specific section
  const enhanceSection = async (sectionName) => {
    setEnhancingSection(sectionName);
    // For now, just call the main enhance function
    // In future, can make section-specific API calls
    await enhanceWithAI();
    setEnhancingSection(null);
  };

  const enhanceWithAI = async () => {
    const resumeData = watch();
    
    // Check if there's enough data to enhance
    if (!resumeData.personalInfo?.fullName && !resumeData.experience?.[0]?.company) {
      toast.error('Please fill in some information first');
      return;
    }

    setEnhancing(true);
    try {
      const { data } = await api.post('/ai/enhance-resume', { resumeData });
      
      // Save current values for undo
      const currentValues = {
        summary: resumeData.summary,
        'experience.0.description.0': resumeData.experience?.[0]?.description?.[0],
        'skills.0.items': resumeData.skills?.[0]?.items,
        'projects.0.name': resumeData.projects?.[0]?.name,
        'projects.0.description': resumeData.projects?.[0]?.description,
        'projects.0.technologies': resumeData.projects?.[0]?.technologies,
      };
      setPreviousValues(currentValues);
      
      // Parse AI response and extract useful content
      let aiContent = data.enhanced;
      let updatedSections = [];
      
      // Check if response is JSON (fallback handling)
      let parsedData = null;
      try {
        // Try to extract JSON if it's wrapped in code blocks
        const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else if (aiContent.trim().startsWith('{')) {
          parsedData = JSON.parse(aiContent);
        }
      } catch (e) {
        // Not JSON, continue with markdown parsing
      }
      
      // If we got JSON, convert it to markdown format for parsing
      if (parsedData && parsedData.resume) {
        const resume = parsedData.resume;
        aiContent = '';
        if (resume.Summary) aiContent += `**Summary**\n${resume.Summary}\n\n`;
        if (resume.Skills) aiContent += `**Skills**\n${resume.Skills}\n\n`;
        if (resume.Projects && resume.Projects[0]) {
          const proj = resume.Projects[0];
          aiContent += `**Projects**\nProject: ${proj.name}\nDescription: ${proj.description}\nTechnologies: ${proj.technologies}\n`;
          if (proj.github) aiContent += `GitHub: ${proj.github}\n`;
          if (proj.link) aiContent += `Live: ${proj.link}\n`;
        }
        if (resume.Education && resume.Education[0]) {
          aiContent += `\n**Education**\n${resume.Education[0].degree} in ${resume.Education[0].field}\n`;
        }
      }
      
      // 1. Extract professional summary
      const summaryMatch = aiContent.match(/\*\*Summary\*\*([\s\S]*?)(?=\*\*|$)/i);
      if (summaryMatch && summaryMatch[1]) {
        const summary = summaryMatch[1].trim();
        setValue('summary', summary);
        updatedSections.push('Summary');
      }
      
      // 2. Extract experience bullet points
      const experienceMatch = aiContent.match(/\*\*Experience\*\*([\s\S]*?)(?=\*\*|$)/i);
      if (experienceMatch && experienceMatch[1]) {
        const experienceBullets = experienceMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('*'))
          .map(line => line.replace(/^\*\s*/, '').trim())
          .filter(line => line.length > 0);
        
        if (experienceBullets.length > 0) {
          experienceBullets.forEach((bullet, index) => {
            setValue(`experience.0.description.${index}`, bullet);
          });
          updatedSections.push('Experience');
        }
      }
      
      // 3. Extract and enhance skills
      const skillsMatch = aiContent.match(/\*\*Skills?\*\*([\s\S]*?)(?=\*\*|$)/i);
      if (skillsMatch && skillsMatch[1]) {
        const skillsText = skillsMatch[1].trim();
        // Look for categorized skills format (Frontend:, Backend:, etc.)
        const skillLines = skillsText.split('\n')
          .filter(line => line.trim() && (line.includes(':') || line.trim().startsWith('*') || line.trim().startsWith('-')))
          .map(line => line.replace(/^[\*\-]\s*/, '').trim())
          .filter(line => line.length > 10) // Filter out very short lines
          .join('\n');
        
        if (skillLines) {
          // Update the first skills entry with all organized skills
          setValue('skills.0.category', 'Technical Skills');
          setValue('skills.0.items', skillLines);
          updatedSections.push('Skills');
        }
      }
      
      // 4. Extract and enhance ALL projects intelligently
      const projectsMatch = aiContent.match(/\*\*Projects?\*\*([\s\S]*?)(?=\*\*|$)/i);
      if (projectsMatch && projectsMatch[1]) {
        const projectText = projectsMatch[1].trim();
        console.log('📦 Projects section found:', projectText.substring(0, 200));
        
        // Split into individual projects - look for "Project" followed by number or name
        const projectBlocks = projectText.split(/(?=Project\s*(?:\d+|:))/i).filter(block => block.trim().length > 10);
        console.log('📦 Found', projectBlocks.length, 'project blocks');
        
        // Get current projects from form
        const currentProjects = resumeData.projects || [];
        let projectsUpdated = 0;
        
        // Process each project block
        projectBlocks.forEach((block, blockIndex) => {
          console.log(`\n📦 Processing block ${blockIndex}:`, block.substring(0, 100));
          
          // Try to match with existing projects by index or name
          let targetIndex = blockIndex;
          
          // If we have more blocks than projects, skip extra blocks
          if (targetIndex >= currentProjects.length) return;
          
          const project = currentProjects[targetIndex];
          if (!project) return;
          
          console.log(`📦 Updating project ${targetIndex}: ${project.name}`);
          
          // Extract description - look for text after "Description:" or after project name
          const descMatch = block.match(/Description:\s*([^\n]+(?:\n(?!(?:Technologies?|Project|GitHub|Live):)[^\n]+)*)/i);
          if (descMatch && descMatch[1]) {
            const description = descMatch[1].trim();
            if (description && description.length > 20) {
              console.log('✅ Setting description:', description.substring(0, 50));
              setValue(`projects.${targetIndex}.description`, description);
              projectsUpdated++;
            }
          }
          
          // Extract technologies
          const techMatch = block.match(/(?:Technologies?|Tech Stack):\s*([^\n]+)/i);
          if (techMatch && techMatch[1]) {
            console.log('✅ Setting technologies:', techMatch[1].trim());
            setValue(`projects.${targetIndex}.technologies`, techMatch[1].trim());
          }
          
          // Extract GitHub link (preserve existing)
          if (!project.github) {
            const githubMatch = block.match(/GitHub:\s*(https?:\/\/[^\s\n]+)/i);
            if (githubMatch && githubMatch[1]) {
              setValue(`projects.${targetIndex}.github`, githubMatch[1].trim());
            }
          }
          
          // Extract live link (preserve existing)
          if (!project.link) {
            const liveMatch = block.match(/Live:\s*(https?:\/\/[^\s\n]+)/i);
            if (liveMatch && liveMatch[1]) {
              setValue(`projects.${targetIndex}.link`, liveMatch[1].trim());
            }
          }
        });
        
        if (projectsUpdated > 0) {
          updatedSections.push(`${projectsUpdated} Project(s)`);
        }
      }
      
      // 5. Extract education enhancements
      const educationMatch = aiContent.match(/\*\*Education\*\*([\s\S]*?)(?=\*\*|$)/i);
      if (educationMatch && educationMatch[1]) {
        const eduText = educationMatch[1].trim();
        // Look for GPA or achievements
        const gpaMatch = eduText.match(/GPA[:\s]+([0-9.]+)/i);
        if (gpaMatch && gpaMatch[1] && !resumeData.education?.[0]?.gpa) {
          setValue('education.0.gpa', gpaMatch[1]);
          updatedSections.push('Education');
        }
      }
      
      // Show success message with updated sections and undo option
      const sectionsText = updatedSections.length > 0 
        ? updatedSections.join(', ') 
        : 'various sections';
      
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>✨ Resume optimized! Updated: {sectionsText}</span>
            <button
              onClick={() => {
                undoEnhancement();
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-white text-indigo-600 rounded hover:bg-gray-100 font-medium text-sm"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 8000 }
      );
      
      // Track AI enhancement
      trackEvent('ai_enhancement_used', { 
        type: 'resume',
        resumeId: id,
        sectionsUpdated: updatedSections 
      });
      
      // Don't show modal anymore - changes are auto-applied
      // setAiSuggestions(aiContent);
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'AI enhancement failed';
      toast.error(errorMsg);
      console.error('AI Error:', error);
    } finally {
      setEnhancing(false);
    }
  };

  const checkCredits = async () => {
    try {
      const { data } = await api.get('/user/me');
      if (data.user.credits.resumeGenerations <= 0) {
        toast.error('No resume credits left. Please upgrade your plan.');
        return false;
      }
      return true;
    } catch (error) {
      return true; // Allow if check fails
    }
  };

  const handleDownloadPDF = () => {
    const resumeData = watch();
    
    // Check if there's enough data
    if (!resumeData.personalInfo?.fullName) {
      toast.error('Please fill in your name first');
      return;
    }
    
    try {
      const filename = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      toast.loading('Generating PDF...', { id: 'pdf-download' });
      
      // Track download event
      trackEvent('resume_download', { 
        resumeId: id,
        template: resumeData.template 
      });
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        downloadResumePDF(resumeData, filename);
        toast.success('Resume downloaded successfully!', { id: 'pdf-download' });
      }, 100);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-download' });
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className={`container mx-auto px-4 sm:px-6 transition-all duration-300 ${livePreview ? 'max-w-[95vw]' : 'max-w-4xl'}`}>
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Resume Builder</h1>
                {selectedTemplate && (
                  <p className="text-sm text-gray-600 mt-1">
                    Template: <span className="font-semibold text-indigo-600">{getTemplateDisplayName(selectedTemplate)}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Live Preview Toggle - Desktop Only */}
              <button
                type="button"
                onClick={() => {
                  setLivePreview(!livePreview);
                  if (!livePreview) {
                    toast.success('Live preview enabled! See changes in real-time →', { duration: 3000 });
                  }
                }}
                className="hidden lg:flex items-center gap-2 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm sm:text-base relative group"
                title="Toggle live preview"
              >
                {livePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{livePreview ? 'Hide Live Preview' : 'Live Preview'}</span>
                {!livePreview && (
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    See changes as you type! (Ctrl+P)
                  </span>
                )}
              </button>
              
              {/* Full Preview Modal - All Devices */}
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Full Preview</span>
                <span className="sm:hidden">View</span>
              </button>
              <button
                type="button"
                onClick={() => setShowScore(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
              >
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Check Score</span>
                <span className="sm:hidden">Score</span>
              </button>
              {id && (
                <button
                  type="button"
                  onClick={() => setShowVersions(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Versions</span>
                  <span className="sm:hidden">Ver</span>
                </button>
              )}
              <button
                type="button"
                onClick={enhanceWithAI}
                disabled={enhancing}
                title="AI-powered optimization for 90+ ATS score"
                className="flex items-center gap-2 bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base relative group"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">{enhancing ? 'Optimizing for ATS...' : 'Enhance with AI'}</span>
                <span className="sm:hidden">AI</span>
                {!enhancing && (
                  <span className="hidden lg:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Optimize for 90+ ATS Score
                  </span>
                )}
              </button>
              {previousValues && (
                <button
                  type="button"
                  onClick={undoEnhancement}
                  className="flex items-center gap-2 bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 text-sm sm:text-base"
                  title="Undo last AI enhancement"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Undo AI Changes</span>
                  <span className="sm:hidden">Undo</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Suggestions Modal */}
          {aiSuggestions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold">✨ ATS-Optimized Resume (90+ Score)</h2>
                  <button
                    onClick={() => setAiSuggestions(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-900 mb-2">
                          🎯 AI-Optimized Content Ready (Target: 90+ ATS Score)
                        </p>
                        <p className="text-sm text-gray-700 mb-3">
                          Your resume has been enhanced with:
                        </p>
                        <ul className="text-sm text-gray-700 space-y-1 mb-3">
                          <li>✓ <strong>Strong action verbs</strong> (Engineered, Developed, Implemented)</li>
                          <li>✓ <strong>Quantifiable metrics</strong> (20% increase, 100K+ users)</li>
                          <li>✓ <strong>Industry keywords</strong> for ATS compatibility</li>
                          <li>✓ <strong>Achievement-focused</strong> bullet points</li>
                          <li>✓ <strong>Technical terms</strong> and tools highlighted</li>
                        </ul>
                        <div className="bg-white border border-purple-200 rounded p-3">
                          <p className="text-sm font-medium text-purple-900 mb-1">✅ Auto-Applied to Your Resume!</p>
                          <p className="text-xs text-gray-700 mb-2">
                            The AI has automatically updated your resume fields with optimized content. 
                          </p>
                          <p className="text-xs font-medium text-purple-900 mb-1">📋 Next Steps:</p>
                          <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                            <li>Scroll up to review the updated fields</li>
                            <li>Make any personal adjustments you'd like</li>
                            <li>Click "Check Score" to see your improved ATS score!</li>
                            <li>Save your resume when satisfied</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                      {aiSuggestions}
                    </pre>
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiSuggestions);
                      toast.success('Copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => setAiSuggestions(null)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Preview for PDF Generation */}
          <div className="fixed -left-[9999px] top-0">
            <ResumePreview resumeData={watch()} template={selectedTemplate} />
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
              <style>{`
                @media (max-width: 640px) {
                  .resume-preview-scale { transform: scale(0.35); }
                }
                @media (min-width: 641px) and (max-width: 1024px) {
                  .resume-preview-scale { transform: scale(0.55); }
                }
                @media (min-width: 1025px) and (max-width: 1536px) {
                  .resume-preview-scale { transform: scale(0.75); }
                }
                @media (min-width: 1537px) and (max-width: 1920px) {
                  .resume-preview-scale { transform: scale(0.9); }
                }
                @media (min-width: 1921px) {
                  .resume-preview-scale { transform: scale(1.0); }
                }
              `}</style>
              <div className="bg-white rounded-lg w-full max-w-[95vw] lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] max-h-[95vh] overflow-hidden flex flex-col">
                <div className="bg-white border-b p-3 sm:p-4 flex justify-between items-center flex-shrink-0">
                  <h2 className="text-lg sm:text-xl font-bold">Resume Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-4 lg:p-6">
                  <div className="mx-auto flex justify-center items-start min-h-full">
                    <div 
                      className="bg-white shadow-2xl resume-preview-scale" 
                      style={{ 
                        width: '210mm',
                        minHeight: '297mm',
                        transformOrigin: 'top center',
                      }}
                    >
                      <ResumePreview resumeData={watch()} template={selectedTemplate} />
                    </div>
                  </div>
                </div>
                <div className="bg-white border-t p-3 sm:p-4 flex flex-col sm:flex-row justify-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Info Banner */}
        {livePreview && (
          <div className="hidden lg:block bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  ✨ Live Preview Active - Your changes appear instantly on the right!
                </p>
              </div>
              <button
                onClick={() => setLivePreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area - Side by Side Layout */}
        <div className={`grid gap-4 transition-all duration-300 ${livePreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 overflow-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Resume Type Selector */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Choose Your Resume Type:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div 
                  onClick={() => setResumeType('experienced')}
                  className={`bg-white p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    resumeType === 'experienced' 
                      ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200' 
                      : 'border-transparent hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-indigo-600">👔 Experienced Professional</h4>
                    {resumeType === 'experienced' && (
                      <span className="text-indigo-600 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Have work experience? Focus on achievements and career growth.</p>
                </div>
                <div 
                  onClick={() => setResumeType('fresher')}
                  className={`bg-white p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    resumeType === 'fresher' 
                      ? 'border-purple-500 shadow-md ring-2 ring-purple-200' 
                      : 'border-transparent hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-purple-600">🎓 Student / Fresher</h4>
                    {resumeType === 'fresher' && (
                      <span className="text-purple-600 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">No experience? Highlight projects, skills, and education!</p>
                </div>
              </div>
              {resumeType === 'fresher' && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  💡 <strong>Tip for Freshers:</strong> Focus on filling the Projects section below. Add 2-3 strong projects to make your resume stand out!
                </div>
              )}
            </div>

            {/* Personal Info */}
            <section className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  {...register('personalInfo.fullName')}
                  placeholder="Full Name"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  {...register('personalInfo.email')}
                  type="email"
                  placeholder="Email"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  {...register('personalInfo.phone')}
                  placeholder="Phone"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  {...register('personalInfo.location')}
                  placeholder="Location"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  {...register('personalInfo.linkedin')}
                  placeholder="LinkedIn URL"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  {...register('personalInfo.github')}
                  placeholder="GitHub URL"
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
              
              {/* Profile Image - For Modern Template */}
              {selectedTemplate === 'modern' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image (Optional - For Modern Template)
                  </label>
                  <input
                    {...register('personalInfo.profileImage')}
                    type="url"
                    placeholder="Image URL (e.g., https://example.com/photo.jpg)"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Upload your image to a service like Imgur or use a direct image URL
                  </p>
                </div>
              )}
            </section>

            {/* Summary */}
            <section className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileTextIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Professional Summary</h2>
              </div>
              <textarea
                {...register('summary')}
                rows="4"
                placeholder="Brief professional summary highlighting your key strengths and career goals..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </section>

            {/* Experience */}
            {resumeType === 'experienced' && (
              <section className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => appendExperience({ company: '', position: '', startDate: '', endDate: '', description: [''] })}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Experience</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
                
                {experienceFields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg mb-4 relative">
                    {experienceFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        title="Remove this experience"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    
                    <input
                      {...register(`experience.${index}.company`)}
                      placeholder="Company Name"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <input
                      {...register(`experience.${index}.position`)}
                      placeholder="Position"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        {...register(`experience.${index}.startDate`)}
                        type="month"
                        placeholder="Start Date"
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        {...register(`experience.${index}.endDate`)}
                        type="month"
                        placeholder="End Date"
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <textarea
                      {...register(`experience.${index}.description.0`)}
                      rows="3"
                      placeholder="Job responsibilities and achievements..."
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                ))}
              </section>
            )}

            {/* Projects - Important for freshers */}
            <section className={resumeType === 'fresher' ? 'ring-2 ring-purple-200 rounded-lg p-4 bg-purple-50' : ''}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Projects</h2>
                {resumeType === 'fresher' ? (
                  <span className="hidden sm:inline text-sm text-purple-600 font-semibold">⭐ MOST IMPORTANT for freshers!</span>
                ) : (
                  <span className="text-sm text-gray-500">(Optional)</span>
                )}
              </div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  {resumeType === 'fresher' && (
                    <p className="text-sm text-yellow-600">⭐ MOST IMPORTANT for freshers!</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => appendProject({ name: '', description: '', technologies: '', link: '', github: '' })}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Project</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              
              {resumeType === 'fresher' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
                  💡 No work experience? Showcase your projects! Include personal projects, college projects, or freelance work.
                </div>
              )}
              
              {projectFields.map((field, index) => (
                <div key={field.id} className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg mb-3 sm:mb-4 relative bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-700">Project {index + 1}</h4>
                    {projectFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove this project"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                  
                  <input
                    {...register(`projects.${index}.name`)}
                    placeholder="Project Name (e.g., E-commerce Website)"
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    {...register(`projects.${index}.description`)}
                    rows="3"
                    placeholder="Brief description of the project and your role..."
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    {...register(`projects.${index}.technologies`)}
                    placeholder="Technologies used (comma separated: React, Node.js, MongoDB)"
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      {...register(`projects.${index}.link`)}
                      placeholder="Live Demo URL (optional)"
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      {...register(`projects.${index}.github`)}
                      placeholder="GitHub URL (optional)"
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* Certifications */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Certifications</h2>
                <button
                  type="button"
                  onClick={() => appendCertification({ name: '', issuer: '', date: '', link: '' })}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Certification</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              
              {certificationFields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg mb-4 relative">
                  {certificationFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Remove this certification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  
                  <input
                    {...register(`certifications.${index}.name`)}
                    placeholder="Certification Name (e.g., AWS Certified Developer)"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      {...register(`certifications.${index}.issuer`)}
                      placeholder="Issuing Organization"
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      {...register(`certifications.${index}.date`)}
                      type="text"
                      placeholder="Date (e.g., July 22 to August 13, 2024)"
                      className="px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <input
                    {...register(`certifications.${index}.link`)}
                    placeholder="Certificate URL (e.g., Coursera certificate link)"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              ))}
            </section>

            {/* Education */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Education</h2>
              <div className="space-y-4">
                <input
                  {...register('education.0.institution')}
                  placeholder="Institution Name"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    {...register('education.0.degree')}
                    placeholder="Degree (e.g., Bachelor)"
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    {...register('education.0.field')}
                    placeholder="Field of Study (e.g., Computer Science)"
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    {...register('education.0.startDate')}
                    type="text"
                    placeholder="Start Year (e.g., 2021)"
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    {...register('education.0.endDate')}
                    type="text"
                    placeholder="End Year (e.g., 2025)"
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    {...register('education.0.gpa')}
                    type="text"
                    placeholder="GPA (optional)"
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Skills</h2>
                <button
                  type="button"
                  onClick={() => {
                    const currentSkills = watch('skills') || [];
                    if (currentSkills.length === 0 || !Array.isArray(currentSkills)) {
                      setValue('skills', [
                        { category: 'Technical Skills', items: watch('skills.0.items') || '' },
                        { category: 'Tools & Technologies', items: '' }
                      ]);
                    } else {
                      setValue('skills', [...currentSkills, { category: '', items: '' }]);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Skill Category</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              
              {/* Display all skill categories */}
              {watch('skills') && Array.isArray(watch('skills')) && watch('skills').length > 0 ? (
                <div className="space-y-4">
                  {watch('skills').map((skill, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          {...register(`skills.${index}.category`)}
                          placeholder="Category (e.g., Technical Skills)"
                          className="flex-1 px-3 py-2 border rounded-lg font-semibold"
                        />
                        {watch('skills').length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentSkills = watch('skills');
                              setValue('skills', currentSkills.filter((_, i) => i !== index));
                            }}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <textarea
                        {...register(`skills.${index}.items`)}
                        rows="3"
                        placeholder="Comma-separated skills (e.g., HTML, CSS, JavaScript)"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <textarea
                    {...register('skills.0.items')}
                    rows="6"
                    placeholder="Enter your skills (comma-separated)"
                    className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              )}
            </section>

            {/* Chronological Template Specific Sections */}
            {selectedTemplate === 'chronological' && (
              <>
                {/* Languages */}
                <section>
                  <h2 className="text-xl font-semibold mb-4">Languages <span className="text-sm text-gray-500 font-normal">(Optional - Chronological Template)</span></h2>
                  <div className="space-y-3">
                    <input
                      {...register('languages.0')}
                      placeholder="Language (e.g., English)"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <input
                      {...register('languages.1')}
                      placeholder="Language (e.g., Spanish)"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <input
                      {...register('languages.2')}
                      placeholder="Language (e.g., French)"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </section>

                {/* Interests */}
                <section>
                  <h2 className="text-xl font-semibold mb-4">Interests <span className="text-sm text-gray-500 font-normal">(Optional - Chronological Template)</span></h2>
                  <div className="space-y-3">
                    <input
                      {...register('interests.0')}
                      placeholder="Interest (e.g., Photography)"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <input
                      {...register('interests.1')}
                      placeholder="Interest (e.g., Hiking)"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <input
                      {...register('interests.2')}
                      placeholder="Interest (e.g., Reading)"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </section>

                {/* Volunteer Work */}
                <section>
                  <h2 className="text-xl font-semibold mb-4">Volunteer Work <span className="text-sm text-gray-500 font-normal">(Optional - Chronological Template)</span></h2>
                  <div className="space-y-4">
                    <input
                      {...register('volunteer.0.role')}
                      placeholder="Role (e.g., Volunteer Teacher)"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        {...register('volunteer.0.organization')}
                        placeholder="Organization"
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        {...register('volunteer.0.date')}
                        placeholder="Date (e.g., 2023 - Present)"
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 sm:gap-2 bg-indigo-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm sm:text-base"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{loading ? 'Saving...' : 'Save Resume'}</span>
                <span className="xs:hidden">{loading ? 'Save' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 sm:gap-2 bg-green-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 text-sm sm:text-base"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Download PDF</span>
                <span className="xs:hidden">PDF</span>
              </button>
            </div>
          </form>
          </div>

          {/* Live Preview Panel - Desktop Only */}
          {livePreview && (
            <div className="hidden lg:block bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-4 overflow-hidden sticky top-4 h-[calc(100vh-8rem)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  <span>Live Preview</span>
                  <span className="text-xs text-gray-500 font-normal">(Updates as you type)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewScale(Math.max(0.4, previewScale - 0.1))}
                    className="p-1.5 hover:bg-white rounded transition-colors"
                    title="Zoom out"
                  >
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-600 font-medium min-w-[3rem] text-center">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewScale(Math.min(1, previewScale + 0.1))}
                    className="p-1.5 hover:bg-white rounded transition-colors"
                    title="Zoom in"
                  >
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewScale(0.6)}
                    className="ml-2 px-2 py-1 text-xs bg-white hover:bg-gray-50 rounded transition-colors text-gray-700"
                    title="Reset zoom"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              <div className="overflow-auto bg-white rounded shadow-inner p-4" style={{ maxHeight: 'calc(100vh - 13rem)' }}>
                <div 
                  className="transition-transform duration-200"
                  style={{ 
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                    width: `${100 / previewScale}%`
                  }}
                >
                  <ResumePreview 
                    resumeData={watch()} 
                    template={selectedTemplate}
                  />
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  💡 Tip: Use Full Preview for print-ready view
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resume Score Modal */}
      {showScore && (
        <ResumeScore
          resumeData={watch()}
          onClose={() => setShowScore(false)}
        />
      )}

      {/* Version History Modal */}
      {showVersions && id && (
        <VersionHistory
          resumeId={id}
          currentData={watch()}
          onRestore={(resumeData) => {
            Object.keys(resumeData).forEach(key => {
              setValue(key, resumeData[key]);
            });
          }}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}

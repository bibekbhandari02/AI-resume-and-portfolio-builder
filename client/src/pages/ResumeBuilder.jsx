import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Sparkles, Download, Save, ArrowLeft, Eye, X, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { downloadResumePDF } from '../utils/pdfGenerator';
import ResumePreview from '../components/ResumePreview';

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [resumeType, setResumeType] = useState('experienced'); // 'experienced' or 'fresher'
  const { register, handleSubmit, setValue, watch, reset } = useForm();

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      const { data } = await api.get(`/resume/${id}`);
      Object.keys(data.resume).forEach(key => {
        setValue(key, data.resume[key]);
      });
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
        : 'My Resume'
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
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save resume');
    } finally {
      setLoading(false);
    }
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
      
      // Parse AI response and extract useful content
      const aiContent = data.enhanced;
      let updatedSections = [];
      
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
      const skillsMatch = aiContent.match(/\*\*Skills\*\*([\s\S]*?)(?=\*\*|$)/i);
      if (skillsMatch && skillsMatch[1]) {
        const skillsText = skillsMatch[1].trim();
        // Look for categorized skills format
        const skillLines = skillsText.split('\n')
          .filter(line => line.trim() && (line.includes(':') || line.trim().startsWith('*')))
          .map(line => line.replace(/^\*\s*/, '').trim())
          .join('\n');
        
        if (skillLines) {
          setValue('skills.0.items', skillLines);
          updatedSections.push('Skills');
        }
      }
      
      // 4. Extract project suggestions
      const projectsMatch = aiContent.match(/\*\*Projects?\*\*([\s\S]*?)(?=\*\*|$)/i);
      if (projectsMatch && projectsMatch[1]) {
        const projectText = projectsMatch[1].trim();
        
        // Try to extract first project details
        const projectLines = projectText.split('\n').filter(line => line.trim());
        if (projectLines.length > 0) {
          // Look for project name (usually first non-bullet line or after "Project:")
          const nameMatch = projectText.match(/(?:Project:|Name:)?\s*([^\n]+)/i);
          if (nameMatch && nameMatch[1] && !resumeData.projects?.[0]?.name) {
            const projectName = nameMatch[1].trim().replace(/^:\s*/, '');
            setValue('projects.0.name', projectName);
          }
          
          // Look for description
          const descMatch = projectText.match(/(?:Description:|Details:)\s*([^\n]+(?:\n(?!(?:Technologies?|Project|Name):)[^\n]+)*)/i);
          if (descMatch && descMatch[1] && !resumeData.projects?.[0]?.description) {
            setValue('projects.0.description', descMatch[1].trim());
          }
          
          // Look for technologies
          const techMatch = projectText.match(/(?:Technologies?|Tech Stack|Stack):\s*([^\n]+)/i);
          if (techMatch && techMatch[1]) {
            const technologies = techMatch[1].trim();
            setValue('projects.0.technologies', technologies);
          }
          
          // Look for GitHub link
          const githubMatch = projectText.match(/(?:GitHub|Github|Repository|Repo):\s*(https?:\/\/[^\s]+)/i);
          if (githubMatch && githubMatch[1] && !resumeData.projects?.[0]?.github) {
            setValue('projects.0.github', githubMatch[1].trim());
          }
          
          // Look for live link
          const liveMatch = projectText.match(/(?:Live|Demo|URL|Link):\s*(https?:\/\/[^\s]+)/i);
          if (liveMatch && liveMatch[1] && !resumeData.projects?.[0]?.link) {
            setValue('projects.0.link', liveMatch[1].trim());
          }
          
          updatedSections.push('Projects');
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
      
      // Show success message with updated sections
      const sectionsText = updatedSections.length > 0 
        ? updatedSections.join(', ') 
        : 'various sections';
      toast.success(`Resume enhanced with AI! Updated: ${sectionsText}`);
      
      // Store AI suggestions to show in modal
      setAiSuggestions(aiContent);
      
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

  const handleClearForm = () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to clear all form data?\n\nThis action cannot be undone.'
    );

    if (confirmed) {
      // Reset the entire form to completely empty state
      reset({
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          website: ''
        },
        summary: '',
        experience: [{
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ['']
        }],
        education: [{
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: ''
        }],
        skills: [{
          items: ''
        }],
        projects: [{
          name: '',
          description: '',
          technologies: '',
          link: '',
          github: ''
        }],
        certifications: [{
          name: '',
          issuer: '',
          date: '',
          link: ''
        }]
      });
      
      // Clear AI suggestions
      setAiSuggestions(null);
      
      // Reset resume type
      setResumeType('experienced');
      
      // If editing an existing resume, navigate to new resume page
      if (id) {
        navigate('/resume/new');
      }
      
      toast.success('Form cleared successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-3xl font-bold">Resume Builder</h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={enhanceWithAI}
                disabled={enhancing}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {enhancing ? 'Enhancing...' : 'Enhance with AI'}
              </button>
              {aiSuggestions && (
                <button
                  onClick={() => setAiSuggestions(aiSuggestions)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View AI Suggestions
                </button>
              )}
              <button
                type="button"
                onClick={handleClearForm}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear Form
              </button>
            </div>
          </div>

          {/* AI Suggestions Modal */}
          {aiSuggestions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold">AI Enhancement Suggestions</h2>
                  <button
                    onClick={() => setAiSuggestions(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      ✨ <strong>AI Enhancement Applied!</strong> The following sections have been automatically updated:
                    </p>
                    <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                      <li>Professional Summary</li>
                      <li>Work Experience (bullet points)</li>
                      <li>Skills (organized format)</li>
                      <li>Projects (suggestions)</li>
                      <li>Education (enhancements)</li>
                    </ul>
                    <p className="text-sm text-blue-800 mt-2">
                      Review the full AI suggestions below and make any adjustments as needed.
                    </p>
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
            <ResumePreview resumeData={watch()} />
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Resume Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8">
                  <ResumePreview resumeData={watch()} />
                </div>
                <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

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
            <section>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
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
            </section>

            {/* Summary */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
              <textarea
                {...register('summary')}
                rows="4"
                placeholder="Brief professional summary..."
                className="w-full px-4 py-2 border rounded-lg"
              />
            </section>

            {/* Experience */}
            {resumeType === 'experienced' && (
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Work Experience</h2>
                  <span className="text-sm text-indigo-600">⭐ Focus here for experienced professionals</span>
                </div>
              <div className="space-y-4">
                <input
                  {...register('experience.0.company')}
                  placeholder="Company Name (leave empty if no experience)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  {...register('experience.0.position')}
                  placeholder="Position"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    {...register('experience.0.startDate')}
                    type="month"
                    placeholder="Start Date"
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    {...register('experience.0.endDate')}
                    type="month"
                    placeholder="End Date"
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <textarea
                  {...register('experience.0.description.0')}
                  rows="3"
                  placeholder="Job responsibilities and achievements..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              </section>
            )}

            {/* Projects - Important for freshers */}
            <section className={resumeType === 'fresher' ? 'ring-2 ring-purple-200 rounded-lg p-4 bg-purple-50' : ''}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Projects</h2>
                {resumeType === 'fresher' ? (
                  <span className="text-sm text-purple-600 font-semibold">⭐ MOST IMPORTANT for freshers!</span>
                ) : (
                  <span className="text-sm text-gray-500">(Optional)</span>
                )}
              </div>
              {resumeType === 'fresher' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-sm text-yellow-800">
                  💡 No work experience? Showcase your projects! Include personal projects, college projects, or freelance work.
                </div>
              )}
              <div className="space-y-4">
                <input
                  {...register('projects.0.name')}
                  placeholder="Project Name (e.g., E-commerce Website)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  {...register('projects.0.description')}
                  rows="3"
                  placeholder="Brief description of the project and your role..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  {...register('projects.0.technologies')}
                  placeholder="Technologies used (comma separated: React, Node.js, MongoDB)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    {...register('projects.0.link')}
                    placeholder="Live Demo URL (optional)"
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    {...register('projects.0.github')}
                    placeholder="GitHub URL (optional)"
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Certifications</h2>
              <div className="space-y-4">
                <input
                  {...register('certifications.0.name')}
                  placeholder="Certification Name (e.g., AWS Certified Developer)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    {...register('certifications.0.issuer')}
                    placeholder="Issuing Organization"
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    {...register('certifications.0.date')}
                    type="text"
                    placeholder="Date (e.g., July 22 to August 13, 2024)"
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <input
                  {...register('certifications.0.link')}
                  placeholder="Certificate URL (e.g., Coursera certificate link)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
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
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-sm text-blue-800">
                💡 Tip: Format skills with categories for better organization:<br/>
                <code className="bg-white px-2 py-1 rounded">Frontend: HTML, CSS, JavaScript</code><br/>
                <code className="bg-white px-2 py-1 rounded">Backend: Node.js, Express, MongoDB</code>
              </div>
              <textarea
                {...register('skills.0.items')}
                rows="6"
                placeholder=""
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
              />
            </section>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Resume'}
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

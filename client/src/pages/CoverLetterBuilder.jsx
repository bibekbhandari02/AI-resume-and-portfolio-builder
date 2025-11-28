import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, FileText, Download, Copy } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api, { trackEvent } from '../lib/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

export default function CoverLetterBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    hiringManager: '',
    jobDescription: '',
    content: '',
    resumeId: '',
    tone: 'professional',
    customPrompt: ''
  });

  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    fetchResumes();
    if (id && id !== 'new') {
      fetchCoverLetter();
    }
  }, [id]);

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/resume');
      setResumes(data.resumes);
    } catch (error) {
      console.error('Failed to fetch resumes');
    }
  };

  const fetchCoverLetter = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/cover-letter/${id}`);
      setFormData(data.coverLetter);
    } catch (error) {
      toast.error('Failed to load cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.jobTitle) {
      toast.error('Please enter a job title');
      return;
    }

    if (!formData.resumeId) {
      toast.error('Please select a resume');
      return;
    }

    if (user?.credits?.coverLetters <= 0 && user?.subscription === 'free') {
      toast.error('No cover letter credits remaining. Please upgrade your plan.');
      navigate('/pricing');
      return;
    }

    setGenerating(true);
    const loadingToast = toast.loading('🤖 AI is crafting your personalized cover letter...');
    
    try {
      const resumeData = resumes.find(r => r._id === formData.resumeId);

      const { data } = await api.post('/ai/cover-letter', {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        hiringManager: formData.hiringManager,
        jobDescription: formData.jobDescription,
        tone: formData.tone,
        customPrompt: formData.customPrompt,
        resumeData: resumeData
      });

      setFormData(prev => ({ ...prev, content: data.coverLetter }));
      
      toast.success('✨ Cover letter generated successfully!', { 
        id: loadingToast,
        duration: 4000,
        icon: '🎉'
      });
      
      // Track AI enhancement
      trackEvent('ai_enhancement_used', { 
        type: 'cover_letter',
        jobTitle: formData.jobTitle,
        company: formData.companyName 
      });
      
      // Also track cover letter generation for specific stats
      trackEvent('cover_letter_generated', { 
        jobTitle: formData.jobTitle,
        company: formData.companyName 
      });

      // Refresh user credits
      const userRes = await api.get('/user/me');
      updateUser(userRes.data.user);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to generate cover letter';
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        toast.error('⏱️ Too many requests. Please wait a moment and try again.', { id: loadingToast });
      } else if (error.response?.status === 403) {
        toast.error(errorMessage, { id: loadingToast });
        navigate('/pricing');
      } else {
        toast.error(`❌ ${errorMessage}`, { id: loadingToast, duration: 5000 });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.jobTitle || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (id && id !== 'new') {
        await api.put(`/cover-letter/${id}`, formData);
        toast.success('Cover letter updated!');
      } else {
        const { data } = await api.post('/cover-letter', formData);
        toast.success('Cover letter saved!');
        navigate(`/cover-letter/${data.coverLetter._id}`);
      }
    } catch (error) {
      toast.error('Failed to save cover letter');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formData.content);
      toast.success('Cover letter copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
      console.error('Copy error:', error);
    }
  };

  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      
      // Set up the document
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      // Split content into lines
      const lines = formData.content.split('\n');
      let yPosition = margin;
      
      lines.forEach((line, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        // Determine font style based on content
        if (index === 0 || line.trim().length === 0) {
          // First line (name) or empty lines
          doc.setFontSize(line.trim().length > 0 ? 14 : 12);
          doc.setFont('helvetica', 'bold');
        } else if (line.includes('Dear ') || line.includes('Sincerely')) {
          // Greeting and closing
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
        } else if (line.includes('@') || line.includes('|') || line.includes('http')) {
          // Contact info lines
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
        } else {
          // Body text
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
        }
        
        // Split long lines to fit page width
        const splitLines = doc.splitTextToSize(line || ' ', maxWidth);
        
        splitLines.forEach(splitLine => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(splitLine, margin, yPosition);
          yPosition += 7; // Line height
        });
      });
      
      // Generate filename
      const fileName = `${formData.jobTitle.replace(/\s+/g, '_')}_Cover_Letter.pdf`;
      
      // Track download event
      trackEvent('cover_letter_download', { 
        jobTitle: formData.jobTitle,
        company: formData.company 
      });
      
      // Save the PDF
      doc.save(fileName);
      toast.success('Cover letter downloaded as PDF!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base p-1"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Cover Letter Builder</h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Create a personalized cover letter with AI</p>
            </div>
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!formData.content}
                className="flex items-center gap-1.5 px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!formData.content}
                className="flex items-center gap-1.5 px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.content}
                className="flex items-center gap-1.5 px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
            {/* Mobile action buttons - Download and Save only */}
            <div className="flex sm:hidden flex-wrap items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!formData.content}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.content}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-6">Job Details</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g., Google"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Hiring Manager Name
                </label>
                <input
                  type="text"
                  value={formData.hiringManager}
                  onChange={(e) => setFormData({ ...formData, hiringManager: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Select Resume <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.resumeId}
                  onChange={(e) => setFormData({ ...formData, resumeId: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a resume...</option>
                  {resumes.map((resume) => {
                    const name = resume.personalInfo?.fullName || 'Untitled';
                    // Display "ATS-Friendly" instead of "Classic"
                    const templateName = resume.template === 'classic' ? 'ATS-Friendly' : resume.template?.charAt(0).toUpperCase() + resume.template?.slice(1);
                    const template = templateName ? ` - ${templateName}` : '';
                    const date = new Date(resume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const displayName = `${name}${template} (${date})`;
                    
                    return (
                      <option key={resume._id} value={resume._id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Job Description (Optional but Recommended)
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  placeholder="Paste the job description here for a highly tailored cover letter..."
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">💡 Adding the job description creates a much more targeted cover letter</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="professional">Professional & Confident</option>
                  <option value="enthusiastic">Enthusiastic & Passionate</option>
                  <option value="creative">Creative & Unique</option>
                  <option value="formal">Formal & Traditional</option>
                  <option value="conversational">Conversational & Friendly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={formData.customPrompt}
                  onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                  placeholder="e.g., Emphasize my leadership skills, keep it under 300 words, use 2 paragraphs, focus on technical achievements..."
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <div className="mt-2 space-y-1 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-semibold text-blue-900">💡 What you can customize:</p>
                  <div className="text-[10px] sm:text-xs text-blue-800 space-y-0.5">
                    <p>• <strong>Length:</strong> "Make it smaller/shorter" or "Keep it under 250 words"</p>
                    <p>• <strong>Focus:</strong> "Emphasize leadership skills" or "Highlight technical expertise"</p>
                    <p>• <strong>Tone:</strong> "Make it formal" or "Use enthusiastic tone"</p>
                    <p>• <strong>Content:</strong> "Mention passion for sustainability"</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !formData.jobTitle || !formData.resumeId}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>

              {user?.subscription === 'free' && (
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Credits remaining: <span className="font-semibold text-indigo-600">{user?.credits?.coverLetters || 0}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview/Editor */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold">Cover Letter</h2>
              <div className="flex items-center gap-2">
                {/* Copy button for mobile - positioned in header */}
                <button
                  onClick={handleCopy}
                  disabled={!formData.content}
                  className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium shadow-sm"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
            </div>

            <div className="relative">
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Your AI-generated cover letter will appear here. You can edit it after generation."
                className="w-full h-[350px] sm:h-[450px] lg:h-[500px] px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-xs sm:text-sm leading-relaxed"
                style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
              {!formData.content && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-400 px-4">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm">Fill in the job details and click "Generate with AI"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

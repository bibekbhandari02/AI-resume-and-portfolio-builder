import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, FileText, Download, Upload } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function CoverLetterBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    hiringManager: '',
    content: '',
    resumeId: ''
  });

  const [resumes, setResumes] = useState([]);
  const [uploadedResumeFile, setUploadedResumeFile] = useState(null);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const { data } = await api.post('/upload/resume', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedResumeFile(data.resumeData);
      setFormData(prev => ({ ...prev, resumeId: '' })); // Clear selected resume
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload resume');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.jobTitle) {
      toast.error('Please enter a job title');
      return;
    }

    if (!formData.resumeId && !uploadedResumeFile) {
      toast.error('Please select or upload a resume');
      return;
    }

    if (user?.credits?.coverLetters <= 0 && user?.subscription === 'free') {
      toast.error('No cover letter credits remaining. Please upgrade your plan.');
      navigate('/pricing');
      return;
    }

    setGenerating(true);
    try {
      let resumeData;
      if (uploadedResumeFile) {
        resumeData = uploadedResumeFile;
      } else {
        resumeData = resumes.find(r => r._id === formData.resumeId);
      }

      const { data } = await api.post('/ai/cover-letter', {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        hiringManager: formData.hiringManager,
        resumeData: resumeData
      });

      setFormData(prev => ({ ...prev, content: data.coverLetter }));
      toast.success('Cover letter generated!');

      // Refresh user credits
      const userRes = await api.get('/user/me');
      updateUser(userRes.data.user);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate cover letter');
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

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([formData.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.jobTitle.replace(/\s+/g, '_')}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cover Letter Builder</h1>
              <p className="text-gray-600 mt-1">Create a personalized cover letter with AI</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={!formData.content}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.content}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Job Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g., Google"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hiring Manager Name
                </label>
                <input
                  type="text"
                  value={formData.hiringManager}
                  onChange={(e) => setFormData({ ...formData, hiringManager: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resume <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.resumeId}
                  onChange={(e) => {
                    setFormData({ ...formData, resumeId: e.target.value });
                    setUploadedResumeFile(null); // Clear uploaded file when selecting from list
                  }}
                  disabled={uploadedResumeFile !== null}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Choose a resume...</option>
                  {resumes.map((resume, index) => {
                    const name = resume.personalInfo?.fullName || 'Untitled';
                    const template = resume.template ? ` - ${resume.template.charAt(0).toUpperCase() + resume.template.slice(1)}` : '';
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Resume File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading || formData.resumeId !== ''}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploading || formData.resumeId !== ''
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-300 hover:border-indigo-500 bg-white'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : uploadedResumeFile ? 'Resume Uploaded ✓' : 'Click to upload PDF or Word'}
                    </span>
                  </label>
                </div>
                {uploadedResumeFile && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-green-700">Resume uploaded successfully</span>
                    <button
                      onClick={() => setUploadedResumeFile(null)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !formData.jobTitle || (!formData.resumeId && !uploadedResumeFile)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Sparkles className="w-5 h-5" />
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>

              {user?.subscription === 'free' && (
                <p className="text-sm text-gray-600 text-center">
                  Credits remaining: {user?.credits?.coverLetters || 0}
                </p>
              )}
            </div>
          </div>

          {/* Preview/Editor */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Cover Letter</h2>
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>

            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Your AI-generated cover letter will appear here. You can edit it after generation."
              className="w-full h-[500px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

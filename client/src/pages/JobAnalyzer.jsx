import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Target, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function JobAnalyzer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeIdFromUrl = searchParams.get('resumeId');

  const [step, setStep] = useState(1); // 1: Input, 2: Analysis, 3: Tailor
  const [jobDescription, setJobDescription] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(resumeIdFromUrl || '');
  const [resumes, setResumes] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  
  // Analysis results
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [matchAnalysis, setMatchAnalysis] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/resume');
      setResumes(data.resumes);
      
      // Auto-select if only one resume
      if (data.resumes.length === 1 && !selectedResumeId) {
        setSelectedResumeId(data.resumes[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch resumes');
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }

    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }

    setAnalyzing(true);
    const loadingToast = toast.loading('Analyzing job description and resume...');

    try {
      // Parse job description and analyze resume in one call
      const { data } = await api.post('/job-analyzer/analyze', {
        resumeId: selectedResumeId,
        jobDescription
      });

      setJobAnalysis(data.jobAnalysis);
      setMatchAnalysis(data.matchAnalysis);
      setStep(2);
      
      toast.success('Analysis complete!', { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed', { id: loadingToast });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTailorResume = async (saveAsNew = false) => {
    setTailoring(true);
    const loadingToast = toast.loading('Tailoring your resume...');

    try {
      const { data } = await api.post('/job-analyzer/tailor', {
        resumeId: selectedResumeId,
        jobAnalysis,
        saveAs: saveAsNew ? 'new' : 'update'
      });

      toast.success(
        saveAsNew ? 'New tailored resume created!' : 'Resume updated!',
        { id: loadingToast }
      );

      // Navigate to the resume
      navigate(`/resume/${data.resume._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Tailoring failed', { id: loadingToast });
    } finally {
      setTailoring(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex-shrink-0">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Job Description Analyzer</h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
                Analyze how well your resume matches a job and get AI-powered tailoring
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Input */}
        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Job Description Input */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span>Job Description</span>
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and AWS. The ideal candidate will have strong problem-solving skills and experience with microservices architecture..."
                className="w-full h-64 sm:h-80 lg:h-96 px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-xs sm:text-sm"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Minimum 50 characters required
              </p>
            </div>

            {/* Resume Selection */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span>Select Resume</span>
              </h2>
              
              {resumes.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No resumes found</p>
                  <button
                    onClick={() => navigate('/resume/new')}
                    className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
                  >
                    Create Resume
                  </button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                  {resumes.map((resume) => (
                    <div
                      key={resume._id}
                      onClick={() => setSelectedResumeId(resume._id)}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedResumeId === resume._id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {resume.personalInfo?.fullName || 'Untitled Resume'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
                            {resume.template === 'classic' ? 'ATS-Friendly' : resume.template?.charAt(0).toUpperCase() + resume.template?.slice(1)} Template
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                            Updated {new Date(resume.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedResumeId === resume._id && (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !jobDescription.trim() || !selectedResumeId}
                className="w-full mt-4 sm:mt-6 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Analyze Match</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Analysis Results */}
        {step === 2 && matchAnalysis && jobAnalysis && (
          <div className="space-y-4 sm:space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 sm:border-6 lg:border-8 ${getScoreColor(matchAnalysis.overallScore)} mb-3 sm:mb-4`}>
                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{matchAnalysis.overallScore}</div>
                    <div className="text-xs sm:text-sm font-medium">/ 100</div>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{getScoreLabel(matchAnalysis.overallScore)}</h2>
                <p className="text-sm sm:text-base text-gray-600 px-2">
                  Your resume matches {matchAnalysis.overallScore}% of the job requirements
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <ScoreCard
                title="Technical Skills"
                score={matchAnalysis.breakdown.technicalSkills}
                icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
              />
              <ScoreCard
                title="Tools & Software"
                score={matchAnalysis.breakdown.tools}
                icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
              />
              <ScoreCard
                title="Soft Skills"
                score={matchAnalysis.breakdown.softSkills}
                icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
              />
              <ScoreCard
                title="Keywords"
                score={matchAnalysis.breakdown.keywords}
                icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
              />
            </div>

            {/* Recommendations */}
            {matchAnalysis.recommendations && matchAnalysis.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recommendations</h3>
                <div className="space-y-2 sm:space-y-3">
                  {matchAnalysis.recommendations.map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} />
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {(matchAnalysis.missingSkills.required.technical.length > 0 ||
              matchAnalysis.missingSkills.required.tools.length > 0) && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-red-600">Missing Required Skills</h3>
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  {matchAnalysis.missingSkills.required.technical.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Technical Skills</h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {matchAnalysis.missingSkills.required.technical.map((skill, index) => (
                          <span key={index} className="px-2 sm:px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs sm:text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchAnalysis.missingSkills.required.tools.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Tools & Software</h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {matchAnalysis.missingSkills.required.tools.map((skill, index) => (
                          <span key={index} className="px-2 sm:px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs sm:text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Matched Skills */}
            {(matchAnalysis.matchedSkills.technical.length > 0 ||
              matchAnalysis.matchedSkills.tools.length > 0) && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-600">Matched Skills</h3>
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  {matchAnalysis.matchedSkills.technical.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Technical Skills</h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {matchAnalysis.matchedSkills.technical.map((skill, index) => (
                          <span key={index} className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchAnalysis.matchedSkills.tools.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Tools & Software</h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {matchAnalysis.matchedSkills.tools.map((skill, index) => (
                          <span key={index} className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Next Steps</h3>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => handleTailorResume(true)}
                  disabled={tailoring}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-semibold text-sm sm:text-base"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{tailoring ? 'Tailoring...' : 'Create Tailored Resume (New)'}</span>
                </button>
                <button
                  onClick={() => handleTailorResume(false)}
                  disabled={tailoring}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-semibold text-sm sm:text-base"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{tailoring ? 'Tailoring...' : 'Update Current Resume'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center px-2">
                AI will optimize your resume to match this job description
              </p>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setStep(1)}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm sm:text-base"
            >
              Analyze Another Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function ScoreCard({ title, score, icon }) {
  const getColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2 pr-1">{title}</span>
        <div className="flex-shrink-0">{icon}</div>
      </div>
      <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getColor(score)}`}>
        {score}%
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }) {
  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`p-3 sm:p-4 border-2 rounded-lg ${getColor(recommendation.type)}`}>
      <div className="flex items-start gap-2 sm:gap-3">
        {getIcon(recommendation.type)}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm sm:text-base">{recommendation.message}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{recommendation.action}</p>
        </div>
      </div>
    </div>
  );
}

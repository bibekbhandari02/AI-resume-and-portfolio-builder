import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Globe, Plus, CreditCard, Sparkles, Trash2, Mail, TrendingUp, Award, Target, Zap, Eye, Edit3, Minimize2, Maximize2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api, { trackEvent } from '../lib/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

export default function Dashboard() {
  const { user, updateUser } = useAuthStore();
  const [resumes, setResumes] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Show More states
  const [showAllResumes, setShowAllResumes] = useState(false);
  const [showAllPortfolios, setShowAllPortfolios] = useState(false);
  const [showAllCoverLetters, setShowAllCoverLetters] = useState(false);
  
  const INITIAL_DISPLAY_COUNT = 4;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesRes, portfoliosRes, coverLettersRes, userRes] = await Promise.all([
        api.get('/resume'),
        api.get('/portfolio'),
        api.get('/cover-letter'),
        api.get('/user/me')
      ]);
      setResumes(resumesRes.data.resumes);
      setPortfolios(portfoliosRes.data.portfolios);
      setCoverLetters(coverLettersRes.data.coverLetters);
      updateUser(userRes.data.user);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (e, resumeId, resumeName) => {
    e.preventDefault(); // Prevent navigation to resume
    e.stopPropagation();
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resumeName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await api.delete(`/resume/${resumeId}`);
      toast.success('Resume deleted successfully');
      // Remove from local state
      setResumes(resumes.filter(r => r._id !== resumeId));
    } catch (error) {
      toast.error('Failed to delete resume');
      console.error('Delete error:', error);
    }
  };

  const handleDeletePortfolio = async (e, portfolioId, portfolioName) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${portfolioName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await api.delete(`/portfolio/${portfolioId}`);
      toast.success('Portfolio deleted successfully');
      setPortfolios(portfolios.filter(p => p._id !== portfolioId));
    } catch (error) {
      toast.error('Failed to delete portfolio');
      console.error('Delete error:', error);
    }
  };

  const handleDeleteCoverLetter = async (e, coverLetterId, jobTitle) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmed = window.confirm(
      `Are you sure you want to delete cover letter for "${jobTitle}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await api.delete(`/cover-letter/${coverLetterId}`);
      toast.success('Cover letter deleted successfully');
      setCoverLetters(coverLetters.filter(c => c._id !== coverLetterId));
    } catch (error) {
      toast.error('Failed to delete cover letter');
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a moment on first load</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Dashboard - CareerCraft AI"
        description="Manage your resumes, portfolios, and cover letters. Create, edit, and download professional career documents with AI assistance."
        url="/dashboard"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl">Create professional resumes, portfolios, and cover letters with AI</p>
        </div>

        {/* Stats - Enhanced with animations and better design */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
          {/* Subscription Card - Premium Style */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 text-white p-4 sm:p-5 lg:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <h3 className="text-white/90 text-sm sm:text-base font-medium">Subscription</h3>
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold capitalize mb-1">{user?.subscription}</p>
              {user?.subscription === 'free' && (
                <Link to="/pricing" className="text-sm sm:text-base text-white/90 hover:text-white mt-1 sm:mt-2 inline-flex items-center gap-1 group/link">
                  <span>Upgrade</span>
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* Resume Credits */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 group">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-gray-600 text-sm sm:text-base font-medium">Resume Credits</h3>
              <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {user?.credits?.resumeGenerations >= 999 ? (
                <span className="flex items-center gap-2">
                  <span>∞</span>
                  <span className="text-base text-indigo-600">Unlimited</span>
                </span>
              ) : (
                user?.credits?.resumeGenerations || 0
              )}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {user?.subscription === 'pro' || user?.credits?.resumeGenerations >= 999 ? (
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-xs sm:text-sm font-bold">Pro Plan</span>
                </div>
              ) : (
                <>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(100, ((user?.credits?.resumeGenerations || 0) / (user?.subscription === 'starter' ? 20 : 5)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                    / {user?.subscription === 'starter' ? '20' : '5'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Portfolio Credits */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 group">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-gray-600 text-sm sm:text-base font-medium">Portfolio Credits</h3>
              <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {user?.credits?.portfolios || 0}
              </p>
              {(user?.subscription === 'starter' || user?.subscription === 'pro') && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  {user?.subscription === 'pro' ? 'PRO' : 'STARTER+'}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${Math.min(100, ((user?.credits?.portfolios || 0) / (user?.subscription === 'pro' ? 10 : user?.subscription === 'starter' ? 3 : 1)) * 100)}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                / {user?.subscription === 'pro' ? '10' : user?.subscription === 'starter' ? '3' : '1'}
              </span>
            </div>
          </div>

          {/* Cover Letter Credits - Pro Only */}
          {user?.subscription === 'pro' ? (
            <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 group">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <h3 className="text-gray-600 text-sm sm:text-base font-medium">Cover Letters</h3>
                <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {user?.credits?.coverLetters >= 999 ? (
                  <span className="flex items-center gap-2">
                    <span>∞</span>
                    <span className="text-base text-green-600">Unlimited</span>
                  </span>
                ) : (
                  user?.credits?.coverLetters || 0
                )}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-green-600">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-xs sm:text-sm font-bold">Pro Plan</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-5 lg:p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-green-200 border-dashed group relative overflow-hidden">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <h3 className="text-gray-700 text-sm sm:text-base font-medium">Cover Letters</h3>
                <div className="flex flex-col items-end gap-1">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 opacity-50" />
                  </div>
                  <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    PRO
                  </span>
                </div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-400">—</p>
              <div className="mt-2">
                <Link 
                  to="/pricing"
                  className="text-xs sm:text-sm font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  <span>Upgrade to Pro</span>
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Total Resumes */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 group">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-gray-600 text-sm sm:text-base font-medium">Total Resumes</h3>
              <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{resumes.length}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {resumes.length > 0 ? '🎉 Great progress!' : 'Start creating!'}
            </p>
          </div>
        </div>

        {/* Quick Actions - Enhanced with better hover effects and responsive text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-8 sm:mb-10 lg:mb-12">
          {/* Create Resume */}
          <Link 
            to="/resume/new" 
            className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 sm:p-6 lg:p-7 rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2 sm:gap-3"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-center">Create Resume</span>
              <span className="text-xs text-white/80 group-hover:text-white transition-colors">Start building →</span>
            </div>
          </Link>

          {/* Create Portfolio */}
          <Link 
            to="/portfolio/new" 
            className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 text-white p-5 sm:p-6 lg:p-7 rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2 sm:gap-3"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-center">Create Portfolio</span>
              <span className="text-xs text-white/80 group-hover:text-white transition-colors">Showcase work →</span>
            </div>
          </Link>

          {/* Create Cover Letter */}
          <Link 
            to="/cover-letter/new" 
            className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 text-white p-5 sm:p-6 lg:p-7 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2 sm:gap-3"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-center">Cover Letter</span>
              <span className="text-xs text-white/80 group-hover:text-white transition-colors">Write yours →</span>
            </div>
          </Link>

          {/* Job Analyzer - Featured */}
          <Link 
            to="/job-analyzer" 
            className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-pink-600 text-white p-5 sm:p-6 lg:p-7 rounded-xl hover:from-orange-600 hover:via-pink-600 hover:to-pink-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2 sm:gap-3"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-bold rounded-full">
              NEW
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-center">Job Analyzer</span>
              <span className="text-xs text-white/80 group-hover:text-white transition-colors flex items-center gap-1">
                <Zap className="w-3 h-3" />
                AI-powered →
              </span>
            </div>
          </Link>
        </div>

        {/* Recent Resumes */}
        <section className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-indigo-600" />
              Your Resumes
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-medium">
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
            </span>
          </div>
          {resumes.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No resumes yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6">Create your first professional resume in minutes with our AI-powered builder</p>
                <Link 
                  to="/resume/new"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Your First Resume
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {(showAllResumes ? resumes : resumes.slice(0, INITIAL_DISPLAY_COUNT)).map((resume) => {
                  const resumeName = resume.personalInfo?.fullName 
                    ? `${resume.personalInfo.fullName}'s Resume` 
                    : resume.title || 'Untitled Resume';
                  
                  return (
                    <div key={resume._id} className="relative group">
                      <Link
                        to={`/resume/${resume._id}`}
                        onClick={() => trackEvent('resume_view', { resumeId: resume._id, template: resume.template })}
                        className="block bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 group-hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 sm:p-2.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                          </div>
                          {resume.aiEnhanced && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-medium rounded-full flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              AI
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                          {resumeName}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 mb-2">
                          Updated {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                        {resume.template && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-indigo-600 font-medium capitalize px-2 py-0.5 bg-indigo-50 rounded">
                              {resume.template === 'classic' ? 'ATS-Friendly' : resume.template}
                            </span>
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm sm:text-base text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            View
                          </span>
                          <span className="flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Edit
                          </span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => handleDeleteResume(e, resume._id, resumeName)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-1.5 sm:p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {resumes.length > INITIAL_DISPLAY_COUNT && (
                <div className="mt-6 sm:mt-8 text-center">
                  <button
                    onClick={() => setShowAllResumes(!showAllResumes)}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-semibold text-sm sm:text-base hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    {showAllResumes ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        Show All ({resumes.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Portfolios */}
        <section className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-600" />
              Your Portfolios
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-medium">
              {portfolios.length} {portfolios.length === 1 ? 'portfolio' : 'portfolios'}
            </span>
          </div>
          {portfolios.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No portfolios yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6">Showcase your work with a stunning online portfolio</p>
                <Link 
                  to="/portfolio/new"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Your First Portfolio
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {(showAllPortfolios ? portfolios : portfolios.slice(0, INITIAL_DISPLAY_COUNT)).map((portfolio) => {
                  const portfolioName = portfolio.subdomain || 'Untitled';
                  
                  return (
                    <div key={portfolio._id} className="relative group">
                      <Link
                        to={`/portfolio/${portfolio._id}`}
                        className="block bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 group-hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 sm:p-2.5 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                          </div>
                          {portfolio.published && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full">
                              Live
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-gray-900 mb-1 truncate group-hover:text-purple-600 transition-colors">
                          {portfolioName}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 mb-2 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {portfolio.views || 0} views
                        </p>
                        {portfolio.theme && (
                          <span className="text-xs sm:text-sm text-purple-600 font-medium capitalize px-2 py-0.5 bg-purple-50 rounded">
                            {portfolio.theme} theme
                          </span>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm sm:text-base text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            View
                          </span>
                          <span className="flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Edit
                          </span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => handleDeletePortfolio(e, portfolio._id, portfolioName)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-1.5 sm:p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                        title="Delete portfolio"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {portfolios.length > INITIAL_DISPLAY_COUNT && (
                <div className="mt-6 sm:mt-8 text-center">
                  <button
                    onClick={() => setShowAllPortfolios(!showAllPortfolios)}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 font-semibold text-sm sm:text-base hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    {showAllPortfolios ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        Show All ({portfolios.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Cover Letters */}
        <section className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600" />
              Your Cover Letters
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-medium">
              {coverLetters.length} {coverLetters.length === 1 ? 'letter' : 'letters'}
            </span>
          </div>
          {coverLetters.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No cover letters yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6">Write compelling cover letters that get you noticed</p>
                <Link 
                  to="/cover-letter/new"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Your First Cover Letter
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {(showAllCoverLetters ? coverLetters : coverLetters.slice(0, INITIAL_DISPLAY_COUNT)).map((coverLetter) => {
                  return (
                    <div key={coverLetter._id} className="relative group">
                      <Link
                        to={`/cover-letter/${coverLetter._id}`}
                        className="block bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group-hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 sm:p-2.5 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          </div>
                          {coverLetter.aiGenerated && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              AI
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-gray-900 mb-1 truncate group-hover:text-green-600 transition-colors">
                          {coverLetter.jobTitle}
                        </h3>
                        {coverLetter.companyName && (
                          <p className="text-sm sm:text-base text-gray-600 mb-2 truncate">
                            {coverLetter.companyName}
                          </p>
                        )}
                        <p className="text-sm sm:text-base text-gray-500 mb-2">
                          Updated {new Date(coverLetter.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm sm:text-base text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            View
                          </span>
                          <span className="flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Edit
                          </span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => handleDeleteCoverLetter(e, coverLetter._id, coverLetter.jobTitle)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-1.5 sm:p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                        title="Delete cover letter"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {coverLetters.length > INITIAL_DISPLAY_COUNT && (
                <div className="mt-6 sm:mt-8 text-center">
                  <button
                    onClick={() => setShowAllCoverLetters(!showAllCoverLetters)}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-green-600 border-2 border-green-600 rounded-xl hover:bg-green-50 transition-all duration-300 font-semibold text-sm sm:text-base hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    {showAllCoverLetters ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        Show All ({coverLetters.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        </div>
      </div>
    </>
  );
}

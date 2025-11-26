import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Globe, Plus, CreditCard, Sparkles, Trash2, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

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
  
  const INITIAL_DISPLAY_COUNT = 6;

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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Create professional resumes, portfolios, and cover letters with AI</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 sm:p-5 lg:p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-white/80 text-xs sm:text-sm">Subscription</h3>
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold capitalize">{user?.subscription}</p>
            {user?.subscription === 'free' && (
              <Link to="/pricing" className="text-xs sm:text-sm text-white/80 hover:text-white mt-1 sm:mt-2 inline-block">
                Upgrade →
              </Link>
            )}
          </div>
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-gray-600 text-xs sm:text-sm">Resume Credits</h3>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{user?.credits?.resumeGenerations || 0}</p>
          </div>
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-gray-600 text-xs sm:text-sm">Portfolio Credits</h3>
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{user?.credits?.portfolios || 0}</p>
          </div>
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-gray-600 text-xs sm:text-sm">Cover Letter Credits</h3>
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{user?.credits?.coverLetters || 0}</p>
          </div>
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-gray-600 text-xs sm:text-sm">Total Resumes</h3>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{resumes.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
          <Link to="/resume/new" className="bg-indigo-600 text-white p-5 sm:p-6 lg:p-8 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 sm:gap-3 transition-colors">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg lg:text-xl font-semibold">Create Resume</span>
          </Link>
          <Link to="/portfolio/new" className="bg-purple-600 text-white p-5 sm:p-6 lg:p-8 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 sm:gap-3 transition-colors">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg lg:text-xl font-semibold">Create Portfolio</span>
          </Link>
          <Link to="/cover-letter/new" className="bg-green-600 text-white p-5 sm:p-6 lg:p-8 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 sm:gap-3 transition-colors">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg lg:text-xl font-semibold">Create Cover Letter</span>
          </Link>
        </div>

        {/* Recent Resumes */}
        <section className="mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Your Resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">No resumes yet. Create your first one!</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {(showAllResumes ? resumes : resumes.slice(0, INITIAL_DISPLAY_COUNT)).map((resume) => {
                  const resumeName = resume.personalInfo?.fullName 
                    ? `${resume.personalInfo.fullName}'s Resume` 
                    : resume.title || 'Untitled Resume';
                  
                  return (
                    <div key={resume._id} className="relative group">
                      <Link
                        to={`/resume/${resume._id}`}
                        className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-lg transition block"
                      >
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-indigo-600 mb-2" />
                        <h3 className="font-semibold text-sm sm:text-base truncate">{resumeName}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Updated {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                        {resume.template && (
                          <p className="text-[10px] sm:text-xs text-indigo-600 mt-1 capitalize">
                            {resume.template === 'classic' ? 'ATS-Friendly' : resume.template} Template
                          </p>
                        )}
                      </Link>
                      <button
                        onClick={(e) => handleDeleteResume(e, resume._id, resumeName)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {resumes.length > INITIAL_DISPLAY_COUNT && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllResumes(!showAllResumes)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    {showAllResumes ? 'Show Less' : `Show All (${resumes.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Portfolios */}
        <section className="mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Your Portfolios</h2>
          {portfolios.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">No portfolios yet. Create your first one!</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {(showAllPortfolios ? portfolios : portfolios.slice(0, INITIAL_DISPLAY_COUNT)).map((portfolio) => {
                  const portfolioName = portfolio.subdomain || 'Untitled';
                  
                  return (
                    <div key={portfolio._id} className="relative group">
                      <Link
                        to={`/portfolio/${portfolio._id}`}
                        className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-lg transition block"
                      >
                        <Globe className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-sm sm:text-base truncate">{portfolioName}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{portfolio.views} views</p>
                      </Link>
                      <button
                        onClick={(e) => handleDeletePortfolio(e, portfolio._id, portfolioName)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Delete portfolio"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {portfolios.length > INITIAL_DISPLAY_COUNT && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllPortfolios(!showAllPortfolios)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    {showAllPortfolios ? 'Show Less' : `Show All (${portfolios.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Cover Letters */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Your Cover Letters</h2>
          {coverLetters.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">No cover letters yet. Create your first one!</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {(showAllCoverLetters ? coverLetters : coverLetters.slice(0, INITIAL_DISPLAY_COUNT)).map((coverLetter) => {
                  return (
                    <div key={coverLetter._id} className="relative group">
                      <Link
                        to={`/cover-letter/${coverLetter._id}`}
                        className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-lg transition block"
                      >
                        <Mail className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600 mb-2" />
                        <h3 className="font-semibold text-sm sm:text-base truncate">{coverLetter.jobTitle}</h3>
                        {coverLetter.companyName && (
                          <p className="text-xs sm:text-sm text-gray-600">{coverLetter.companyName}</p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500">
                          Updated {new Date(coverLetter.updatedAt).toLocaleDateString()}
                        </p>
                      </Link>
                      <button
                        onClick={(e) => handleDeleteCoverLetter(e, coverLetter._id, coverLetter.jobTitle)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Delete cover letter"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {coverLetters.length > INITIAL_DISPLAY_COUNT && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllCoverLetters(!showAllCoverLetters)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    {showAllCoverLetters ? 'Show Less' : `Show All (${coverLetters.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

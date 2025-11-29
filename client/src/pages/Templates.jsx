import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const resumeTemplates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean centered layout perfect for corporate jobs',
      features: ['ATS-Friendly', 'Centered Header', 'Easy to Read', 'Professional'],
      popular: true,
      available: true,
      icon: '💼'
    },
    {
      id: 'classic',
      name: 'ATS-Friendly',
      description: 'Traditional left-aligned layout optimized for Applicant Tracking Systems',
      features: ['ATS-Optimized', 'Left-Aligned', 'Traditional', 'Simple'],
      popular: false,
      available: true,
      icon: '📋'
    },
    {
      id: 'chronological',
      name: 'Chronological',
      description: 'Traditional format emphasizing work history in reverse chronological order',
      features: ['Experience-Focused', 'Traditional', 'Centered Header', 'Professional'],
      popular: false,
      available: true,
      icon: '📅'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with subtle colors and modern typography',
      features: ['Modern Design', 'Color Accents', 'Typography Focus', 'Stylish'],
      popular: false,
      available: true,
      icon: '✨'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold and creative design for designers and creatives',
      features: ['Creative Layout', 'Colorful', 'Unique Design', 'Eye-catching'],
      popular: false,
      available: true,
      icon: '🎨'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Minimalist design focusing on content and readability',
      features: ['Minimalist', 'Clean', 'Simple', 'Content Focus'],
      popular: false,
      available: true,
      icon: '📄'
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Premium design for senior positions and executives',
      features: ['Premium Look', 'Executive Level', 'Sophisticated', 'Leadership'],
      popular: false,
      available: true,
      icon: '👔'
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Optimized for developers and technical professionals',
      features: ['Tech Focus', 'Skills Highlight', 'Projects Section', 'Developer'],
      popular: false,
      available: true,
      icon: '💻'
    }
  ];



  const handleUseTemplate = (templateId) => {
    if (!user) {
      navigate('/register');
      return;
    }

    // All resume templates are now available
    navigate(`/resume/new?template=${templateId}`);
  };

  return (
    <>
      <SEO 
        title="Resume Templates - CareerCraft AI"
        description="Choose from 8 professional, ATS-friendly resume templates. Modern, creative, minimal, and executive designs. All templates optimized for Applicant Tracking Systems."
        keywords="resume templates, ATS resume templates, professional resume, modern resume, creative resume, free resume templates"
        url="/templates"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header - Enhanced */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 shadow-sm border border-indigo-200">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              <span>8 Professional Templates</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-3 sm:mb-4 px-4">
              Choose Your Perfect Template
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Select from our professionally designed, ATS-friendly resume templates
            </p>
          </div>
        </div>

        {/* Templates Grid - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {resumeTemplates.map((template) => (
            <div
              key={template.id}
              className={`group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border ${
                template.popular ? 'ring-2 ring-indigo-600 border-indigo-200' : 'border-gray-200'
              } ${!template.available ? 'opacity-75' : ''}`}
            >
              {/* Template Preview */}
              <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden group-hover:from-indigo-50 group-hover:to-purple-50 transition-colors duration-300">
                {template.popular && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold z-10 shadow-lg flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                )}
                {template.comingSoon && (
                  <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl lg:text-5xl mb-2">{template.icon}</div>
                      <div className="bg-yellow-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Resume Skeleton Preview */}
                {(
                  <div className="h-full w-full flex items-start justify-center bg-gray-100 overflow-hidden pt-4">
                    <div className="bg-white shadow-sm overflow-hidden" style={{ width: '160px', height: '226px' }}>
                      <div style={{ transform: 'scale(0.44)', transformOrigin: 'top left', width: '364px', padding: '20px' }}>
                    {/* ATS-Friendly Template */}
                    {template.id === 'classic' && (
                      <div className="space-y-3">
                        {/* Header - Left Aligned */}
                        <div className="pb-3 border-b-2 border-gray-300">
                          <div className="h-5 bg-gray-900 w-40 mb-2 rounded"></div>
                          <div className="h-2.5 bg-gray-500 w-32 mb-2 rounded"></div>
                          <div className="flex gap-3 mt-2">
                            <div className="h-2 bg-gray-400 w-20 rounded"></div>
                            <div className="h-2 bg-gray-400 w-20 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Summary */}
                        <div className="mb-3">
                          <div className="h-3.5 bg-gray-700 w-32 mb-2 border-b border-gray-800 pb-1 rounded"></div>
                          <div className="h-2 bg-gray-300 w-full mb-1 rounded"></div>
                          <div className="h-2 bg-gray-300 w-full mb-1 rounded"></div>
                          <div className="h-2 bg-gray-300 w-3/4 rounded"></div>
                        </div>
                        
                        {/* Experience */}
                        <div className="mb-3">
                          <div className="h-3.5 bg-gray-700 w-28 mb-2 border-b border-gray-800 pb-1 rounded"></div>
                          <div className="mb-2">
                            <div className="flex justify-between mb-1">
                              <div className="h-2.5 bg-gray-800 w-28 rounded"></div>
                              <div className="h-2 bg-gray-400 w-20 rounded"></div>
                            </div>
                            <div className="h-2 bg-gray-600 w-24 mb-1 rounded"></div>
                            <div className="h-2 bg-gray-300 w-full rounded"></div>
                          </div>
                        </div>
                        
                        {/* Skills */}
                        <div className="mb-3">
                          <div className="h-3.5 bg-gray-700 w-16 mb-2 border-b border-gray-800 pb-1 rounded"></div>
                          <div className="flex flex-wrap gap-1">
                            <div className="h-2 bg-gray-400 w-12 rounded"></div>
                            <div className="h-2 bg-gray-400 w-14 rounded"></div>
                            <div className="h-2 bg-gray-400 w-10 rounded"></div>
                            <div className="h-2 bg-gray-400 w-16 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Education */}
                        <div>
                          <div className="h-3.5 bg-gray-700 w-20 mb-2 border-b border-gray-800 pb-1 rounded"></div>
                          <div className="h-2.5 bg-gray-800 w-32 mb-1 rounded"></div>
                          <div className="h-2 bg-gray-600 w-24 rounded"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Chronological Template - Two Column Layout */}
                    {template.id === 'chronological' && (
                      <div className="space-y-2">
                        {/* Header - Centered */}
                        <div className="text-center pb-2 border-b-2 border-gray-800">
                          <div className="h-4 bg-gray-900 w-36 mx-auto mb-1.5 rounded"></div>
                          <div className="h-2 bg-gray-500 w-40 mx-auto mb-0.5 rounded"></div>
                          <div className="h-1.5 bg-gray-400 w-32 mx-auto rounded"></div>
                        </div>
                        
                        {/* Two Column Layout */}
                        <div className="flex gap-2.5">
                          {/* Left Sidebar - 1/3 width */}
                          <div className="w-1/3 space-y-2.5 bg-gray-50 p-2 border-r-2 border-gray-300">
                            {/* Contact */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-16 mb-1.5 font-bold rounded"></div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                                  <div className="h-1.5 bg-gray-500 w-full rounded"></div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                                  <div className="h-1.5 bg-gray-500 w-4/5 rounded"></div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                                  <div className="h-1.5 bg-gray-500 w-3/4 rounded"></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Skills */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-12 mb-1.5 font-bold rounded"></div>
                              <div className="space-y-0.5">
                                <div className="h-1.5 bg-gray-600 w-full rounded"></div>
                                <div className="h-1.5 bg-gray-600 w-full rounded"></div>
                                <div className="h-1.5 bg-gray-600 w-4/5 rounded"></div>
                                <div className="h-1.5 bg-gray-600 w-full rounded"></div>
                                <div className="h-1.5 bg-gray-600 w-3/4 rounded"></div>
                              </div>
                            </div>
                            
                            {/* Education */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-20 mb-1.5 font-bold rounded"></div>
                              <div className="space-y-1">
                                <div className="h-2 bg-gray-700 w-full mb-0.5 rounded"></div>
                                <div className="h-1.5 bg-gray-500 w-4/5 mb-0.5 rounded"></div>
                                <div className="h-1.5 bg-gray-400 w-16 rounded"></div>
                              </div>
                            </div>
                            
                            {/* Certifications */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-24 mb-1.5 font-bold rounded"></div>
                              <div className="space-y-1">
                                <div className="h-1.5 bg-gray-700 w-full rounded"></div>
                                <div className="h-1 bg-gray-500 w-3/4 rounded"></div>
                              </div>
                            </div>
                            
                            {/* Languages */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-20 mb-1.5 font-bold rounded"></div>
                              <div className="space-y-0.5">
                                <div className="h-1.5 bg-gray-600 w-16 rounded"></div>
                                <div className="h-1.5 bg-gray-600 w-14 rounded"></div>
                                <div className="h-1.5 bg-gray-600 w-12 rounded"></div>
                              </div>
                            </div>
                            
                            {/* Interests */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-16 mb-1.5 font-bold rounded"></div>
                              <div className="space-y-0.5">
                                <div className="h-1.5 bg-gray-600 w-20 rounded"></div>
                                <div className="h-1.5 bg-gray-600 w-16 rounded"></div>
                                <div className="h-1.5 bg-gray-600 w-18 rounded"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right Main Content - 2/3 width */}
                          <div className="w-2/3 space-y-2.5 pr-1">
                            {/* About/Summary */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-20 mb-1.5 border-b border-gray-800 pb-0.5 font-bold rounded"></div>
                              <div className="space-y-0.5">
                                <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                                <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                                <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                                <div className="h-1.5 bg-gray-300 w-4/5 rounded"></div>
                              </div>
                            </div>
                            
                            {/* Experience - Main Focus */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-28 mb-1.5 border-b border-gray-800 pb-0.5 font-bold rounded"></div>
                              <div className="space-y-2">
                                {/* Job 1 */}
                                <div>
                                  <div className="flex justify-between mb-0.5">
                                    <div className="h-2 bg-gray-800 w-28 rounded"></div>
                                    <div className="h-1.5 bg-gray-400 w-20 rounded"></div>
                                  </div>
                                  <div className="h-1.5 bg-gray-600 w-24 mb-1 rounded"></div>
                                  <div className="space-y-0.5 ml-2">
                                    <div className="flex gap-1">
                                      <div className="h-1 w-1 bg-gray-500 rounded-full mt-0.5"></div>
                                      <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                                    </div>
                                    <div className="flex gap-1">
                                      <div className="h-1 w-1 bg-gray-500 rounded-full mt-0.5"></div>
                                      <div className="h-1.5 bg-gray-300 w-11/12 rounded"></div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Job 2 */}
                                <div>
                                  <div className="flex justify-between mb-0.5">
                                    <div className="h-2 bg-gray-800 w-28 rounded"></div>
                                    <div className="h-1.5 bg-gray-400 w-20 rounded"></div>
                                  </div>
                                  <div className="h-1.5 bg-gray-600 w-24 mb-1 rounded"></div>
                                  <div className="space-y-0.5 ml-2">
                                    <div className="flex gap-1">
                                      <div className="h-1 w-1 bg-gray-500 rounded-full mt-0.5"></div>
                                      <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                                    </div>
                                    <div className="flex gap-1">
                                      <div className="h-1 w-1 bg-gray-500 rounded-full mt-0.5"></div>
                                      <div className="h-1.5 bg-gray-300 w-10/12 rounded"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Projects */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-20 mb-1.5 border-b border-gray-800 pb-0.5 font-bold rounded"></div>
                              <div className="space-y-1">
                                <div className="h-2 bg-gray-700 w-32 mb-0.5 rounded"></div>
                                <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                                <div className="h-1.5 bg-gray-300 w-3/4 rounded"></div>
                              </div>
                            </div>
                            
                            {/* Certifications */}
                            <div>
                              <div className="h-2.5 bg-gray-800 w-28 mb-1.5 border-b border-gray-800 pb-0.5 font-bold rounded"></div>
                              <div className="space-y-0.5">
                                <div className="flex justify-between">
                                  <div className="h-1.5 bg-gray-600 w-32 rounded"></div>
                                  <div className="h-1.5 bg-gray-400 w-16 rounded"></div>
                                </div>
                                <div className="flex justify-between">
                                  <div className="h-1.5 bg-gray-600 w-28 rounded"></div>
                                  <div className="h-1.5 bg-gray-400 w-16 rounded"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Creative Template Preview */}
                    {template.id === 'creative' && (
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 p-2 rounded-lg text-white">
                          <div className="h-4 bg-white/90 w-28 mb-1 rounded"></div>
                          <div className="h-1.5 bg-white/70 w-20 rounded"></div>
                          <div className="flex gap-2 mt-1">
                            <div className="h-1.5 bg-white/60 w-16 rounded"></div>
                            <div className="h-1.5 bg-white/60 w-16 rounded"></div>
                          </div>
                        </div>
                        {/* Summary */}
                        <div className="px-2">
                          <div className="h-2.5 bg-gradient-to-r from-pink-600 to-purple-600 w-20 mb-1 rounded"></div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                            <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                            <div className="h-1.5 bg-gray-300 w-3/4 rounded"></div>
                          </div>
                        </div>
                        {/* Experience */}
                        <div className="px-2">
                          <div className="h-2.5 bg-gradient-to-r from-pink-600 to-purple-600 w-24 mb-1 rounded"></div>
                          <div className="mb-2">
                            <div className="h-2 bg-gray-700 w-24 mb-1 rounded"></div>
                            <div className="h-1.5 bg-purple-500 w-20 mb-1 rounded"></div>
                            <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                          </div>
                        </div>
                        {/* Skills */}
                        <div className="px-2">
                          <div className="h-2.5 bg-gradient-to-r from-pink-600 to-purple-600 w-14 mb-1 rounded"></div>
                          <div className="flex flex-wrap gap-1">
                            <div className="h-2 bg-gradient-to-r from-pink-200 to-purple-200 border-2 border-purple-400 w-12 rounded-full"></div>
                            <div className="h-2 bg-gradient-to-r from-pink-200 to-purple-200 border-2 border-purple-400 w-14 rounded-full"></div>
                            <div className="h-2 bg-gradient-to-r from-pink-200 to-purple-200 border-2 border-purple-400 w-10 rounded-full"></div>
                          </div>
                        </div>
                        {/* Education */}
                        <div className="px-2">
                          <div className="h-2.5 bg-gradient-to-r from-pink-600 to-purple-600 w-18 mb-1 rounded"></div>
                          <div className="h-2 bg-gray-700 w-28 mb-1 rounded"></div>
                          <div className="h-1.5 bg-purple-500 w-24 rounded"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Minimal Template Preview */}
                    {template.id === 'minimal' && (
                      <div className="space-y-3 font-light">
                        {/* Header */}
                        <div className="pb-2 border-b border-gray-300">
                          <div className="h-5 bg-gray-900 w-32 mb-1 rounded-sm"></div>
                          <div className="h-1.5 bg-gray-400 w-24 rounded-sm"></div>
                        </div>
                        {/* Summary */}
                        <div>
                          <div className="h-2 bg-gray-800 w-16 mb-1 border-b border-gray-200 pb-1 rounded-sm"></div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-300 w-full rounded-sm"></div>
                            <div className="h-1.5 bg-gray-300 w-full rounded-sm"></div>
                            <div className="h-1.5 bg-gray-300 w-3/4 rounded-sm"></div>
                          </div>
                        </div>
                        {/* Experience */}
                        <div>
                          <div className="h-2 bg-gray-800 w-20 mb-1 border-b border-gray-200 pb-1 rounded-sm"></div>
                          <div className="mb-2">
                            <div className="flex justify-between mb-1">
                              <div className="h-2 bg-gray-700 w-24 rounded-sm"></div>
                              <div className="h-1.5 bg-gray-400 w-16 rounded-sm"></div>
                            </div>
                            <div className="h-1.5 bg-gray-500 w-20 mb-1 rounded-sm"></div>
                            <div className="h-1.5 bg-gray-300 w-full rounded-sm"></div>
                          </div>
                        </div>
                        {/* Skills */}
                        <div>
                          <div className="h-2 bg-gray-800 w-12 mb-1 border-b border-gray-200 pb-1 rounded-sm"></div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-300 w-full rounded-sm"></div>
                            <div className="h-1.5 bg-gray-300 w-4/5 rounded-sm"></div>
                          </div>
                        </div>
                        {/* Education */}
                        <div>
                          <div className="h-2 bg-gray-800 w-18 mb-1 border-b border-gray-200 pb-1 rounded-sm"></div>
                          <div className="h-2 bg-gray-700 w-28 mb-1 rounded-sm"></div>
                          <div className="h-1.5 bg-gray-500 w-24 rounded-sm"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Professional Template */}
                    {template.id === 'professional' && (
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="text-center pb-3 border-b-2 border-gray-800">
                          <div className="h-5 bg-gray-900 w-40 mx-auto mb-2 rounded"></div>
                          <div className="h-2.5 bg-gray-500 w-32 mx-auto mb-2 rounded"></div>
                          <div className="flex justify-center gap-3 mt-2">
                            <div className="h-2 bg-gray-400 w-20 rounded"></div>
                            <div className="h-2 bg-gray-400 w-20 rounded"></div>
                            <div className="h-2 bg-gray-400 w-20 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Summary */}
                        <div>
                          <div className="h-3.5 bg-gray-800 w-32 mb-2 rounded font-bold"></div>
                          <div className="space-y-1.5">
                            <div className="h-2 bg-gray-300 w-full rounded"></div>
                            <div className="h-2 bg-gray-300 w-full rounded"></div>
                            <div className="h-2 bg-gray-300 w-4/5 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Experience */}
                        <div>
                          <div className="h-3.5 bg-gray-800 w-36 mb-2 rounded font-bold"></div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <div className="h-2.5 bg-gray-700 w-32 rounded"></div>
                                <div className="h-2 bg-gray-400 w-24 rounded"></div>
                              </div>
                              <div className="h-2 bg-gray-500 w-28 mb-2 rounded"></div>
                              <div className="space-y-1 ml-3">
                                <div className="flex gap-2">
                                  <div className="h-1.5 w-1.5 bg-gray-600 rounded-full mt-1"></div>
                                  <div className="h-2 bg-gray-300 w-full rounded"></div>
                                </div>
                                <div className="flex gap-2">
                                  <div className="h-1.5 w-1.5 bg-gray-600 rounded-full mt-1"></div>
                                  <div className="h-2 bg-gray-300 w-11/12 rounded"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Skills */}
                        <div>
                          <div className="h-3.5 bg-gray-800 w-20 mb-2 rounded font-bold"></div>
                          <div className="flex flex-wrap gap-2">
                            <div className="h-2.5 bg-gray-200 border border-gray-400 w-16 rounded"></div>
                            <div className="h-2.5 bg-gray-200 border border-gray-400 w-20 rounded"></div>
                            <div className="h-2.5 bg-gray-200 border border-gray-400 w-14 rounded"></div>
                            <div className="h-2.5 bg-gray-200 border border-gray-400 w-18 rounded"></div>
                            <div className="h-2.5 bg-gray-200 border border-gray-400 w-16 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Education */}
                        <div>
                          <div className="h-3.5 bg-gray-800 w-28 mb-2 rounded font-bold"></div>
                          <div className="flex justify-between mb-1">
                            <div className="h-2.5 bg-gray-700 w-40 rounded"></div>
                            <div className="h-2 bg-gray-400 w-20 rounded"></div>
                          </div>
                          <div className="h-2 bg-gray-500 w-36 rounded"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Modern Template Preview */}
                    {template.id === 'modern' && (
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start gap-3 pb-2 border-b-2 border-indigo-400">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-indigo-900 w-32 mb-1 rounded"></div>
                            <div className="h-2 bg-indigo-600 w-24 mb-1 rounded"></div>
                            <div className="flex gap-2">
                              <div className="h-1.5 bg-gray-400 w-16 rounded"></div>
                              <div className="h-1.5 bg-gray-400 w-16 rounded"></div>
                            </div>
                          </div>
                        </div>
                        {/* Summary */}
                        <div>
                          <div className="h-2.5 bg-indigo-700 w-16 mb-1 rounded"></div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                            <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                            <div className="h-1.5 bg-gray-300 w-3/4 rounded"></div>
                          </div>
                        </div>
                        {/* Experience */}
                        <div>
                          <div className="h-2.5 bg-indigo-700 w-20 mb-1 rounded"></div>
                          <div className="mb-2">
                            <div className="flex justify-between mb-1">
                              <div className="h-2 bg-gray-700 w-24 rounded"></div>
                              <div className="h-1.5 bg-gray-400 w-16 rounded"></div>
                            </div>
                            <div className="h-1.5 bg-indigo-500 w-20 mb-1 rounded"></div>
                            <div className="h-1.5 bg-gray-300 w-full rounded"></div>
                          </div>
                        </div>
                        {/* Skills */}
                        <div>
                          <div className="h-2.5 bg-indigo-700 w-14 mb-1 rounded"></div>
                          <div className="flex flex-wrap gap-1">
                            <div className="h-2 bg-indigo-200 border border-indigo-400 w-12 rounded-full"></div>
                            <div className="h-2 bg-indigo-200 border border-indigo-400 w-14 rounded-full"></div>
                            <div className="h-2 bg-indigo-200 border border-indigo-400 w-10 rounded-full"></div>
                            <div className="h-2 bg-indigo-200 border border-indigo-400 w-16 rounded-full"></div>
                          </div>
                        </div>
                        {/* Education */}
                        <div>
                          <div className="h-2.5 bg-indigo-700 w-18 mb-1 rounded"></div>
                          <div className="h-2 bg-gray-700 w-28 mb-1 rounded"></div>
                          <div className="h-1.5 bg-indigo-500 w-24 rounded"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Executive Template Preview */}
                    {template.id === 'executive' && (
                      <div className="space-y-2 bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                        {/* Header */}
                        <div className="text-center pb-2 border-b-4 border-gray-800">
                          <div className="h-4 bg-gray-900 w-32 mx-auto mb-1 rounded"></div>
                          <div className="h-1.5 bg-gray-600 w-40 mx-auto mb-1 rounded"></div>
                          <div className="h-1.5 bg-gray-500 w-36 mx-auto rounded"></div>
                        </div>
                        {/* Summary */}
                        <div>
                          <div className="h-2.5 bg-gray-800 w-28 mb-1 border-b-2 border-gray-800 pb-1 rounded"></div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-400 w-full rounded"></div>
                            <div className="h-1.5 bg-gray-400 w-full rounded"></div>
                            <div className="h-1.5 bg-gray-400 w-3/4 rounded"></div>
                          </div>
                        </div>
                        {/* Experience */}
                        <div>
                          <div className="h-2.5 bg-gray-800 w-32 mb-1 border-b-2 border-gray-800 pb-1 rounded"></div>
                          <div className="mb-2">
                            <div className="flex justify-between mb-1">
                              <div className="h-2 bg-gray-800 w-24 rounded"></div>
                              <div className="h-1.5 bg-gray-500 w-16 rounded"></div>
                            </div>
                            <div className="h-1.5 bg-gray-600 w-20 mb-1 rounded"></div>
                            <div className="h-1.5 bg-gray-400 w-full rounded"></div>
                          </div>
                        </div>
                        {/* Skills & Education Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="h-2 bg-gray-800 w-20 mb-1 border-b-2 border-gray-800 pb-1 rounded"></div>
                            <div className="h-1.5 bg-gray-400 w-full rounded"></div>
                          </div>
                          <div>
                            <div className="h-2 bg-gray-800 w-18 mb-1 border-b-2 border-gray-800 pb-1 rounded"></div>
                            <div className="h-1.5 bg-gray-400 w-full rounded"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Technical Template Preview */}
                    {template.id === 'technical' && (
                      <div className="space-y-2 bg-gray-900 text-white p-3 font-mono">
                        {/* Header */}
                        <div className="border-2 border-gray-700 p-2 bg-gray-800">
                          <div className="h-1.5 bg-green-400 w-24 mb-1 rounded"></div>
                          <div className="h-3 bg-blue-400 w-28 mb-1 rounded"></div>
                          <div className="h-1.5 bg-gray-500 w-32 rounded"></div>
                        </div>
                        {/* About */}
                        <div className="border-l-2 border-gray-700 pl-2">
                          <div className="h-2 bg-green-400 w-20 mb-1 rounded"></div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-600 w-full rounded"></div>
                            <div className="h-1.5 bg-gray-600 w-full rounded"></div>
                            <div className="h-1.5 bg-gray-600 w-3/4 rounded"></div>
                          </div>
                        </div>
                        {/* Skills */}
                        <div className="border-l-2 border-gray-700 pl-2">
                          <div className="h-2 bg-green-400 w-16 mb-1 rounded"></div>
                          <div className="flex flex-wrap gap-1">
                            <div className="h-2 bg-blue-600 w-12 rounded"></div>
                            <div className="h-2 bg-blue-600 w-14 rounded"></div>
                            <div className="h-2 bg-blue-600 w-10 rounded"></div>
                            <div className="h-2 bg-blue-600 w-16 rounded"></div>
                          </div>
                        </div>
                        {/* Experience */}
                        <div className="border-l-2 border-gray-700 pl-2">
                          <div className="h-2 bg-green-400 w-24 mb-1 rounded"></div>
                          <div className="mb-1">
                            <div className="h-2 bg-orange-400 w-24 mb-1 rounded"></div>
                            <div className="h-1.5 bg-blue-400 w-20 mb-1 rounded"></div>
                            <div className="h-1.5 bg-gray-600 w-full rounded"></div>
                          </div>
                        </div>
                        {/* Education */}
                        <div className="border-l-2 border-gray-700 pl-2">
                          <div className="h-2 bg-green-400 w-18 mb-1 rounded"></div>
                          <div className="h-1.5 bg-orange-400 w-28 mb-1 rounded"></div>
                          <div className="h-1.5 bg-blue-400 w-24 rounded"></div>
                        </div>
                      </div>
                    )}
                    </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Info - Enhanced */}
              <div className="p-4 sm:p-5 lg:p-6 relative">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {template.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Features - Enhanced */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                  {template.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-[10px] sm:text-xs rounded-full border border-gray-200 font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Actions - Enhanced */}
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={!template.available}
                  className={`w-full py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    template.available
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-xl hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {template.available ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Use This Template</span>
                    </>
                  ) : (
                    'Coming Soon'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section - Enhanced */}
        <div className="mt-10 sm:mt-12 lg:mt-16 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 sm:p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs sm:text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              <span>MORE COMING SOON</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto">
              More templates are coming soon! We're constantly adding new designs to help you stand out.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base lg:text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Check className="w-5 h-5" />
              Start Building Now
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

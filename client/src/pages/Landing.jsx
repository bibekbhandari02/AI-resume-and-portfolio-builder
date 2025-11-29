import { Link, Navigate } from 'react-router-dom';
import { FileText, Globe, Sparkles, Zap, Users, Award, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import SEO from '../components/SEO';

export default function Landing() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    users: 0,
    resumes: 0,
    successRate: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Fetch real statistics
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/public/stats');
        setStats({
          users: data.users || 0,
          resumes: data.resumes || 0,
          successRate: data.successRate || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Format numbers with K suffix
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return `${num}+`;
  };

  // Redirect to dashboard if user is logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <SEO 
        title="CareerCraft AI - AI-Powered Resume, Portfolio & Cover Letter Builder"
        description="Create ATS-friendly resumes, stunning portfolio websites, and personalized cover letters in minutes. Powered by AI to help you land your dream job. Free to start!"
        keywords="resume builder, AI resume, portfolio builder, cover letter generator, ATS resume, job application, career tools, Nepal, free resume builder"
        url="/"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            AI-Powered Career Tools
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Build Your Career with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              CareerCraft AI
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            Create ATS-friendly resumes, stunning portfolio websites, and personalized cover letters in minutes. 
            Powered by AI to help you stand out and land your dream job.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Try It Free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-50 inline-block border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 text-center"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-10 sm:mt-12 lg:mt-16 max-w-2xl mx-auto px-4">
            <div>
              {loadingStats ? (
                <div className="h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
              ) : (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600">
                  {formatNumber(stats.resumes)}
                </div>
              )}
              <div className="text-sm sm:text-base text-gray-600 mt-1">Resumes Created</div>
            </div>
            <div>
              {loadingStats ? (
                <div className="h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
              ) : (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600">
                  {formatNumber(stats.users)}
                </div>
              )}
              <div className="text-sm sm:text-base text-gray-600 mt-1">Happy Users</div>
            </div>
            <div>
              {loadingStats ? (
                <div className="h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
              ) : (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-600">
                  {stats.successRate}%
                </div>
              )}
              <div className="text-sm sm:text-base text-gray-600 mt-1">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-7xl">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="relative text-center">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl font-bold text-white">1</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">Sign Up Free</h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Create your account in seconds. No credit card required.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative text-center">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl font-bold text-white">2</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">Choose & Create</h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Pick a template and let AI help you create professional content.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative text-center">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl font-bold text-white">3</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">Download & Apply</h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Export as PDF and start applying to your dream jobs.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8 sm:mt-10 lg:mt-12 px-4">
          <Link 
            to="/templates" 
            className="w-full sm:w-auto bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-50 inline-block border-2 border-indigo-600 hover:border-indigo-700 transition-all duration-300 text-center"
          >
            View Templates
          </Link>
          <Link 
            to="/pricing" 
            className="w-full sm:w-auto bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-50 inline-block border-2 border-purple-600 hover:border-purple-700 transition-all duration-300 text-center"
          >
            See Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-7xl bg-gray-50">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools designed to help you create professional career documents effortlessly
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          <div className="group bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-gray-900">AI Resume Builder</h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Generate ATS-optimized resumes with professional templates and AI-enhanced content that gets you noticed.
            </p>
          </div>

          <div className="group bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-gray-900">Portfolio Generator</h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Create stunning portfolio websites automatically with custom domains and beautiful dark themes.
            </p>
          </div>

          <div className="group bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-gray-900">AI Content Writer</h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Generate personalized cover letters and professional content tailored to specific job positions.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-7xl">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 xl:p-16 text-white">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">Why Choose CareerCraft AI?</h2>
            <p className="text-base sm:text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto px-4">
              Join thousands of professionals who trust us with their career success
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto">
            {[
              { icon: Award, text: '90+ ATS Score Guaranteed' },
              { icon: Zap, text: '5-Minute Setup' },
              { icon: FileText, text: 'Download in Multiple Formats' },
              { icon: Sparkles, text: 'AI-Powered Content Enhancement' },
              { icon: Globe, text: 'One-Click Portfolio Generation' },
              { icon: Users, text: 'Custom Domain Support' }
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-white font-medium text-sm sm:text-base">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <Link 
              to="/register" 
              className="w-full sm:w-auto bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Create Your Resume
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-7xl">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 xl:p-16 shadow-xl border border-gray-100 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            Ready to Build Your Future?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Start creating professional resumes, portfolios, and cover letters today. No credit card required.
          </p>
          <Link 
            to="/register" 
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl text-base sm:text-lg lg:text-xl font-semibold hover:from-indigo-700 hover:to-purple-700 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 max-w-7xl border-t border-gray-200">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="bg-indigo-600 text-white p-1.5 sm:p-2 rounded-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">CareerCraft AI</span>
            </button>
            <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md">
              Empowering careers with AI-powered tools. Create professional resumes, portfolios, and cover letters in minutes.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📧</span>
              <a href="mailto:narutobibek000@gmail.com" className="hover:text-indigo-600 transition-colors">
                narutobibek000@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link to="/templates" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Resources</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <a href="mailto:narutobibek000@gmail.com" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CareerCraft AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}

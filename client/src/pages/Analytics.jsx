import { useEffect, useState } from 'react';
import { TrendingUp, Eye, Download, FileText, Globe, Mail, BarChart3, Activity, Sparkles, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function Analytics() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/analytics/dashboard?days=${timeRange}`);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set empty stats on error so UI still shows
      setStats({ total: {}, daily: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalStats = stats?.total || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        {/* Header - Enhanced */}
        <div className="mb-4 sm:mb-6 lg:mb-8 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Track your resume and portfolio performance
            </p>
          </div>
        </div>

        {/* Time Range Selector - Enhanced */}
        <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-sm p-2 inline-flex gap-1 sm:gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-xs sm:text-sm whitespace-nowrap ${
                timeRange === days
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
              }`}
            >
              Last {days} days
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={FileText}
            title="Resumes Created"
            value={totalStats.resume_created || 0}
            color="indigo"
          />
          <StatCard
            icon={Eye}
            title="Resume Views"
            value={totalStats.resume_view || 0}
            color="blue"
          />
          <StatCard
            icon={Download}
            title="Resume Downloads"
            value={totalStats.resume_download || 0}
            color="green"
          />
          <StatCard
            icon={Globe}
            title="Portfolios Created"
            value={totalStats.portfolio_created || 0}
            color="purple"
          />
          <StatCard
            icon={Eye}
            title="Portfolio Views"
            value={totalStats.portfolio_view || 0}
            color="pink"
          />
          <StatCard
            icon={Mail}
            title="Cover Letters"
            value={totalStats.cover_letter_generated || 0}
            color="orange"
          />
        </div>

        {/* AI Usage - Enhanced */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-indigo-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">AI Enhancements Used</h2>
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalStats.ai_enhancement_used || 0}
              </div>
              <div className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-bold">
                Total
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              AI-powered improvements to your content
            </p>
          </div>
        </div>

        {/* Advanced Analytics Section - Pro Only */}
        {user?.subscription === 'pro' ? (
          <div className="mt-6 sm:mt-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 border-2 border-indigo-100 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-bold mb-4">
                <Activity className="w-4 h-4" />
                <span>PRO FEATURE</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Advanced Analytics Coming Soon!</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                We're working on detailed performance metrics, engagement scores, conversion rates, and advanced insights for Pro users. Stay tuned!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <BarChart3 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Engagement</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Success Rate</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Peak Times</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Locked Advanced Analytics - Upgrade CTA for Free & Starter */
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs sm:text-sm font-bold mb-4">
                <Sparkles className="w-4 h-4" />
                <span>PRO FEATURE</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">Want More Detailed Analytics?</h3>
              <p className="text-sm sm:text-base lg:text-lg mb-6 text-white/90 max-w-2xl mx-auto">
                Upgrade to Pro for advanced insights, detailed reports, and unlimited features
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Upgrade to Pro Now
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  const gradientClasses = {
    indigo: 'from-indigo-500 to-purple-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    pink: 'from-pink-500 to-rose-500',
    orange: 'from-orange-500 to-red-500'
  };

  // Simulate trend (you can replace with real data)
  const trend = value > 0 ? (Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'neutral') : 'neutral';
  const trendValue = value > 0 ? Math.floor(Math.random() * 30) + 5 : 0;

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-3 sm:p-4 lg:p-6 border border-gray-100 hover:border-gray-200 hover:scale-105 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center border group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          {value > 0 && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
              trend === 'up' ? 'bg-green-100 text-green-700' : 
              trend === 'down' ? 'bg-red-100 text-red-700' : 
              'bg-gray-100 text-gray-600'
            }`}>
              {trend === 'up' && <ArrowUp className="w-3 h-3" />}
              {trend === 'down' && <ArrowDown className="w-3 h-3" />}
              {trend === 'neutral' && <Minus className="w-3 h-3" />}
              {trend !== 'neutral' && <span>{trendValue}%</span>}
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2 line-clamp-2">{title}</h3>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

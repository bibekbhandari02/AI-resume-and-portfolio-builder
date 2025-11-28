import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, FileText, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo - Enhanced with better animation */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-1.5 sm:p-2 rounded-lg group-hover:scale-110 transition-all duration-300 shadow-md">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                CareerCraft AI
              </span>
              <span className="text-[10px] text-gray-500 font-medium hidden sm:block">Build Your Future</span>
            </div>
          </Link>

          {/* Desktop Navigation - Enhanced */}
          {user ? (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link 
                to="/dashboard" 
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base whitespace-nowrap ${
                  isActive('/dashboard') 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/analytics" 
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base whitespace-nowrap ${
                  isActive('/analytics') 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Analytics
              </Link>
              <Link 
                to="/templates" 
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base whitespace-nowrap ${
                  isActive('/templates') 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Templates
              </Link>
              <Link 
                to="/pricing" 
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base whitespace-nowrap ${
                  isActive('/pricing') 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Pricing
              </Link>
              
              {/* User Info - Enhanced */}
              <div className="flex items-center gap-2 lg:gap-3 ml-2 lg:ml-4 pl-2 lg:pl-4 border-l border-gray-200">
                {/* Credits Badge - Enhanced with animation */}
                <div className="relative group/credits">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg blur opacity-0 group-hover/credits:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
                    <span className="text-[10px] lg:text-xs font-bold text-green-700 whitespace-nowrap flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      {user.credits?.resumeGenerations || 0}
                    </span>
                  </div>
                </div>

                {/* User Menu - Enhanced */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg hover:bg-gray-50 transition-all hover:shadow-sm"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-sm opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-full ring-2 ring-white">
                        <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                      </div>
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-semibold text-gray-900 max-w-[100px] truncate">{user.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize flex items-center gap-1">
                        {user.subscription === 'pro' && <span className="text-yellow-500">⭐</span>}
                        {user.subscription}
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu - Enhanced with animation */}
                  {userMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)}
                      ></div>
                      
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-slideDown">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-purple-50">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
                            {user.subscription === 'pro' && (
                              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">PRO</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 capitalize">{user.subscription} Plan</div>
                        </div>
                        <Link
                          to="/pricing"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Sparkles className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Upgrade Plan</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left group"
                        >
                          <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link 
                to="/templates" 
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base ${
                  isActive('/templates') 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Templates
              </Link>
              <Link 
                to="/pricing" 
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base ${
                  isActive('/pricing') 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Pricing
              </Link>
              <Link 
                to="/login" 
                className="px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="ml-2 relative group/cta bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-bold transition-all shadow-md hover:shadow-xl hover:scale-105 text-sm lg:text-base whitespace-nowrap overflow-hidden"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-700"></div>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button - Enhanced with animation */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all hover:scale-110 active:scale-95"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700 animate-spin-once" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - Enhanced with better design */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 animate-slideDown">
            {user ? (
              <div className="space-y-2">
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-xl mb-4 border-2 border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-sm opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-full ring-2 ring-white">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {user.name}
                        {user.subscription === 'pro' && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">PRO</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">{user.subscription} Plan</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-lg shadow-sm border border-green-100">
                    <Sparkles className="w-4 h-4 text-green-600 animate-pulse" />
                    <span className="text-sm font-bold text-green-700">
                      {user.credits?.resumeGenerations || 0} Credits
                    </span>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/analytics"
                  className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive('/analytics') 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  to="/templates"
                  className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive('/templates') 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Templates
                </Link>
                <Link
                  to="/pricing"
                  className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive('/pricing') 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-semibold w-full transition-all mt-4 border-2 border-red-200 hover:border-red-300 hover:shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/templates"
                  className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive('/templates') 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Templates
                </Link>
                <Link
                  to="/pricing"
                  className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive('/pricing') 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-bold text-center shadow-lg hover:shadow-xl transition-all mt-4 hover:scale-105 active:scale-95"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free →
                </Link>
              </div>
            )}
          </div>
        )}
        
        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.2s ease-out;
          }
          
          @keyframes spin-once {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(90deg);
            }
          }
          .animate-spin-once {
            animation: spin-once 0.2s ease-out;
          }
        `}</style>
      </div>
    </header>
  );
}

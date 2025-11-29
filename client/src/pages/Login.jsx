import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FileText, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/errorHandler';
import SEO from '../components/SEO';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.user, response.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      handleApiError(error, 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Login - CareerCraft AI"
        description="Sign in to your CareerCraft AI account to create professional resumes, portfolios, and cover letters."
        url="/login"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">CareerCraft AI</h1>
                  <p className="text-gray-600">Build Your Future</p>
                </div>
              </div>
              
              <div className="space-y-4 mt-8">
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Welcome Back to Your Career Journey
                </h2>
                <p className="text-lg text-gray-600">
                  Continue creating professional resumes, stunning portfolios, and personalized cover letters with AI.
                </p>
              </div>

              <div className="space-y-3 mt-8">
                {[
                  { icon: Sparkles, text: 'AI-Powered Content Enhancement' },
                  { icon: FileText, text: 'ATS-Optimized Templates' },
                  { icon: ArrowRight, text: 'One-Click Portfolio Generation' }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <feature.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CareerCraft AI</span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to continue to your dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-sm">{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                  Create Account
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

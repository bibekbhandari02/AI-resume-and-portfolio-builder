import { useEffect } from 'react';
import { Check, Sparkles, Zap, Crown, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Pricing() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubscribe = async (plan) => {
    if (!token) {
      navigate('/register');
      return;
    }

    if (plan === 'free') {
      navigate('/dashboard');
      return;
    }

    try {
      toast.loading('Redirecting to eSewa...', { id: 'payment' });
      const { data } = await api.post('/payment/initiate', { plan });
      
      if (data.success) {
        // Create form and submit to eSewa
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;

        Object.keys(data.paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data.paymentData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        toast.success('Opening eSewa payment gateway...', { id: 'payment' });
        form.submit();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to initiate payment';
      toast.error(errorMessage, { id: 'payment' });
      console.error('Payment error:', error);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 'NPR 0',
      features: [
        '5 resume generations',
        '1 portfolio',
        'Basic templates',
        'Watermark included',
        'PDF export'
      ],
      cta: 'Get Started',
      plan: 'free'
    },
    {
      name: 'Starter',
      price: 'NPR 600',
      period: '/month',
      features: [
        '20 resume generations',
        '3 portfolios',
        'All templates',
        'No watermark',
        'PDF & DOCX export',
        'ATS reports'
      ],
      cta: 'Subscribe',
      plan: 'starter',
      popular: true
    },
    {
      name: 'Pro',
      price: 'NPR 1800',
      period: '/month',
      features: [
        'Unlimited resumes',
        '10 portfolios',
        'All templates',
        'Custom domain',
        'Priority AI',
        'Advanced analytics',
        'Cover letters'
      ],
      cta: 'Subscribe',
      plan: 'pro'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Enhanced */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10 relative px-4">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-sm sm:text-base font-bold mb-2 sm:mb-3 shadow-sm border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
              <span>Simple & Transparent</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2 sm:mb-3">
              Choose Your Perfect Plan
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Start free, upgrade anytime. No hidden fees.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const icons = [Star, Zap, Crown];
            const Icon = icons[index];
            
            return (
              <div
                key={plan.name}
                className={`group relative bg-white rounded-xl shadow-lg p-4 sm:p-5 transition-all duration-300 border-2 ${
                  plan.popular 
                    ? 'border-indigo-600 lg:scale-105' 
                    : 'border-gray-200 hover:border-indigo-300'
                } hover:shadow-xl hover:scale-105`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 sm:py-1.5 rounded-full text-sm sm:text-base font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-1.5 sm:p-2 rounded-lg mb-2 sm:mb-3 ${
                  index === 0 ? 'bg-gray-100' : 
                  index === 1 ? 'bg-indigo-100' : 
                  'bg-purple-100'
                }`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    index === 0 ? 'text-gray-600' : 
                    index === 1 ? 'text-indigo-600' : 
                    'text-purple-600'
                  }`} />
                </div>

                {/* Plan Name */}
                <h3 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">{plan.name}</h3>
                
                {/* Price */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {plan.price.split(' ')[1]}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600 text-sm sm:text-base">{plan.period}</span>
                    )}
                  </div>
                  {plan.name === 'Free' && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Forever free</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        index === 0 ? 'bg-green-100' : 
                        index === 1 ? 'bg-indigo-100' : 
                        'bg-purple-100'
                      }`}>
                        <Check className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                          index === 0 ? 'text-green-600' : 
                          index === 1 ? 'text-indigo-600' : 
                          'text-purple-600'
                        }`} />
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.plan)}
                  className={`w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    plan.name === 'Pro'
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-md hover:shadow-lg hover:scale-105'
                      : plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg hover:scale-105'
                      : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md hover:scale-105'
                  }`}
                >
                  {plan.name === 'Pro' && <Crown className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {plan.popular && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span>{plan.cta}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 sm:mt-12 text-center px-4">
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Join professionals building their careers</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              <span className="text-sm sm:text-base font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              <span className="text-sm sm:text-base font-medium">One-Time Payment</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              <span className="text-sm sm:text-base font-medium">No Hidden Fees</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-16 max-w-3xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-md border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">Can I upgrade my plan later?</h3>
              <p className="text-sm sm:text-base text-gray-600">Yes! You can upgrade to a higher plan at any time to get more credits and features.</p>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-md border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">What payment methods do you accept?</h3>
              <p className="text-sm sm:text-base text-gray-600">We accept payments through eSewa, Nepal's most trusted digital wallet.</p>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-md border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">What happens when I run out of credits?</h3>
              <p className="text-sm sm:text-base text-gray-600">You can purchase more credits anytime by upgrading your plan. Your account and existing documents remain safe.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Pricing() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h1>
        <p className="text-center text-gray-600 mb-12">Choose the plan that fits your needs</p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-indigo-100 to-purple-200 rounded-2xl opacity-50 blur-3xl -z-10"></div>
          
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-indigo-600 relative transform scale-105' : ''
              } hover:shadow-2xl transition-all duration-300`}
              style={{
                background: index === 0 
                  ? 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)' 
                  : index === 1 
                  ? 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)'
                  : 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)'
              }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-600">{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.plan)}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.name === 'Pro'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                    : plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}

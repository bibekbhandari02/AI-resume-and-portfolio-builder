import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { base64Decode } from 'esewajs';
import api from '../lib/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Log all query parameters for debugging
      console.log('All URL params:', Object.fromEntries(searchParams.entries()));
      
      const data = searchParams.get('data');
      const plan = searchParams.get('plan');
      const userId = searchParams.get('userId');

      if (!data) {
        console.error('No payment data found');
        console.error('Available params:', Array.from(searchParams.keys()));
        setVerifying(false);
        return;
      }

      // Decode the payment data
      const decoded = base64Decode(data);
      console.log('Decoded payment data:', decoded);

      if (!decoded || !decoded.transaction_uuid) {
        console.error('Invalid payment data');
        setVerifying(false);
        return;
      }

      // Verify with backend (plan and userId are encoded in transaction_uuid)
      const response = await api.post('/payment/verify', {
        data
      });

      if (response.data.success) {
        setVerified(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying && !verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Loader className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (!verifying && !verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">✕</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-4">Unable to verify your payment</p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your subscription has been activated</p>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

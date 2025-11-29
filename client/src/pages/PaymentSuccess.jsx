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
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Log all query parameters for debugging
      console.log('All URL params:', Object.fromEntries(searchParams.entries()));
      
      const data = searchParams.get('data');

      if (!data) {
        console.error('No payment data found');
        console.error('Available params:', Array.from(searchParams.keys()));
        setError('No payment data received');
        setVerifying(false);
        return;
      }

      // Decode the payment data
      const decoded = base64Decode(data);
      console.log('Decoded payment data:', decoded);

      if (!decoded || !decoded.transaction_uuid) {
        console.error('Invalid payment data');
        setError('Invalid payment data');
        setVerifying(false);
        return;
      }

      // Verify with backend (plan and userId are encoded in transaction_uuid)
      const response = await api.post('/payment/verify', {
        data
      });

      console.log('Verification response:', response.data);

      if (response.data.success) {
        setVerified(true);
        setPaymentDetails({
          plan: response.data.plan,
          transactionId: response.data.transactionId,
          creditsAdded: response.data.creditsAdded
        });
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError(error.response?.data?.error || error.message || 'Payment verification failed');
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
          <p className="text-gray-600 mb-4">
            {error || 'Unable to verify your payment'}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Go to Dashboard
            </button>
          </div>
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
        
        {paymentDetails && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold text-gray-900 capitalize">{paymentDetails.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs text-gray-900">{paymentDetails.transactionId?.substring(0, 20)}...</span>
              </div>
              {paymentDetails.creditsAdded && (
                <>
                  <div className="border-t border-green-200 my-2"></div>
                  <div className="text-center font-semibold text-green-700">
                    Credits Added:
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resume Generations:</span>
                    <span className="font-semibold text-green-700">+{paymentDetails.creditsAdded.resumeGenerations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Portfolios:</span>
                    <span className="font-semibold text-green-700">+{paymentDetails.creditsAdded.portfolios}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

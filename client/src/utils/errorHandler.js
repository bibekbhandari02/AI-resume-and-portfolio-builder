import toast from 'react-hot-toast';

/**
 * Centralized error handler for API calls
 */
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);

  // Network error
  if (!error.response) {
    toast.error('Network error. Please check your connection.');
    return;
  }

  // Get error message from response
  const message = error.response?.data?.error || 
                  error.response?.data?.message || 
                  customMessage ||
                  'Something went wrong. Please try again.';

  // Handle specific status codes
  switch (error.response?.status) {
    case 400:
      toast.error(message);
      break;
    case 401:
      toast.error('Please log in to continue.');
      // Optionally redirect to login
      // window.location.href = '/login';
      break;
    case 403:
      toast.error('You don\'t have permission to do that.');
      break;
    case 404:
      toast.error('Resource not found.');
      break;
    case 429:
      toast.error('Too many requests. Please try again later.');
      break;
    case 500:
      toast.error('Server error. Please try again later.');
      break;
    default:
      toast.error(message);
  }

  return message;
};

/**
 * Wrapper for async operations with error handling
 */
export const withErrorHandling = async (asyncFn, errorMessage = null) => {
  try {
    return await asyncFn();
  } catch (error) {
    handleApiError(error, errorMessage);
    throw error;
  }
};

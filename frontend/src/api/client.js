import axios from 'axios';

/**
 * PitWall Axios API Client
 * Configured with baseURL /api, 10s timeout, and unified error handling interceptors.
 */
const apiClient = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Can attach tokens, timestamps, or headers here
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let message = 'An unexpected network error occurred';
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      const data = error.response.data;

      if (typeof data === 'string') {
        message = data;
      } else if (data && typeof data === 'object') {
        message = data.detail || data.message || data.error || JSON.stringify(data);
      }
    } else if (error.request) {
      message = 'No response received from PitWall API server. Is the backend running?';
      statusCode = 0;
    } else {
      message = error.message;
    }

    const enhancedError = new Error(message);
    enhancedError.status = statusCode;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;
export { apiClient };

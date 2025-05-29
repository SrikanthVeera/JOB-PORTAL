import axios from 'axios';

// Try different possible URLs for the backend
const POSSIBLE_URLS = [
  process.env.REACT_APP_API_URL,
  'https://web-production-a1cb2.up.railway.app',
  'https://web-production-a1cb2.railway.app',
  'http://web-production-a1cb2.up.railway.app',
  'http://web-production-a1cb2.railway.app'
];

// Filter out undefined URLs
const VALID_URLS = POSSIBLE_URLS.filter(url => url);

// Log all possible URLs we're trying
console.log('Trying these backend URLs:', VALID_URLS);

// Use the first URL by default
const API_URL = VALID_URLS[0];
console.log('Initially using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent long waits if the server is down
  timeout: 10000
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to a connection issue and we haven't tried all URLs
    if (error.message.includes('Network Error') && !originalRequest._retryCount) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      
      // Try the next URL if available
      if (originalRequest._retryCount < VALID_URLS.length - 1) {
        originalRequest._retryCount++;
        const nextUrl = VALID_URLS[originalRequest._retryCount];
        console.log(`Trying next API URL: ${nextUrl}`);
        
        // Update the baseURL for this request
        originalRequest.baseURL = nextUrl;
        
        // Also update the default baseURL for future requests
        api.defaults.baseURL = nextUrl;
        
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
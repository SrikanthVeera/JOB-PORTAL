import axios from 'axios';

// Use environment variable for API URL or fallback to the deployed backend
const API_URL = process.env.REACT_APP_API_URL || 'https://job-portal-1-2qzy.onrender.com';
console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent long waits if the server is down
  timeout: 10000,
  // Enable CORS with credentials
  withCredentials: true
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
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export default api;
const axios = require('axios');

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token if provided
axiosInstance.interceptors.request.use(
  (config) => {
    const token = config.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      delete config.token; // Remove token from config to avoid issues
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

module.exports = axiosInstance;

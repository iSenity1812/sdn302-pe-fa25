const axiosInstance = require('../config/axiosConfig');

/**
 * Generic API client for making HTTP requests
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} endpoint - API endpoint path
 * @param {string} token - Authorization token
 * @param {object} data - Request body data (optional for POST, PUT)
 * @param {object} config - Additional axios config (optional)
 * @returns {Promise<object>} API response data or empty array on error
 */
const apiClient = async (method, endpoint, token, data = null, config = {}) => {
  try {
    const axiosConfig = {
      ...config,
      method,
      url: endpoint,
      token,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      axiosConfig.data = data;
    }

    const response = await axiosInstance(axiosConfig);
    return response.data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error.message);
    return [];
  }
};

/**
 * GET request helper
 * @param {string} endpoint - API endpoint path
 * @param {string} token - Authorization token
 * @param {object} config - Additional axios config (optional)
 * @returns {Promise<object>} API response data
 */
exports.get = (endpoint, token, config = {}) =>
  apiClient('GET', endpoint, token, null, config);

/**
 * POST request helper
 * @param {string} endpoint - API endpoint path
 * @param {object} data - Request body data
 * @param {string} token - Authorization token
 * @param {object} config - Additional axios config (optional)
 * @returns {Promise<object>} API response data
 */
exports.post = (endpoint, data, token, config = {}) =>
  apiClient('POST', endpoint, token, data, config);

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint path
 * @param {object} data - Request body data
 * @param {string} token - Authorization token
 * @param {object} config - Additional axios config (optional)
 * @returns {Promise<object>} API response data
 */
exports.put = (endpoint, data, token, config = {}) =>
  apiClient('PUT', endpoint, token, data, config);

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint path
 * @param {string} token - Authorization token
 * @param {object} config - Additional axios config (optional)
 * @returns {Promise<object>} API response data
 */
exports.delete = (endpoint, token, config = {}) =>
  apiClient('DELETE', endpoint, token, null, config);

/**
 * PATCH request helper
 * @param {string} endpoint - API endpoint path
 * @param {object} data - Request body data
 * @param {string} token - Authorization token
 * @param {object} config - Additional axios config (optional)
 * @returns {Promise<object>} API response data
 */
exports.patch = (endpoint, data, token, config = {}) =>
  apiClient('PATCH', endpoint, token, data, config);

/**
 * Generic API client function - use this for custom requests
 */
exports.request = apiClient;

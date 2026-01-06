import axios from 'axios';

// Use the same hostname as the current page for API calls through nginx proxy
const API_HOST = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
export const API_BASE_URL = `${API_HOST}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user.jwt) {
          config.headers.Authorization = `Bearer ${user.jwt}`;
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const backendError = error.response.data?.error || error.response.data?.message || "Unknown Error";
      console.error("❌ API ERROR MESSAGE:", backendError);
      console.error("API Error Response Data:", error.response.data);
      console.error("API Error Status:", error.response.status);
    } else {
      console.error("API Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

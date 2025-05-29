import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "/api", // Using Vite's proxy configuration
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // You could redirect to login page here if needed
    }
    return Promise.reject(error);
  }
);

export default api;

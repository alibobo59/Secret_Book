import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:8000";
axios.defaults.withCredentials = true;

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8000", // Using Vite's proxy configuration
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable cookies for CSRF and session
});

// Fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/sanctum/csrf-cookie",
      {
        withCredentials: true,
        headers: { Accept: "application/json" },
      }
    );
    console.log("CSRF token response:", {
      status: response.status,
      headers: response.headers,
      cookies: document.cookie,
    });
    return true;
  } catch (error) {
    console.error("CSRF token fetch failed:", {
      status: error.response?.status,
      message: error.message,
      response: error.response?.data,
    });
    return false;
  }
};

// Request interceptor to add auth token and handle CSRF
api.interceptors.request.use(
  async (config) => {
    if (
      ["post", "put", "delete", "patch"].includes(config.method.toLowerCase())
    ) {
      const success = await fetchCsrfToken();
      if (!success) {
        throw new Error("Unable to fetch CSRF token");
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 419 && !error.config?._retry) {
      console.warn("CSRF token mismatch, retrying once...");
      error.config._retry = true;
      const success = await fetchCsrfToken();
      if (success) {
        return api(error.config);
      }
      return Promise.reject(new Error("CSRF token retry failed"));
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.assign("/login");
      return null;
    }
    return Promise.reject(error);
  }
);

export default api;

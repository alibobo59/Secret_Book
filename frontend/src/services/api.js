import axios from "axios";

// Create an axios instance for API requests
const api = axios.create({
  baseURL: "/api", // Vite's proxy for /api routes
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable cookies for CSRF and session
});

// Fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await axios.get("/sanctum/csrf-cookie", {
      withCredentials: true,
      headers: { Accept: "application/json" },
    });
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
  (error) => {
    if (error.response?.status === 419) {
      console.error("CSRF token mismatch:", error.response?.data);
      return Promise.reject(new Error("CSRF token mismatch"));
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

export { api, fetchCsrfToken };

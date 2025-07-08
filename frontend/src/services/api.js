import axios from "axios";

// Create an axios instance for API requests
const api = axios.create({
  baseURL: "/api", // Vite's proxy for /api routes
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, // Enable cookies for CSRF and session
  timeout: 30000, // 30 seconds timeout
  timeoutErrorMessage: 'Request timeout - the server took too long to respond',
  // Add retry logic
  retry: 3,
  retryDelay: 1000,
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
    // Only fetch CSRF token for non-GET requests
    if (
      ["post", "put", "delete", "patch"].includes(config.method.toLowerCase())
    ) {
      const success = await fetchCsrfToken();
      if (!success) {
        throw new Error("Unable to fetch CSRF token");
      }
    }

    // Set Content-Type based on data type
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let browser set multipart/form-data
      delete config.headers["Content-Type"];
    } else {
      // Set JSON for non-FormData requests
      config.headers["Content-Type"] = "application/json";
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Request config:", {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data instanceof FormData ? "[FormData]" : config.data,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để log timezone info
api.interceptors.request.use(
  (config) => {
    // Log timezone info cho debug
    if (config.url.includes('vnpay')) {
      console.log('Frontend Timezone Info:', {
        browser_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        current_time: new Date().toISOString(),
        vietnam_time: new Date().toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh'
        })
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Skip retry for specific status codes
    if (error.response?.status === 401 || error.response?.status === 419) {
      return Promise.reject(error);
    }

    // Initialize retry count
    config.retryCount = config.retryCount || 0;

    // Check if we should retry the request
    if (config.retryCount < config.retry) {
      config.retryCount += 1;
      
      // Delay before retrying
      await new Promise(resolve => setTimeout(resolve, config.retryDelay * config.retryCount));
      
      console.log(`Retrying request (${config.retryCount}/${config.retry}):`, config.url);
      return api(config);
    }

    // If all retries failed, handle the error
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message);
      return Promise.reject(new Error('The request timed out. Please try again.'));
    }

    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Unable to connect to the server. Please check your connection.'));
    }

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

    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    return Promise.reject(error);
  }
);

// Review API functions
export const reviewAPI = {
  // Get reviews for a specific book
  getBookReviews: (bookId, page = 1) => {
    return api.get(`/books/${bookId}/reviews?page=${page}`);
  },

  // Submit a new review
  submitReview: (reviewData) => {
    return api.post('/reviews', reviewData);
  },

  // Update an existing review
  updateReview: (reviewId, reviewData) => {
    return api.put(`/reviews/${reviewId}`, reviewData);
  },

  // Delete a review
  deleteReview: (reviewId) => {
    return api.delete(`/reviews/${reviewId}`);
  },

  // Check if user can review a book
  canReviewBook: (bookId) => {
    return api.get(`/books/${bookId}/can-review`);
  }
};

export { api, fetchCsrfToken };

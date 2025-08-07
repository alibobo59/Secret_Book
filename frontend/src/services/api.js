import axios from "axios";

// Create an axios instance for API requests
const api = axios.create({
  baseURL: "/api", // Vite's proxy for /api routes
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, // Enable cookies for CSRF and session
  timeout: 30000, // 30 seconds timeout
  timeoutErrorMessage: "Request timeout - the server took too long to respond",
  // Add retry logic
  retry: 3,
  retryDelay: 1000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('%c API Request Config:', 'background: #0066cc; color: white; padding: 2px 5px; border-radius: 3px;');
    console.log('URL:', config.url);
    console.log('Method:', config.method.toUpperCase());
    console.log('Base URL:', config.baseURL);
    console.log('Full URL:', config.baseURL + config.url);
    
    // Log headers in detail
    console.log('Headers:', config.headers);
    
    // Log data in detail
    if (config.data) {
      if (config.data instanceof FormData) {
        console.log('FormData Contents:');
        for (let [key, value] of config.data.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File: ${value.name} (${value.type}, ${value.size} bytes)` : value);
        }
      } else {
        console.log('Data:', config.data);
      }
    }
    
    // Log params if any
    if (config.params) {
      console.log('Params:', config.params);
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('%c API Response Success:', 'background: #00cc66; color: white; padding: 2px 5px; border-radius: 3px;');
    console.log('Status:', response.status, response.statusText);
    console.log('URL:', response.config.url);
    console.log('Method:', response.config.method.toUpperCase());
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    
    // Log request details that generated this response
    console.log('Request that generated this response:');
    console.log('  URL:', response.config.url);
    console.log('  Method:', response.config.method.toUpperCase());
    console.log('  Headers:', response.config.headers);
    
    if (response.config.data) {
      if (typeof response.config.data === 'string') {
        try {
          // Try to parse if it's JSON string
          const parsedData = JSON.parse(response.config.data);
          console.log('  Request Data (parsed):', parsedData);
        } catch (e) {
          // If not JSON, show as is
          console.log('  Request Data (raw):', response.config.data);
        }
      } else {
        console.log('  Request Data:', response.config.data);
      }
    }
    
    return response;
  },
  (error) => {
    console.log('%c API Response Error:', 'background: #cc0000; color: white; padding: 2px 5px; border-radius: 3px;');
    console.log('Error Message:', error.message);
    console.log('Error Code:', error.code);
    
    if (error.response) {
      console.log('Status:', error.response.status, error.response.statusText);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
      
      // Log validation errors in detail if present
      if (error.response.data && error.response.data.errors) {
        console.log('Validation Errors:');
        for (const [field, messages] of Object.entries(error.response.data.errors)) {
          console.log(`  ${field}:`, messages);
        }
      }
      
      // Log request that caused the error
      if (error.config) {
        console.log('Request that caused error:');
        console.log('  URL:', error.config.url);
        console.log('  Method:', error.config.method.toUpperCase());
        console.log('  Headers:', error.config.headers);
        
        if (error.config.data) {
          if (error.config.data instanceof FormData) {
            console.log('  FormData Contents:');
            try {
              for (let [key, value] of error.config.data.entries()) {
                console.log(`    ${key}:`, value instanceof File ? `File: ${value.name}` : value);
              }
            } catch (e) {
              console.log('  Could not iterate FormData:', e.message);
            }
          } else if (typeof error.config.data === 'string') {
            try {
              // Try to parse if it's JSON string
              const parsedData = JSON.parse(error.config.data);
              console.log('  Request Data (parsed):', parsedData);
            } catch (e) {
              // If not JSON, show as is
              console.log('  Request Data (raw):', error.config.data);
            }
          } else {
            console.log('  Request Data:', error.config.data);
          }
        }
      }
    } else if (error.request) {
      console.log('No Response Received:', error.request);
    } else {
      console.log('Request Setup Error');
    }
    
    return Promise.reject(error);
  }
);

// Fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await axios.get("/sanctum/csrf-cookie", {
      withCredentials: true,
      headers: { Accept: "application/json" },
    });
    // console.log("CSRF token response:", {
    //   status: response.status,
    //   headers: response.headers,
    //   cookies: document.cookie,
    // });
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
    // Only fetch CSRF token for non-GET requests and if not already fetched
    if (
      ["post", "put", "delete", "patch"].includes(config.method.toLowerCase())
    ) {
      // Check if CSRF token already exists in cookies
      const hasCSRFToken = document.cookie.includes('XSRF-TOKEN');
      if (!hasCSRFToken) {
        const success = await fetchCsrfToken();
        if (!success) {
          throw new Error("Unable to fetch CSRF token");
        }
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

    // console.log("Request config:", {
    //   method: config.method,
    //   url: config.url,
    //   headers: config.headers,
    //   data: config.data instanceof FormData ? "[FormData]" : config.data,
    // });

    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để log timezone info
api.interceptors.request.use(
  (config) => {
    // Log timezone info cho debug
    if (config.url.includes("vnpay")) {
      console.log("Frontend Timezone Info:", {
        browser_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        current_time: new Date().toISOString(),
        vietnam_time: new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
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

    // Skip retry for specific status codes (authentication and validation errors)
    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 419 || error.response?.status === 422) {
      return Promise.reject(error);
    }

    // Initialize retry count
    config.retryCount = config.retryCount || 0;

    // Check if we should retry the request
    if (config.retryCount < config.retry) {
      config.retryCount += 1;

      // Delay before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, config.retryDelay * config.retryCount)
      );

      // console.log(`Retrying request (${config.retryCount}/${config.retry}):`, config.url);
      return api(config);
    }

    // If all retries failed, handle the error
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
      return Promise.reject(
        new Error("The request timed out. Please try again.")
      );
    }

    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(
        new Error(
          "Unable to connect to the server. Please check your connection."
        )
      );
    }

    if (error.response?.status === 419) {
      console.error("CSRF token mismatch:", error.response?.data);
      return Promise.reject(new Error("CSRF token mismatch"));
    }

    if (error.response?.status === 401 && !config.url.includes("login")) {
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      // window.location.assign("/login");
      return null;
    }

    // Handle 403 errors (account locked) - but not for login endpoint
    if (error.response?.status === 403 && !config.url.includes('login')) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error;
      if (errorMessage && errorMessage.includes('khóa')) {
        // Clear authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login page
        window.location.assign("/login");
        return Promise.reject(new Error(errorMessage));
      }
    }

    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
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
    return api.post("/reviews", reviewData);
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
  },
};

export { api, fetchCsrfToken };

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config } = error;

    // Skip retry for specific status codes (authentication, validation, conflict errors)
    if (
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      error.response?.status === 419 ||
      error.response?.status === 422 ||
      error.response?.status === 409
    ) {
      return Promise.reject(error);
    }

    // If no config or explicitly disabled retry, or VNPay payment endpoints -> do not retry
    if (!config) {
      return Promise.reject(error);
    }
    const url = typeof config.url === "string" ? config.url : "";
    if (config.noRetry === true || /\/payment\/vnpay(\/|$)/.test(url)) {
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

    // If retries exhausted, reject the error
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
    return true;
  } catch (error) {
    return false;
  }
};

// Request interceptor to add auth token and handle CSRF
api.interceptors.request.use(
  async (config) => {
    if (
      ["post", "put", "delete", "patch"].includes(config.method.toLowerCase())
    ) {
      const hasCSRFToken = document.cookie.includes('XSRF-TOKEN');
      if (!hasCSRFToken) {
        const success = await fetchCsrfToken();
        if (!success) {
          throw new Error("Unable to fetch CSRF token");
        }
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

export const reviewAPI = {
  getBookReviews: (bookId, page = 1) => {
    return api.get(`/books/${bookId}/reviews?page=${page}`);
  },

  submitReview: (data) => {
    // nếu đã là FormData thì gửi trực tiếp
    if (data instanceof FormData) {
      return api.post("/reviews", data);
    }
    // nếu có thuộc tính images là mảng File, chuyển sang FormData
    if (data && Array.isArray(data.images)) {
      const fd = new FormData();
      fd.append("book_id", data.book_id);
      fd.append("rating", data.rating);
      if (data.review) fd.append("review", data.review);
      data.images.slice(0, 3).forEach((file) => {
        if (file) fd.append("images[]", file);
      });
      return api.post("/reviews", fd);
    }
    // fallback JSON nếu không có ảnh
    return api.post("/reviews", data);
  },

  updateReview: (reviewId, reviewData) => {
    return api.put(`/reviews/${reviewId}`, reviewData);
  },

  deleteReview: (reviewId) => {
    return api.delete(`/reviews/${reviewId}`);
  },

  canReviewBook: (bookId) => {
    return api.get(`/books/${bookId}/can-review`);
  },
};

export { api, fetchCsrfToken };

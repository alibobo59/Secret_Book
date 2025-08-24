import { api } from "./api";

export const aiService = {
  // AI fallback
  chat: (message, history=[]) => api.post("/ai/chat", { message, history }),

  // Support
  faqs: () => api.get("/chatbot/faqs"),
  feedback: (rating, notes) => api.post("/chatbot/feedback", { rating, notes }),
  contact: (payload) => api.post("/chatbot/contact", payload),

  // Data sources sẵn có trong app
  featured: () => api.get("/featured-books"),
  activeCoupons: () => api.get("/active-coupons"),
  // Books
  searchBooks: (q) => api.get(`/books?search=${encodeURIComponent(q)}`),
  byCategory: (slug) => api.get(`/books?category=${encodeURIComponent(slug)}`),
  byAuthor: (name) => api.get(`/books?author=${encodeURIComponent(name)}`), // controller của bạn có thể là author_name; thay param nếu khác
  // Orders
  orders: () => api.get("/orders"),
  orderById: (id) => api.get(`/orders/${id}`),
};

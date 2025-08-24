import api from "./apiClient";

export const aiService = {
  chat: (message, history=[]) => api.post("/ai/chat", { message, history }),

  faqs: () => api.get("/chatbot/faqs"),
  feedback: (rating, notes) => api.post("/chatbot/feedback", { rating, notes }),
  contact: (payload) => api.post("/chatbot/contact", payload),

  featured: () => api.get("/featured-books"),
  activeCoupons: () => api.get("/active-coupons"),

  searchBooks: (q) => api.get("/books", { params: { search: q }}),
  byCategory: (slug) => api.get("/books", { params: { category: slug }}),
  byAuthor: (name) => api.get("/books", { params: { author: name }}),
};

export const orderService = {
  getUserOrders: (params={}) => api.get("/orders", { params }),     // trả pagination
  getOrderById: (id) => api.get(`/orders/${id}`),
  searchByCode: (code) => api.get("/orders/search", { params:{ code } }), // (nếu đã bật)
};

export const chatApi = {
  searchAuthors: (q) => api.get("/chat/authors", { params: { q } }),
  booksByAuthor: (authorId) => api.get(`/chat/authors/${authorId}/books`),

  searchGenres: (q) => api.get("/chat/genres", { params: { q } }),
  booksByGenre: (genreId) => api.get(`/chat/genres/${genreId}/books`),

  trending: (limit = 3) => api.get("/chat/trending", { params: { limit } }),
};

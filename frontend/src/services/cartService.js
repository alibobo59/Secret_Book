import { api } from './api.js';

const cartService = {
  // Get user's cart from server
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Get cart error:', error);
      throw error;
    }
  },

  // Add item to server cart
  addItem: async (bookId, quantity = 1) => {
    try {
      const response = await api.post('/cart/items', {
        book_id: bookId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  // Update item quantity in server cart
  updateItem: async (bookId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${bookId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error;
    }
  },

  // Remove item from server cart
  removeItem: async (bookId) => {
    try {
      const response = await api.delete(`/cart/items/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  },

  // Clear server cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  },

  // Merge guest cart with user cart
  mergeCart: async (guestCartItems) => {
    try {
      const response = await api.post('/cart/merge', {
        guest_cart: guestCartItems
      });
      return response.data;
    } catch (error) {
      console.error('Merge cart error:', error);
      throw error;
    }
  }
};

export default cartService;
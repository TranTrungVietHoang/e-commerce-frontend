import api from './api';

const cartService = {
  getCart: (userId) => api.get(`/cart?userId=${userId}`),
  addToCart: (userId, payload) => api.post(`/cart/items?userId=${userId}`, payload),
  updateCartItem: (userId, itemId, quantity) => api.put(`/cart/items/${itemId}?userId=${userId}`, { quantity }),
  removeCartItem: (userId, itemId) => api.delete(`/cart/items/${itemId}?userId=${userId}`),
  clearCart: (userId) => api.delete(`/cart?userId=${userId}`),
};

export default cartService;

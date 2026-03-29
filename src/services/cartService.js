import api from './api';

const userId = 1;

const cartService = {
  getCart: () => api.get(`/cart?userId=${userId}`),
  addToCart: (payload) => api.post(`/cart/items?userId=${userId}`, payload),
  updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}?userId=${userId}`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/cart/items/${itemId}?userId=${userId}`),
  clearCart: () => api.delete(`/cart?userId=${userId}`),
};

export default cartService;

import api from './api';

import storageUtils from '../utils/storageUtils';

const getUserId = () => {
  const user = storageUtils.getItem('authUser');
  return user ? JSON.parse(user).userId : null;
};

const cartService = {
  getCart: () => api.get(`/cart?userId=${getUserId()}`),
  addToCart: (payload) => api.post(`/cart/items?userId=${getUserId()}`, payload),
  updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}?userId=${getUserId()}`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/cart/items/${itemId}?userId=${getUserId()}`),
  clearCart: () => api.delete(`/cart?userId=${getUserId()}`),
};

export default cartService;

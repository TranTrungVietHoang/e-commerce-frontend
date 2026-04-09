import api from './api';

const wishlistService = {
  // GET /wishlists → trả về Page, lấy .content là mảng thực sự
  getWishlist: () => api.get('/wishlists'),
  addToWishlist: (productId) => api.post(`/wishlists/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/wishlists/${productId}`),
  // Không có endpoint check ringêng, tự kiểm tra qua list
};

export default wishlistService;

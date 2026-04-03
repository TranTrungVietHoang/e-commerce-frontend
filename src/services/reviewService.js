import api from './api';

const reviewService = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  submitReview: (data) => api.post('/reviews', data),
  getAverageRating: (productId) => api.get(`/reviews/product/${productId}/average`),
};

export default reviewService;

import api from './api';

const voucherService = {
  // Dành cho khách hàng áp dụng voucher
  getAvailableVouchers: (shopId, orderValue = 0) =>
    api.get(`/vouchers/available?shopId=${shopId}&orderValue=${orderValue}`),
    
  applyVoucher: (userId, code, orderValue, shopId) =>
    api.post(`/vouchers/apply?userId=${userId}`, { code, orderValue, shopId }),

  // Dành cho Seller quản lý voucher của shop mình
  getSellerVouchers: (shopId) => api.get(`/vouchers?shopId=${shopId}`),
  
  createVoucher: (shopId, payload) => api.post(`/vouchers?shopId=${shopId}`, payload),
  
  updateVoucher: (voucherId, shopId, payload) => api.put(`/vouchers/${voucherId}?shopId=${shopId}`, payload),
  
  deleteVoucher: (voucherId, shopId) => api.delete(`/vouchers/${voucherId}?shopId=${shopId}`),

  // Dành cho Admin (có thể cần endpoint riêng hoặc dùng param đặc biệt)
  getAllVouchers: () => api.get('/vouchers/all'), 
};

export default voucherService;

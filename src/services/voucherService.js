import api from './api';

const voucherService = {
  // Dành cho khách hàng áp dụng voucher
  getAvailableVouchers: (shopId, orderValue = 0) =>
    api.get(`/vouchers/available?shopId=${shopId}&orderValue=${orderValue}`),
    
  applyVoucher: (code, orderValue, shopId) =>
    api.post('/vouchers/apply', { code, orderValue, shopId }),

  // Dành cho Seller quản lý voucher của shop mình
  getSellerVouchers: () => api.get('/vouchers'),
  
  createVoucher: (payload) => api.post('/vouchers', payload),
  
  updateVoucher: (voucherId, payload) => api.put(`/vouchers/${voucherId}`, payload),
  
  deleteVoucher: (voucherId) => api.delete(`/vouchers/${voucherId}`),

  // Dành cho Admin (có thể cần endpoint riêng hoặc dùng param đặc biệt)
  getAllVouchers: () => api.get('/vouchers/all'), 
};

export default voucherService;

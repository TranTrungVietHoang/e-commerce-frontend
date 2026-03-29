import api from './api';

const userId = 1;
const fallbackShopId = 1;

const voucherService = {
  getAvailableVouchers: (shopId, orderValue = 0) =>
    api.get(`/vouchers/available?shopId=${shopId || fallbackShopId}&orderValue=${orderValue}`),
  applyVoucher: (code, orderValue, shopId) =>
    api.post(`/vouchers/apply?userId=${userId}`, { code, orderValue, shopId: shopId || fallbackShopId }),
  getSellerVouchers: () => api.get(`/vouchers?shopId=${fallbackShopId}`),
  createVoucher: (payload) => api.post(`/vouchers?shopId=${fallbackShopId}`, payload),
  updateVoucher: (voucherId, payload) => api.put(`/vouchers/${voucherId}?shopId=${fallbackShopId}`, payload),
  deleteVoucher: (voucherId) => api.delete(`/vouchers/${voucherId}?shopId=${fallbackShopId}`),
};

export default voucherService;

import api from './api';

const shopService = {
  // --- Seller APIs ---
  registerShop: (data) => api.post('/seller/shops/register', data),
  getMyShop: () => api.get('/seller/shops/me'),
  updateShop: (data) => api.put('/seller/shops/update', data),

  // --- Admin APIs ---
  getPendingShops: () => api.get('/admin/shops/pending'),
  getAllShops: () => api.get('/admin/shops'),
  getAdminShopById: (id) => api.get(`/admin/shops/${id}`),
  approveShop: (id, status, reason = "") => api.put(`/admin/shops/${id}/approve`, { status, reason }),

  // --- Public APIs (If needed later) ---
  // getShops: (params) => api.get('/public/shops', { params }),
  // getShopById: (id) => api.get(`/public/shops/${id}`),
};

export default shopService;

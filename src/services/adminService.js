import api from './api';

const adminService = {
  // Lấy danh sách users với tìm kiếm + phân trang
  getUsers: (params) => api.get('/admin/users', { params }),

  // Chi tiết 1 user
  getUserById: (id) => api.get(`/admin/users/${id}`),

  // Cập nhật trạng thái (LOCKED / ACTIVE)
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, null, { params: { status } }),

  // Quản lý Đơn hàng toàn hệ thống
  getOrders: (page = 0, size = 10) => api.get('/admin/orders', { params: { page, size } }),

  // Quản lý Voucher toàn hệ thống
  getVouchers: () => api.get('/admin/vouchers'),
};

export default adminService;

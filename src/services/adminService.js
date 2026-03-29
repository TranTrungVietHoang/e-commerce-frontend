import api from './api';

const adminService = {
  // Lấy danh sách users với tìm kiếm + phân trang
  getUsers: (params) => api.get('/admin/users', { params }),

  // Chi tiết 1 user
  getUserById: (id) => api.get(`/admin/users/${id}`),

  // Cập nhật trạng thái (LOCKED / ACTIVE)
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, null, { params: { status } }),
};

export default adminService;

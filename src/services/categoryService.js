import api from './api';

const categoryService = {
  // Lấy dữ liệu danh mục cho khách hàng / seller (thường là dạng cây hoặc danh sách public)
  getAllCategories: () => api.get('/categories'),

  // Quản trị viên (Admin) - Có thể trả về thông tin chi tiết hơn cho việc quản lý
  getAdminCategories: () => api.get('/admin/categories'),
  
  getCategoryById: (id) => api.get(`/admin/categories/${id}`),
  
  createCategory: (payload) => api.post('/admin/categories', payload),
  
  updateCategory: (id, payload) => api.put(`/admin/categories/${id}`, payload),
  
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

export default categoryService;

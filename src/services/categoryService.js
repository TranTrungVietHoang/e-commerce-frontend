import api from './api';

const categoryService = {
  // Lấy toàn bộ danh mục cây (Public) 
  // Dùng chung cho cả Admin và Customer/Public
  getAllCategories: () => api.get('/categories'),

  // Tính năng Admin
  getCategoryById: (id) => api.get(`/admin/categories/${id}`),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

export default categoryService;

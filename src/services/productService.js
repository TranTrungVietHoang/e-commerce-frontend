import api from './api';

const productService = {
  // --- PRODUCT MANAGEMENT ---
  
  // Tạo sản phẩm mới (kèm variants và images)
  createProduct: (shopId, data) => 
    api.post(`/products?shopId=${shopId}`, data),

  // Lấy danh sách sản phẩm của Shop (có phân trang)
  getShopProducts: (shopId, page = 0, size = 10) => 
    api.get(`/products/shop/${shopId}?page=${page}&size=${size}`),

  // Lấy danh sách sản phẩm công khai
  getPublicProducts: () => 
    api.get('/products/public'),

  // Lấy danh sách sản phẩm cho Admin
  getAdminProducts: (page = 0, size = 10) =>
    api.get(`/products/admin?page=${page}&size=${size}`),

  // Cập nhật trạng thái sản phẩm (Admin duyêt)
  updateProductStatus: (id, status, reason = '') =>
    api.put(`/products/${id}/status?status=${status}&reason=${encodeURIComponent(reason)}`),

  // Seller tự ẩn/hiện sản phẩm
  updateProductStatusForSeller: (id, shopId, status) =>
    api.put(`/products/seller/${id}/status?shopId=${shopId}&status=${status}`),

  // Lấy chi tiết sản phẩm theo ID
  getProductById: (id) => 
    api.get(`/products/${id}`),

  // Cập nhật thông tin sản phẩm
  updateProduct: (id, shopId, data) => 
    api.put(`/products/${id}?shopId=${shopId}`, data),

  // Xóa mềm sản phẩm
  deleteProduct: (id, shopId) => 
    api.delete(`/products/${id}?shopId=${shopId}`),

  // --- INVENTORY MANAGEMENT ---

  // Cập nhật tồn kho nhanh cho biến thể
  updateVariantStock: (variantId, shopId, stock) => 
    api.patch(`/products/variants/${variantId}/stock?shopId=${shopId}`, { stock }),

  // Lấy danh sách biến thể sắp hết hàng (stock = 0)
  getLowStockVariants: (shopId) => 
    api.get(`/products/low-stock?shopId=${shopId}`),

  // --- CATEGORY ---
  getCategories: () => 
    api.get('/categories'),

  // --- IMAGE MANAGEMENT ---

  // Upload ảnh lên Cloudinary thông qua Backend
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // --- ADMIN MODERATION ---
  getPendingProducts: (page = 0, size = 10) => 
    api.get(`/admin/moderation/products?page=${page}&size=${size}`),

  moderateProduct: (id, status) => 
    api.patch(`/admin/moderation/products/${id}`, { status }),
};


export default productService;

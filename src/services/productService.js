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
};

export default productService;

import api from './api';

const productService = {
  createProduct: (shopId, data) => api.post(`/products?shopId=${shopId}`, data),
  getShopProducts: (shopId, page = 0, size = 10) => api.get(`/products/shop/${shopId}?page=${page}&size=${size}`),
  getPublicProducts: () => api.get('/products/public'),
  getProductById: (id) => api.get(`/products/${id}`),
  updateProduct: (id, shopId, data) => api.put(`/products/${id}?shopId=${shopId}`, data),
  deleteProduct: (id, shopId) => api.delete(`/products/${id}?shopId=${shopId}`),
  updateVariantStock: (variantId, shopId, stock) => api.patch(`/products/variants/${variantId}/stock?shopId=${shopId}`, { stock }),
  getLowStockVariants: (shopId) => api.get(`/products/low-stock?shopId=${shopId}`),
  getCategories: () => api.get('/categories'),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default productService;

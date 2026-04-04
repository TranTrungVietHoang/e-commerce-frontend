import api from './api';

const flashSaleService = {
  // --- ADMIN APIs ---
  
  // Lấy danh sách tất cả các đợt Flash Sale
  getAllFlashSales: () => 
    api.get('/admin/flash-sales'),

  // Tạo mới một đợt Flash Sale
  createFlashSale: (data) => 
    api.post('/admin/flash-sales', data),

  // Cập nhật trạng thái (ACTIVE, PENDING, FINISHED, CANCELLED)
  updateStatus: (id, status) => 
    api.patch(`/admin/flash-sales/${id}/status?status=${status}`),

  // Xóa một đợt Flash Sale (chỉ xóa được nếu chưa ACTIVE)
  deleteFlashSale: (id) => 
    api.delete(`/admin/flash-sales/${id}`),

  // --- SELLER APIs ---

  // Seller đăng ký sản phẩm tham gia Flash Sale
  registerProduct: (data) => 
    api.post('/seller/flash-sales/register', data),

  // Seller lấy danh sách sản phẩm mình đã đăng ký
  getMyRegisteredProducts: () => 
    api.get('/seller/flash-sales/my-products'),

  // Seller hủy đăng ký sản phẩm (nếu đợt sale chưa bắt đầu)
  unregisterProduct: (id) => 
    api.delete(`/seller/flash-sales/${id}`),

  // --- PUBLIC APIs (Optional: if needed for specific flash sale views) ---
  
  // Lấy các sản phẩm đang trong khung giờ vàng hiện tại
  getActiveFlashSales: () =>
    api.get('/public/flash-sales/active'),
};

export default flashSaleService;

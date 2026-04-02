import api from './api';

const orderService = {
  /**
   * Tạo đơn hàng mới từ giỏ hàng
   * POST /api/v1/orders
   */
  createOrder: async (shopId, shippingAddress, paymentMethod, voucherId, pointsUsed, recipientName, recipientPhone) => {
    try {
      const response = await api.post('/orders', {
        shopId,
        recipientName,
        recipientPhone,
        shippingAddress,
        paymentMethod,
        voucherId,
        pointsUsed
      });
      return response;
    } catch (error) {
      console.error('Lỗi tạo đơn hàng:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng của khách hàng
   * GET /api/v1/orders?page=0&size=10
   */
  getMyOrders: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/orders?page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết đơn hàng
   * GET /api/v1/orders/{orderId}
   */
  getOrderDetail: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi lấy chi tiết đơn ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Hủy đơn hàng
   * DELETE /api/v1/orders/{orderId}
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi hủy đơn ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Xem lịch sử trạng thái đơn
   * GET /api/v1/orders/{orderId}/status-history
   */
  getOrderStatusHistory: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/status-history`);
      return response;
    } catch (error) {
      console.error(`Lỗi lấy lịch sử trạng thái ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy đơn hàng của shop (cho Seller)
   * GET /api/v1/orders/shop/{shopId}?page=0&size=10
   */
  getShopOrders: async (shopId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/orders/shop/${shopId}?page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error(`Lỗi lấy danh sách đơn shop ${shopId}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái đơn (Seller only)
   * PUT /api/v1/orders/{orderId}/status
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response;
    } catch (error) {
      console.error(`Lỗi cập nhật trạng thái đơn ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thống kê doanh thu của shop
   * GET /api/v1/revenue/shop/{shopId}?period=DAY
   */
  getShopRevenue: async (shopId, period = 'DAY') => {
    try {
      const response = await api.get(`/revenue/shop/${shopId}?period=${period}`);
      return response;
    } catch (error) {
      console.error(`Lỗi lấy doanh thu shop ${shopId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy top sản phẩm bán chạy
   * GET /api/v1/revenue/shop/{shopId}/top-products?limit=10
   */
  getTopProducts: async (shopId, limit = 10) => {
    try {
      const response = await api.get(`/revenue/shop/${shopId}/top-products?limit=${limit}`);
      return response;
    } catch (error) {
      console.error(`Lỗi lấy top products chop ${shopId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy doanh thu hôm nay
   * GET /api/v1/revenue/shop/{shopId}/today
   */
  getTodayRevenue: async (shopId) => {
    try {
      const response = await api.get(`/revenue/shop/${shopId}/today`);
      return response;
    } catch (error) {
      console.error(`Lỗi lấy doanh thu hôm nay shop ${shopId}:`, error);
      throw error;
    }
  },

  /**
   * Kiểm tra xem khách hàng đã mua và nhận hàng sản phẩm này chưa
   * GET /api/v1/orders/verify-purchase/{productId}
   */
  verifyPurchase: async (productId) => {
    try {
      const response = await api.get(`/orders/verify-purchase/${productId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi xác thực mua hàng cho sản phẩm ${productId}:`, error);
      throw error;
    }
  }
};

export default orderService;

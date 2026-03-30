import api from './api';

/**
 * Payment Service - Xử lý thanh toán
 * Hỗ trợ: Sepay, COD, VNPAY
 */
const paymentService = {
  /**
   * Tạo QR code thanh toán Sepay
   */
  createSepayQr: (orderId, amount, description = 'Thanh toán Marketplace') =>
    api.post('/payments/sepay/create-qr', {
      orderId,
      amount,
      description,
      accountNo: '0334088130',        // Số tài khoản nhận (để cứng, backend tính toán)
      accountName: 'VO MINH TAM',    // Tên chủ tk
      bankCode: 'MB'                  // Mã ngân hàng
    }),

  /**
   * Kiểm tra status thanh toán
   */
  getPaymentStatus: (orderId) =>
    api.get(`/payments/status/${orderId}`),

  /**
   * Webhook callback (gọi từ backend khi Sepay gửi thông báo)
   */
  confirmPaymentWebhook: (transactionId, signature) =>
    api.post('/payments/sepay/webhook', null, {
      params: { transactionId, signature }
    }),

  /**
   * Polling: Kiểm tra payment status mỗi 2-3 giây
   * (Dùng cho frontend khi đợi user thanh toán)
   */
  startPaymentPolling: (orderId, maxRetries = 20, interval = 2000) => {
    return new Promise((resolve, reject) => {
      let retries = 0;
      const pollInterval = setInterval(async () => {
        try {
          const response = await paymentService.getPaymentStatus(orderId);
          if (response?.status === 'PAID' || response?.status === 'COMPLETED') {
            clearInterval(pollInterval);
            resolve(response);
          } else if (response?.status === 'EXPIRED' || response?.status === 'CANCELLED') {
            clearInterval(pollInterval);
            reject(new Error(`Thanh toán ${response.status.toLowerCase()}`));
          }
          retries++;
          if (retries >= maxRetries) {
            clearInterval(pollInterval);
            reject(new Error('Timeout: Không nhận được thanh toán'));
          }
        } catch (err) {
          console.error('Lỗi kiểm tra payment:', err);
          retries++;
          if (retries >= maxRetries) {
            clearInterval(pollInterval);
            reject(err);
          }
        }
      }, interval);
    });
  }
};

export default paymentService;

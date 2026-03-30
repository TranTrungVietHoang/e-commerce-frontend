import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import cartService from '../../services/cartService';
import orderService from '../../services/orderService';
import voucherService from '../../services/voucherService';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Shipping, 3: Payment, 4: Confirm
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD | SEPAY_TRANSFER
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherId, setVoucherId] = useState(null);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [sepayQr, setSepayQr] = useState(null);

  // Load cart items
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true);
        const response = await cartService.getCart();
        if (response.success) {
          setCartItems(response.data || []);
        }
      } catch (err) {
        setError('Lỗi tải giỏ hàng: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCartItems();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalAfterDiscount = Math.max(0, subtotal - voucherDiscount - pointsUsed);

  // Validate voucher
  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher');
      return;
    }

    try {
      setLoading(true);
      const response = await voucherService.validateVoucher(voucherCode, subtotal);
      if (response.success) {
        setVoucherId(response.data.id);
        setVoucherDiscount(response.data.discountAmount || 0);
        setError('');
      } else {
        setError(response.message || 'Voucher không hợp lệ');
        setVoucherId(null);
        setVoucherDiscount(0);
      }
    } catch (err) {
      setError('Lỗi kiểm tra voucher: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create order
  const handleCreateOrder = async () => {
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Group cart items by shop
      const shopOrders = {};
      cartItems.forEach(item => {
        const shopId = item.shop?.id || 0;
        if (!shopOrders[shopId]) {
          shopOrders[shopId] = [];
        }
        shopOrders[shopId].push(item);
      });

      // Create order for each shop
      let lastOrderResponse = null;
      for (const shopId of Object.keys(shopOrders)) {
        const response = await orderService.createOrder(
          parseInt(shopId),
          shippingAddress,
          paymentMethod,
          voucherId,
          pointsUsed
        );

        if (response.success) {
          lastOrderResponse = response;
        } else {
          throw new Error(response.message || `Lỗi tạo đơn hàng cho shop ${shopId}`);
        }
      }

      if (lastOrderResponse) {
        const order = lastOrderResponse.data;

        // If SEPAY_TRANSFER - get QR code
        if (paymentMethod === 'SEPAY_TRANSFER' && order.sepayQr) {
          setSepayQr(order.sepayQr);
        }

        setOrderConfirmation({
          orderId: order.id,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt
        });

        setCurrentStep(4);
      }
    } catch (err) {
      setError('Lỗi tạo đơn: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Go to order detail
  const handleGoToOrderDetail = () => {
    if (orderConfirmation?.orderId) {
      navigate(`/order/${orderConfirmation.orderId}`);
    }
  };

  // Render step 1: Review cart
  const renderStep1 = () => (
    <div className="checkout-step">
      <h2>1️⃣ Xem lại giỏ hàng</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Giỏ hàng trống. Vui lòng thêm sản phẩm!</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items-review">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item-row">
                <img src={item.product?.image} alt={item.product?.name} className="item-image" />
                <div className="item-info">
                  <h4>{item.product?.name}</h4>
                  <p>Loại: {item.variant?.name || 'Không xác định'}</p>
                  <p>Số lượng: {item.quantity}</p>
                </div>
                <div className="item-price">
                  <p className="price">{(item.totalPrice || 0).toLocaleString('vi-VN')} ₫</p>
                </div>
              </div>
            ))}
          </div>

          <div className="price-summary">
            <div className="summary-row">
              <span>Tổng tiền hàng:</span>
              <span className="amount">{subtotal.toLocaleString('vi-VN')} ₫</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá voucher:</span>
                <span className="amount">-{voucherDiscount.toLocaleString('vi-VN')} ₫</span>
              </div>
            )}
            {pointsUsed > 0 && (
              <div className="summary-row discount">
                <span>Điểm thưởng đã dùng:</span>
                <span className="amount">-{pointsUsed.toLocaleString('vi-VN')} ₫</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span className="amount">{totalAfterDiscount.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>

          <button onClick={() => setCurrentStep(2)} className="btn btn-primary btn-full">
            Tiếp tục → Địa chỉ giao hàng
          </button>
        </>
      )}
    </div>
  );

  // Render step 2: Shipping address
  const renderStep2 = () => (
    <div className="checkout-step">
      <h2>2️⃣ Địa chỉ giao hàng</h2>
      <div className="form-group">
        <label>Địa chỉ giao hàng *</label>
        <textarea
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Vd: 123 Đường ABC, Quận Phú Nhuận, TP.HCM"
          rows={4}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>Mã voucher (nếu có)</label>
        <div className="input-group">
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            placeholder="Nhập mã voucher"
            className="form-control"
            disabled={loading}
          />
          <button
            onClick={handleValidateVoucher}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra'}
          </button>
        </div>
        {voucherId && <p className="success-text">✓ Voucher hợp lệ. Giảm: {voucherDiscount.toLocaleString('vi-VN')} ₫</p>}
      </div>

      <div className="form-group">
        <label>Điểm thưởng sử dụng</label>
        <input
          type="number"
          value={pointsUsed}
          onChange={(e) => setPointsUsed(Math.max(0, parseInt(e.target.value) || 0))}
          min="0"
          className="form-control"
          placeholder="Nhập số điểm"
        />
      </div>

      <div className="button-group">
        <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
          ← Quay lại
        </button>
        <button onClick={() => setCurrentStep(3)} className="btn btn-primary">
          Tiếp tục → Thanh toán
        </button>
      </div>
    </div>
  );

  // Render step 3: Payment method
  const renderStep3 = () => (
    <div className="checkout-step">
      <h2>3️⃣ Chọn phương thức thanh toán</h2>

      <div className="payment-options">
        <div
          className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('COD')}
        >
          <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => {}} />
          <h4>💵 Thanh toán khi nhận hàng (COD)</h4>
          <p>Thanh toán tiền mặt, không cần thanh toán trước</p>
        </div>

        <div
          className={`payment-option ${paymentMethod === 'SEPAY_TRANSFER' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('SEPAY_TRANSFER')}
        >
          <input type="radio" name="payment" value="SEPAY_TRANSFER" checked={paymentMethod === 'SEPAY_TRANSFER'} onChange={() => {}} />
          <h4>🏦 Chuyển khoản ngân hàng (SEPAY)</h4>
          <p>Quét mã QR để thanh toán, nhận hàng khi hoàn tất</p>
        </div>
      </div>

      <div className="button-group">
        <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
          ← Quay lại
        </button>
        <button
          onClick={handleCreateOrder}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Đang tạo đơn...' : 'Xác nhận đặt hàng →'}
        </button>
      </div>
    </div>
  );

  // Render step 4: Order confirmation
  const renderStep4 = () => (
    <div className="checkout-step confirmation">
      <div className="success-icon">✓</div>
      <h2>Đặt hàng thành công!</h2>
      <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.</p>

      {orderConfirmation && (
        <div className="confirmation-details">
          <div className="detail-row">
            <span>Mã đơn hàng:</span>
            <span className="value">{orderConfirmation.orderId}</span>
          </div>
          <div className="detail-row">
            <span>Tổng tiền:</span>
            <span className="value amount">{orderConfirmation.totalAmount.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="detail-row">
            <span>Phương thức thanh toán:</span>
            <span className="value">
              {orderConfirmation.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
            </span>
          </div>
          <div className="detail-row">
            <span>Địa chỉ giao hàng:</span>
            <span className="value">{orderConfirmation.shippingAddress}</span>
          </div>
        </div>
      )}

      {sepayQr && paymentMethod === 'SEPAY_TRANSFER' && (
        <div className="sepay-qr-section">
          <h3>📱 Mã QR thanh toán</h3>
          <p>Quét mã QR bằng ứng dụng ngân hàng để thanh toán</p>
          <img src={sepayQr} alt="Sepay QR Code" className="qr-code" />
        </div>
      )}

      {paymentMethod === 'COD' && (
        <div className="cod-info">
          <p>💡 Bạn sẽ thanh toán tiền mặt khi nhận hàng. Vui lòng chuẩn bị sẵn tiền.</p>
        </div>
      )}

      <div className="button-group">
        <button onClick={handleGoToOrderDetail} className="btn btn-primary">
          Xem chi tiết đơn hàng
        </button>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Quay về trang chủ
        </button>
      </div>
    </div>
  );

  return (
    <div className="checkout-container">
      {error && (
        <div className="error-alert">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="checkout-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {currentStep < 4 && (
        <div className="checkout-progress">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Xem lại</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Địa chỉ</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Thanh toán</div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Xác nhận</div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;

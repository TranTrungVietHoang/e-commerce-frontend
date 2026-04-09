import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import orderService from '../../services/orderService';
import voucherService from '../../services/voucherService';
import paymentService from '../../services/paymentService';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, refreshCart } = useCart();  // Get cart from context instead of API call
  const [vouchersByShop, setVouchersByShop] = useState(() => location.state?.vouchersByShop || {});
  const [selectedItemsForCheckout] = useState(() => location.state?.selectedItemsForCheckout || []);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Shipping, 3: Payment, 4: Confirm
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
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
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Use selected items for checkout if available, otherwise use all cart items
  const checkoutItems = selectedItemsForCheckout.length > 0 ? selectedItemsForCheckout : (cart?.items || []);

  // Group items by shop
  const groupedByShop = React.useMemo(() => {
    const grouped = {};
    checkoutItems.forEach(item => {
      const shopId = item.shopId || 0;
      if (!grouped[shopId]) {
        grouped[shopId] = { shopName: item.shopName || 'Unknown Shop', items: [] };
      }
      grouped[shopId].items.push(item);
    });
    return grouped;
  }, [checkoutItems]);

  // Calculate totals including vouchers by shop
  const totals = React.useMemo(() => {
    let totalSubtotal = 0;
    let totalDiscount = 0;

    Object.entries(groupedByShop).forEach(([shopId, shopData]) => {
      const shopSubtotal = shopData.items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
      totalSubtotal += shopSubtotal;
      
      if (vouchersByShop[shopId]) {
        totalDiscount += vouchersByShop[shopId].discountAmount || 0;
      }
    });

    return {
      subtotal: totalSubtotal,
      discount: totalDiscount,
      final: Math.max(0, totalSubtotal - totalDiscount - pointsUsed)
    };
  }, [groupedByShop, vouchersByShop, pointsUsed]);

  // Calculate totals using lineTotal instead of totalPrice
  const subtotal = checkoutItems.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
  const totalAfterDiscount = totals.final;

  // Validate voucher
  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher');
      return;
    }

    try {
      setLoading(true);
      const response = await voucherService.validateVoucher(voucherCode, subtotal);
      // The interceptor returns the unwrapped data on success, or throws on error.
      if (response) {
        setVoucherId(response.id);
        setVoucherDiscount(response.discountAmount || 0);
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Lỗi kiểm tra voucher');
      setVoucherId(null);
      setVoucherDiscount(0);
    } finally {
      setLoading(false);
    }
  };

  // Create order
  const handleCreateOrder = async () => {
    if (!recipientName.trim()) {
      setError('Vui lòng nhập tên người nhận');
      return;
    }
    if (!recipientPhone.trim()) {
      setError('Vui lòng nhập số điện thoại người nhận');
      return;
    }
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Group cart items by shop
      const shopOrders = {};
      checkoutItems.forEach(item => {
        const shopId = item.shopId || 0;
        if (!shopOrders[shopId]) {
          shopOrders[shopId] = [];
        }
        shopOrders[shopId].push(item);
      });

      // Create order for each shop
      let lastOrder = null;
      for (const shopId of Object.keys(shopOrders)) {
        const shopVoucher = vouchersByShop[shopId];
        const vId = shopVoucher?.id || null;
        
        const order = await orderService.createOrder(
          parseInt(shopId),
          shippingAddress,
          paymentMethod,
          vId,
          pointsUsed,
          recipientName,
          recipientPhone
        );
        lastOrder = order;
      }

      if (lastOrder) {
        const order = lastOrder;

        // If SEPAY_TRANSFER - get QR code from payment service
        if (paymentMethod === 'SEPAY_TRANSFER') {
          try {
            const qrResponse = await paymentService.createSepayQr(
              order.id,
              order.totalAmount,
              `Thanh toán đơn hàng #${order.id}`
            );
            // qrResponse contains: qrCodeBase64, transferContent, status, expiresAt
            const qrStr = qrResponse?.qrCodeBase64 || qrResponse?.qrCode;
            if (qrStr && !qrStr.startsWith('http') && !qrStr.startsWith('data:image')) {
              setSepayQr(`data:image/png;base64,${qrStr}`);
            } else {
              setSepayQr(qrStr);
            }
          } catch (err) {
            console.error('Lỗi tạo mã QR Sepay:', err);
            setError('Lỗi tạo mã QR thanh toán: ' + err.message);
          }
        }

        setOrderConfirmation({
          orderId: order.id,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt
        });

        // Delay để đảm bảo backend transaction hoàn thành trước khi refresh cart
        setTimeout(() => {
          refreshCart && refreshCart();
        }, 500);

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
      navigate(`/orders/${orderConfirmation.orderId}`);
    }
  };

  // Auto-poll payment status khi user thanh toán Sepay
  useEffect(() => {
    if (currentStep === 4 && paymentMethod === 'SEPAY_TRANSFER' && orderConfirmation?.orderId && !paymentSuccess) {
      setPaymentPolling(true);

      const pollPayment = async () => {
        try {
          const response = await paymentService.getPaymentStatus(orderConfirmation.orderId);
          
          if (response?.status === 'PAID' || response?.status === 'COMPLETED') {
            setPaymentSuccess(true);
            setPaymentPolling(false);
            setError('');
          } else if (response?.status === 'EXPIRED' || response?.status === 'CANCELLED') {
            setError('❌ Thanh toán hết hạn hoặc bị hủy. Vui lòng tạo đơn hàng lại.');
            setPaymentPolling(false);
          }
        } catch (err) {
          // Yêu cầu tiếp tục polling khi lỗi
          console.error('Lỗi kiểm tra thanh toán:', err);
        }
      };

      // Poll mỗi 3 giây trong 5 phút (100 lần)
      const interval = setInterval(pollPayment, 3000);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setPaymentPolling(false);
        if (!paymentSuccess) {
          setError('⏰ Timeout: Không nhận được xác nhận thanh toán trong 5 phút. Vui lòng kiểm tra lại.');
        }
      }, 300000); // 5 phút

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentStep, paymentMethod, orderConfirmation, paymentSuccess]);

  const handleCancelOrder = async () => {
    if (!orderConfirmation?.orderId) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy thanh toán và hủy đơn hàng này không?')) return;
    try {
      setCanceling(true);
      const res = await orderService.cancelOrder(orderConfirmation.orderId);
      if (res) {
        alert('Hủy đơn hàng thành công!');
        navigate('/');
      } else {
        setError('Không thể hủy đơn hàng lúc này');
      }
    } catch (err) {
      setError('Lỗi hủy đơn: ' + err.message);
    } finally {
      setCanceling(false);
    }
  };

  // Render step 1: Review cart
  const renderStep1 = () => (
    <div className="checkout-step">
      <h2>1 Xem lại giỏ hàng</h2>
      {checkoutItems.length === 0 ? (
        <div className="empty-cart">
          <p>Gio hang trong. Vui long them san pham!</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Tiep tuc mua sam
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items-review">
            {Object.entries(groupedByShop).map(([shopId, shopData]) => (
              <div key={shopId} style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                <h3 style={{ marginBottom: 12 }}>{shopData.shopName}</h3>
                {shopData.items.map(item => (
                  <div key={item.id} className="cart-item-row">
                    <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.productName} className="item-image" />
                    <div className="item-info">
                      <h4>{item.productName}</h4>
                      <p>Loai: {item.variantName || 'Khong co'}</p>
                      <p>So luong: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      <p className="price">{(Number(item.lineTotal) || 0).toLocaleString('vi-VN')} d</p>
                    </div>
                  </div>
                ))}
                
                {vouchersByShop[shopId] && (
                  <div style={{ marginTop: 12, padding: 8, backgroundColor: '#f0f5ff', borderRadius: 4 }}>
                    <p style={{ margin: 0, fontSize: 12 }}>
                      Voucher: <strong>{vouchersByShop[shopId].code}</strong> - Giam {(vouchersByShop[shopId].discountAmount || 0).toLocaleString('vi-VN')} d
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="price-summary">
            <div className="summary-row">
              <span>Tong tien hang:</span>
              <span className="amount">{totals.subtotal.toLocaleString('vi-VN')} d</span>
            </div>
            {totals.discount > 0 && (
              <div className="summary-row discount">
                <span>Giam gia voucher:</span>
                <span className="amount">-{totals.discount.toLocaleString('vi-VN')} d</span>
              </div>
            )}
            {pointsUsed > 0 && (
              <div className="summary-row discount">
                <span>Diem thuong da dung:</span>
                <span className="amount">-{pointsUsed.toLocaleString('vi-VN')} d</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tong cong:</span>
              <span className="amount">{totals.final.toLocaleString('vi-VN')} d</span>
            </div>
          </div>

          <button onClick={() => setCurrentStep(2)} className="btn btn-primary btn-full">
            Tiep tuc Dia chi giao hang
          </button>
        </>
      )}
    </div>
  );

  // Render step 2: Shipping address
  const renderStep2 = () => (
    <div className="checkout-step">
      <h2>2️⃣ Thông tin giao hàng</h2>
      
      <div className="form-group">
        <label>Tên người nhận *</label>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Vd: Nguyễn Văn A"
          className="form-control"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Số điện thoại người nhận *</label>
        <input
          type="tel"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
          placeholder="Vd: 0912345678"
          className="form-control"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Địa chỉ giao hàng *</label>
        <textarea
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Vd: 123 Đường ABC, Quận Phú Nhuận, TP.HCM"
          rows={4}
          className="form-control"
          disabled={loading}
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
          <h4>Chuyển khoản ngân hàng (SEPAY)</h4>
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
      <div className={paymentSuccess || paymentMethod === 'COD' ? "success-icon" : "pending-icon"}>
        {paymentSuccess || paymentMethod === 'COD' ? '✓' : '⏳'}
      </div>
      <h2>{paymentSuccess || paymentMethod === 'COD' ? 'Đặt hàng thành công!' : 'Chờ xác nhận thanh toán...'}</h2>
      <p>
        {paymentSuccess || paymentMethod === 'COD'
          ? 'Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.' 
          : 'Vui lòng hoàn tất thanh toán qua mã QR dưới đây'}
      </p>

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

      {sepayQr && paymentMethod === 'SEPAY_TRANSFER' && !paymentSuccess && (
        <div className="sepay-qr-section">
          <h3>Mã QR thanh toán</h3>
          <p>Quét mã QR bằng ứng dụng ngân hàng để thanh toán</p>
          <img src={sepayQr} alt="Sepay QR Code" className="qr-code" />
          
          <div className="bank-transfer-info" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'left', display: 'inline-block', border: '1px dashed #d9d9d9' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1677ff', fontSize: '1.1em' }}>Hoặc chuyển khoản thủ công:</p>
            <p style={{ margin: '8px 0', fontSize: '15px' }}>Ngân hàng: <strong>MB Bank</strong></p>
            <p style={{ margin: '8px 0', fontSize: '15px' }}>Chủ tài khoản: <strong>VO MINH TAM</strong></p>
            <p style={{ margin: '8px 0', fontSize: '15px' }}>Số tài khoản: <strong>0334088130</strong></p>
            <p style={{ margin: '8px 0', fontSize: '15px' }}>Số tiền: <strong style={{color: '#ff4d4f'}}>{(orderConfirmation?.totalAmount || 0).toLocaleString('vi-VN')} ₫</strong></p>
            <p style={{ margin: '8px 0', fontSize: '15px' }}>Nội dung CK: <strong>THANH-TOAN-{orderConfirmation?.orderId}</strong></p>
            <p style={{ margin: '10px 0 0 0', color: '#faad14', fontSize: '0.9em', fontStyle: 'italic' }}>* Vui lòng ghi chính xác Nội dung giùm để hệ thống tự động xác nhận đơn hàng.</p>
          </div>

          {paymentPolling && (
            <div className="payment-polling" style={{ marginTop: '20px' }}>
              <div className="spinner"></div>
              <p>Hệ thống đang kiểm tra giao dịch...</p>
            </div>
          )}
        </div>
      )}

      {paymentMethod === 'COD' && (
        <div className="cod-info">
          <p>💡 Bạn sẽ thanh toán tiền mặt khi nhận hàng. Vui lòng chuẩn bị sẵn tiền.</p>
        </div>
      )}

      <div className="button-group" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {paymentSuccess || paymentMethod === 'COD' ? (
          <>
            <button onClick={handleGoToOrderDetail} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Xem chi tiết đơn hàng
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
              Quay về trang chủ
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleCancelOrder} 
              className="btn btn-danger" 
              style={{ width: '100%', padding: '12px', opacity: canceling ? 0.7 : 1 }}
              disabled={canceling}
            >
              {canceling ? 'Đang hủy...' : 'Không thanh toán nữa, Hủy đơn'}
            </button>
            <p className="waiting-info" style={{ textAlign: 'center', marginTop: '10px' }}>
              Đang chờ bạn thanh toán Sepay...
            </p>
          </>
        )}
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

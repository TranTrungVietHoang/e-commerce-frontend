import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);

  // Load order detail and status history
  useEffect(() => {
    const loadOrderData = async () => {
      try {
        setLoading(true);
        const [detailResponse, historyResponse] = await Promise.all([
          orderService.getOrderDetail(orderId),
          orderService.getOrderStatusHistory(orderId)
        ]);

        if (detailResponse.success) {
          setOrder(detailResponse.data);
        } else {
          setError(detailResponse.message || 'Lỗi tải đơn hàng');
        }

        if (historyResponse.success) {
          setStatusHistory(historyResponse.data || []);
        }
      } catch (err) {
        setError('Lỗi tải dữ liệu: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    try {
      setCanceling(true);
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        setOrder({ ...order, status: 'CANCELLED' });
        setError('');
        alert('Hủy đơn hàng thành công!');
      } else {
        setError(response.message || 'Lỗi hủy đơn');
      }
    } catch (err) {
      setError('Lỗi hủy đơn: ' + err.message);
    } finally {
      setCanceling(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      SHIPPING: '#8b5cf6',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Get status label in Vietnamese
  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="order-detail-container loading">⏳ Đang tải dữ liệu...</div>;
  }

  if (error && !order) {
    return <div className="order-detail-container error">❌ {error}</div>;
  }

  if (!order) {
    return <div className="order-detail-container">📭 Không tìm thấy đơn hàng</div>;
  }

  return (
    <div className="order-detail-container">
      {error && (
        <div className="error-alert">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="order-header">
        <div className="order-title">
          <h1>Chi tiết đơn hàng</h1>
          <p className="order-id">Mã đơn: <strong>#{order.id}</strong></p>
        </div>
        <div className={`status-badge`} style={{ backgroundColor: getStatusColor(order.status) }}>
          {getStatusLabel(order.status)}
        </div>
      </div>

      {/* Order Timeline */}
      {statusHistory.length > 0 && (
        <div className="order-timeline">
          <h3>📜 Lịch sử trạng thái</h3>
          <div className="timeline">
            {statusHistory.map((history, index) => (
              <div key={index} className="timeline-item">
                <div
                  className="timeline-marker"
                  style={{ backgroundColor: getStatusColor(history.status) }}
                />
                <div className="timeline-content">
                  <p className="timeline-status">{getStatusLabel(history.status)}</p>
                  <p className="timeline-date">{formatDate(history.changedAt)}</p>
                  {history.note && <p className="timeline-note">💬 {history.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="order-content">
        {/* Left: Items and Details */}
        <div className="order-left">
          {/* Order Items */}
          <div className="order-section">
            <h3>📦 Sản phẩm đã đặt</h3>
            <div className="order-items">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4>{item.product?.name}</h4>
                    <p className="variant">Loại: {item.variant?.name || 'N/A'}</p>
                    <p className="quantity">Số lượng: <strong>{item.quantity}</strong></p>
                    <p className="price">{(item.unitPrice || 0).toLocaleString('vi-VN')} ₫/cái</p>
                  </div>
                  <div className="item-total">
                    <p className="total-amount">
                      {(item.quantity * (item.unitPrice || 0)).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="order-section">
            <h3>🚚 Thông tin giao hàng</h3>
            <div className="shipping-info">
              <div className="info-row">
                <span className="label">Địa chỉ giao:</span>
                <span className="value">{order.shippingAddress}</span>
              </div>
              <div className="info-row">
                <span className="label">Cửa hàng:</span>
                <span className="value">{order.shop?.shopName || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary and Actions */}
        <div className="order-right">
          {/* Price Summary */}
          <div className="order-section summary">
            <h3>💰 Tóm tắt đơn hàng</h3>

            <div className="summary-item">
              <span>Tiền hàng:</span>
              <span>{(order.subtotal || 0).toLocaleString('vi-VN')} ₫</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="summary-item discount">
                <span>Giảm giá:</span>
                <span>-{(order.discountAmount || 0).toLocaleString('vi-VN')} ₫</span>
              </div>
            )}

            {order.pointsUsed > 0 && (
              <div className="summary-item discount">
                <span>Điểm thưởng:</span>
                <span>-{(order.pointsUsed || 0).toLocaleString('vi-VN')} ₫</span>
              </div>
            )}

            <div className="summary-separator"></div>

            <div className="summary-item total">
              <span>Tổng cộng:</span>
              <span>{(order.totalAmount || 0).toLocaleString('vi-VN')} ₫</span>
            </div>

            <div className="summary-item">
              <span>Phương thức TT:</span>
              <span>
                {order.paymentMethod === 'COD'
                  ? 'Thanh toán khi nhận'
                  : 'Chuyển khoản'}
              </span>
            </div>

            <div className="summary-item">
              <span>Ngày đặt:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="order-actions">
            {order.status === 'PENDING' && (
              <button
                onClick={handleCancelOrder}
                className="btn btn-danger btn-full"
                disabled={canceling}
              >
                {canceling ? '⏳ Đang hủy...' : '❌ Hủy đơn hàng'}
              </button>
            )}

            {order.status === 'DELIVERED' && (
              <button className="btn btn-primary btn-full">
                ⭐ Viết đánh giá
              </button>
            )}

            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary btn-full"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

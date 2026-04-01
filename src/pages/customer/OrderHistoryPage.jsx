import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getMyOrders(page, size);
        if (response) {
          let items = response.content || [];

          // Apply filter
          if (filterStatus !== 'ALL') {
            items = items.filter(order => order.status === filterStatus);
          }

          setOrders(items);
          setTotalPages(response.totalPages || 0);
          setError('');
        } else {
          setError('Lỗi tải danh sách đơn');
        }
      } catch (err) {
        setError('Lỗi: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [page, size, filterStatus]);

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('/')) return date;
    try {
      if (Array.isArray(date)) {
        return new Date(date[0], date[1] - 1, date[2], date[3] || 0, date[4] || 0).toLocaleString('vi-VN');
      }
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch(e) {
      return String(date);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      PAID: '#10b981', // xanh lá
      CONFIRMED: '#3b82f6',
      SHIPPING: '#8b5cf6',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ xác nhận',
      PAID: 'Đã TT (Chờ giao)',
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy'
    };
    return labels[status] || status;
  };

  // Handle view detail
  const handleViewDetail = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        // Reload orders
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
        alert('Hủy đơn hàng thành công!');
      } else {
        alert(response.message || 'Lỗi hủy đơn');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="order-history-container">
      {/* Header */}
      <div className="history-header">
        <h1>📦 Lịch sử đơn hàng</h1>
        <p>Xem và quản lý tất cả các đơn hàng của bạn</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          {['ALL', 'PENDING', 'PAID', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus(status);
                setPage(0);
              }}
            >
              {status === 'ALL' ? 'Tất cả' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="loading">⏳ Đang tải dữ liệu...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Không có đơn hàng</h3>
          <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <>
          <div className="orders-grid">
            {orders.map(order => (
              <div
                key={order.id}
                className="order-card"
                onClick={() => handleViewDetail(order.id)}
              >
                {/* Order Header */}
                <div className="card-header">
                  <div className="order-basic">
                    <p className="order-id">Đơn #<strong>{order.id}</strong></p>
                    <p className="order-shop">Cửa hàng: <strong>{order.shopName || 'N/A'}</strong></p>
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="card-body">
                  <p className="order-summary">
                    📦 <strong>{order.itemCount || 0}</strong> sản phẩm
                  </p>

                  {/* Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="items-preview">
                      {order.items.slice(0, 2).map((item, index) => (
                        <p key={index} className="item-preview">
                          • {item.product?.name} x{item.quantity}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="more-items">+ {order.items.length - 2} sản phẩm khác</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Order Footer */}
                <div className="card-footer">
                  <div className="amount-date">
                    <p className="amount">{(order.totalAmount || 0).toLocaleString('vi-VN')} ₫</p>
                    <p className="date">{formatDate(order.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="card-actions-text">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={(e) => handleCancelOrder(order.id, e)}
                        className="btn btn-danger btn-sm"
                        title="Hủy đơn"
                        style={{ marginRight: '8px', padding: '6px 14px', fontSize: '13px' }}
                      >
                        Hủy đơn
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(order.id);
                      }}
                      className="btn btn-primary btn-sm"
                      title="Xem chi tiết"
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                    >
                      Xem chi tiết đơn hàng
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn btn-secondary"
              >
                ← Trang trước
              </button>

              <div className="page-info">
                Trang <strong>{page + 1}</strong> / <strong>{totalPages}</strong>
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="btn btn-secondary"
              >
                Trang sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistoryPage;

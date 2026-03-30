import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import './SellerRevenueDashboard.css';

const SellerRevenueDashboard = ({ shopId }) => {
  const [period, setPeriod] = useState('DAY'); // DAY, MONTH, YEAR
  const [revenue, setRevenue] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load revenue data
  useEffect(() => {
    const loadRevenueData = async () => {
      if (!shopId) {
        setError('Shop ID không tìm thấy');
        return;
      }

      try {
        setLoading(true);
        const [revenueResp, productsResp, todayResp] = await Promise.all([
          orderService.getShopRevenue(shopId, period),
          orderService.getTopProducts(shopId, 10),
          orderService.getTodayRevenue(shopId)
        ]);

        if (revenueResp.success) {
          setRevenue(revenueResp.data);
        } else {
          setError(revenueResp.message || 'Lỗi tải doanh thu');
        }

        if (productsResp.success) {
          setTopProducts(productsResp.data || []);
        }

        if (todayResp.success) {
          setTodayRevenue(todayResp.data);
        }
      } catch (err) {
        setError('Lỗi tải dữ liệu: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, [shopId, period]);

  // Format currency
  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('vi-VN') + ' ₫';
  };

  // Create chart data visualization
  const getChartBars = (data) => {
    if (!data || data.length === 0) return [];

    const maxValue = Math.max(...data.map(d => d.amount || 0));
    return data.map(item => ({
      ...item,
      percentage: maxValue > 0 ? (item.amount / maxValue) * 100 : 0
    }));
  };

  if (loading && !revenue) {
    return <div className="revenue-container loading">⏳ Đang tải dữ liệu...</div>;
  }

  return (
    <div className="revenue-container">
      <div className="revenue-header">
        <h1>💰 Thống kê doanh thu</h1>
        <div className="period-selector">
          {['DAY', 'MONTH', 'YEAR'].map(p => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
              disabled={loading}
            >
              {p === 'DAY' ? '📅 Hôm nay' : p === 'MONTH' ? '📊 Tháng này' : '📈 Năm nay'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Stats Cards */}
      {revenue && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <p className="stat-label">Tổng đơn hàng</p>
              <p className="stat-value">{revenue.totalOrders || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <p className="stat-label">Đơn đã giao</p>
              <p className="stat-value">{revenue.deliveredOrders || 0}</p>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <p className="stat-label">Tổng doanh thu</p>
              <p className="stat-value">{formatCurrency(revenue.totalRevenue)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <p className="stat-label">Trung bình/đơn</p>
              <p className="stat-value">{formatCurrency(revenue.averageOrderValue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today Revenue */}
      {todayRevenue && (
        <div className="today-revenue">
          <h3>📅 Hôm nay</h3>
          <div className="today-stats">
            <div className="today-stat">
              <span className="label">Đơn hôm nay:</span>
              <span className="value">{todayRevenue.ordersToday || 0}</span>
            </div>
            <div className="today-stat">
              <span className="label">Doanh thu hôm nay:</span>
              <span className="value highlight">{formatCurrency(todayRevenue.revenueToday)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {revenue && revenue.chartData && revenue.chartData.length > 0 && (
        <div className="revenue-chart">
          <h3>📊 Doanh thu theo {period === 'DAY' ? 'giờ' : period === 'MONTH' ? 'ngày' : 'tháng'}</h3>
          <div className="chart">
            {getChartBars(revenue.chartData).map((item, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{ height: `${item.percentage || 0}%` }}
                    title={formatCurrency(item.amount)}
                  />
                </div>
                <p className="chart-label">{item.period}</p>
                <p className="chart-value">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="top-products">
          <h3>🏆 Top 10 sản phẩm bán chạy</h3>
          <div className="products-table">
            <div className="table-header">
              <div className="col-rank">STT</div>
              <div className="col-name">Tên sản phẩm</div>
              <div className="col-sold">Đã bán</div>
              <div className="col-revenue">Doanh thu</div>
            </div>

            {topProducts.map((product, index) => (
              <div key={product.productId} className="table-row">
                <div className="col-rank">
                  <span className={`rank ${index < 3 ? 'top-' + (index + 1) : ''}`}>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                  </span>
                </div>
                <div className="col-name">{product.productName}</div>
                <div className="col-sold">
                  <span className="badge">{product.soldCount}</span>
                </div>
                <div className="col-revenue">
                  <span className="amount">{formatCurrency(product.totalRevenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {revenue && revenue.totalOrders === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Không có dữ liệu</h3>
          <p>Chưa có đơn hàng nào trong giai đoạn này. Tiếp tục cải thiện cửa hàng!</p>
        </div>
      )}
    </div>
  );
};

export default SellerRevenueDashboard;

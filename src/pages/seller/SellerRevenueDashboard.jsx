import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Row, Col, Statistic, Select, Space, Table, Tag, Typography, Empty, Spin, message } from 'antd';
import { RiseOutlined, ShoppingCartOutlined, CheckCircleOutlined, LineChartOutlined, GiftOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import './SellerRevenueDashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;

const SellerRevenueDashboard = () => {
  const { user } = useAuth();
  const shopId = user?.shopId;
  const [period, setPeriod] = useState('DAY'); // DAY, MONTH, YEAR
  const [data, setData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!shopId) return;
      setLoading(true);
      try {
        const [stats, products] = await Promise.all([
          orderService.getShopRevenue(shopId, period),
          orderService.getTopProducts(shopId, 5)
        ]);
        setData(stats);
        setTopProducts(products || []);
      } catch (error) {
        console.error('Error fetching seller stats:', error);
        message.error('Không thể tải dữ liệu doanh thu');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [shopId, period]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldCount',
      key: 'soldCount',
      render: (count) => <Tag color="orange">{count} items</Tag>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (amount) => <Text type="danger">{formatCurrency(amount)}</Text>,
    },
  ];

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu kinh doanh của shop..." />
      </div>
    );
  }

  return (
    <div className="seller-dashboard-container">
      <div className="seller-dashboard-header">
        <div>
          <Title level={2}>Tổng quan kinh doanh</Title>
          <Text type="secondary">Phân tích hiệu quả bán hàng của cửa hàng bạn</Text>
        </div>
        <Space>
          <Text strong>Xem theo:</Text>
          <Select value={period} onChange={setPeriod} style={{ width: 150 }}>
            <Option value="DAY">Hôm nay</Option>
            <Option value="MONTH">Tháng này</Option>
            <Option value="YEAR">Năm nay</Option>
          </Select>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card-seller">
            <Statistic
              title="Doanh thu"
              value={data?.totalRevenue || 0}
              precision={0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<RiseOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card-seller">
            <Statistic
              title="Số đơn hàng"
              value={data?.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card-seller">
            <Statistic
              title="Thành công"
              value={data?.deliveredOrders || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card-seller">
            <Statistic
              title="Giá trị TB/Đơn"
              value={data?.averageOrderValue || 0}
              formatter={(val) => formatCurrency(val)}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ doanh thu" bordered={false} bodyStyle={{ padding: '24px 0' }}>
            <div style={{ height: 400 }}>
              {data?.chartData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(val) => [formatCurrency(val), 'Doanh thu']}
                      labelFormatter={(label) => `Thời gian: ${label}`}
                    />
                    <Bar dataKey="revenue" fill="#fa8c16" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Không có dữ liệu biểu đồ" />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Sản phẩm bán chạy nhất" bordered={false}>
            <Table
              dataSource={topProducts}
              columns={productColumns}
              pagination={false}
              size="small"
              rowKey="productId"
              locale={{ emptyText: <Empty description="Chưa có dữ liệu sản phẩm" /> }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SellerRevenueDashboard;

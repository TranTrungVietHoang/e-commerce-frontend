import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, Row, Col, Statistic, Select, Space, Table, Tag, Typography, Empty, Spin } from 'antd';
import {
  RiseOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons';
import orderService from '../../services/orderService';
import './AdminDashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminDashboard = () => {
  const [period, setPeriod] = useState('DAY'); // DAY, MONTH, YEAR
  const [data, setData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [stats, products] = await Promise.all([
          orderService.getPlatformRevenue(period),
          orderService.getPlatformTopProducts(5)
        ]);
        setData(stats);
        setTopProducts(products || []);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

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
      render: (count) => <Tag color="blue">{count} đã bán</Tag>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (amount) => <Text type="success">{formatCurrency(amount)}</Text>,
    },
  ];

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu thống kê toàn sàn..." />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <div>
          <Title level={2}>Bảng điều khiển hệ thống</Title>
          <Text type="secondary">Tổng quan hoạt động kinh doanh trên toàn nền tảng</Text>
        </div>
        <Space>
          <Text strong>Giai đoạn:</Text>
          <Select value={period} onChange={setPeriod} style={{ width: 150 }}>
            <Option value="DAY">Hôm nay</Option>
            <Option value="MONTH">Tháng này</Option>
            <Option value="YEAR">Năm nay</Option>
          </Select>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card-admin">
            <Statistic
              title="Tổng doanh thu"
              value={data?.totalRevenue || 0}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RiseOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card-admin">
            <Statistic
              title="Tổng đơn hàng"
              value={data?.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card-admin">
            <Statistic
              title="Giao hàng thành công"
              value={data?.deliveredOrders || 0}
              valueStyle={{ color: '#1677ff' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card-admin">
            <Statistic
              title="Giá trị TB đơn"
              value={data?.averageOrderValue || 0}
              formatter={(val) => formatCurrency(val)}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Phân tích tăng trưởng doanh thu" bordered={false} bodyStyle={{ padding: '24px 0' }}>
            <div style={{ height: 400 }}>
              {data?.chartData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), 'Doanh thu']}
                      labelFormatter={(label) => `Giai đoạn: ${label}`}
                    />
                    <Bar dataKey="revenue" fill="#1677ff" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Không có dữ liệu biểu đồ" />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top sản phẩm bán chạy toàn sàn" bordered={false}>
            <Table
              dataSource={topProducts}
              columns={productColumns}
              pagination={false}
              size="small"
              rowKey="productId"
              locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;

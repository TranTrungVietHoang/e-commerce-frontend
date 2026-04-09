import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, Row, Col, Statistic, Select, Space, Table, Tag, Typography, Empty, Spin, Button, Divider } from 'antd';
import {
  RiseOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import './AdminDashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('DAY'); // DAY, MONTH, YEAR
  const [data, setData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const adminModules = [
    {
      title: 'Quản lý Gian hàng',
      description: 'Phê duyệt hoặc từ chối các yêu cầu mở shop mới.',
      icon: <ShopOutlined style={{ fontSize: 24, color: '#1677ff' }} />,
      path: '/admin/shops',
      color: '#e6f7ff'
    },
    {
      title: 'Quản lý Danh mục',
      description: 'Thiết kế cây danh mục sản phẩm của hệ thống.',
      icon: <AppstoreOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      path: '/admin/categories',
      color: '#f9f0ff'
    },
    {
      title: 'Quản lý Người dùng',
      description: 'Xem danh sách, khóa hoặc mở khóa tài khoản.',
      icon: <UserOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      path: '/admin/users',
      color: '#fff7e6'
    }
  ];

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
      render: (text) => <Text strong ellipsis={{ tooltip: text }}>{text}</Text>,
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldCount',
      key: 'soldCount',
      width: 100,
      render: (count) => <Tag color="blue">{count}</Tag>,
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
        <Spin size="large" tip="Đang tải dữ liệu kinh doanh..." />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container" style={{ padding: 24 }}>
      {/* Header section with modules */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Admin Dashboard</Title>
        <Text type="secondary">Tổng quan hoạt động kinh doanh và quản lý hệ thống chuyên sâu.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {adminModules.map((module, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card 
              hoverable 
              style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              bodyStyle={{ padding: 20 }}
              onClick={() => navigate(module.path)}
            >
              <Space align="start" size={16}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: module.color, 
                  borderRadius: 12, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  {module.icon}
                </div>
                <div>
                  <Title level={5} style={{ margin: 0 }}>{module.title}</Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>{module.description}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button type="link" size="small" icon={<ArrowRightOutlined />} style={{ padding: 0 }}>
                      Quản lý ngay
                    </Button>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: '32px 0' }} />

      <div className="admin-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Thống Kê Kinh Doanh</Title>
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
          <Card title="Phân tích tăng trưởng doanh thu" bordered={false} style={{ borderRadius: 12 }}>
            <div style={{ height: 400 }}>
              {data?.chartData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                    <RechartsTooltip
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
          <Card title="Top sản phẩm bán chạy toàn sàn" bordered={false} style={{ borderRadius: 12 }}>
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

      <Card style={{ marginTop: 32, borderRadius: 16, background: '#f0f5ff', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CheckCircleOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <div>
            <Title level={5} style={{ margin: 0 }}>Hệ thống đang hoạt động ổn định</Title>
            <Text type="secondary">Tất cả các dịch vụ Backend và Database đang ở trạng thái tốt nhất.</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;

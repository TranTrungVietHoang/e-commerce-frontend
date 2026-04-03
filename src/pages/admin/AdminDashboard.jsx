import React from 'react';
import { Card, Col, Row, Statistic, Button, Typography, Space } from 'antd';
import { 
  ShopOutlined, 
  AppstoreOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminModules = [
    {
      title: 'Quản lý Gian hàng',
      description: 'Phê duyệt hoặc từ chối các yêu cầu mở shop mới từ người bán.',
      icon: <ShopOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      count: 'Đang chờ duyệt',
      path: '/admin/shops',
      color: '#e6f7ff'
    },
    {
      title: 'Quản lý Danh mục',
      description: 'Thiết kế cây danh mục sản phẩm (Cha - Con) cho toàn hệ thống.',
      icon: <AppstoreOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      count: 'Cấu trúc cây',
      path: '/admin/categories',
      color: '#f9f0ff'
    },
    {
      title: 'Quản lý Người dùng',
      description: 'Xem danh sách, khóa hoặc mở khóa tài khoản người dùng.',
      icon: <UserOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      count: 'Toàn hệ thống',
      path: '/admin/users',
      color: '#fff7e6'
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Admin Dashboard</Title>
        <Text type="secondary">Chào mừng quay trở lại, Quản trị viên. Hãy quản lý hệ thống của bạn từ đây.</Text>
      </div>

      <Row gutter={[24, 24]}>
        {adminModules.map((module, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card 
              hoverable 
              style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ 
                width: 64, 
                height: 64, 
                backgroundColor: module.color, 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 20
              }}>
                {module.icon}
              </div>
              
              <Title level={4} style={{ marginBottom: 12 }}>{module.title}</Title>
              <Text type="secondary" style={{ marginBottom: 24, flex: 1 }}>{module.description}</Text>
              
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Tag color="blue">{module.count}</Tag>
                <Button 
                  type="link" 
                  icon={<ArrowRightOutlined />} 
                  onClick={() => navigate(module.path)}
                  style={{ padding: 0 }}
                >
                  Truy cập ngay
                </Button>
              </div>
            </Card>
          </Col>
        ))}
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

// Mock Tag component since it's used
const Tag = ({ color, children }) => (
  <span style={{ 
    backgroundColor: color === 'blue' ? '#e6f7ff' : '#f5f5f5', 
    color: color === 'blue' ? '#1677ff' : '#595959',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    border: `1px solid ${color === 'blue' ? '#91d5ff' : '#d9d9d9'}`
  }}>
    {children}
  </span>
);

export default AdminDashboard;

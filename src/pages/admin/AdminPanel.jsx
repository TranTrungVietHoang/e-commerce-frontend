import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppstoreOutlined, 
  UserOutlined, 
  ShopOutlined, 
  DashboardOutlined 
} from '@ant-design/icons';

const { Content, Sider } = Layout;

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: 'Quản lý danh mục',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
    },
    {
      key: '/admin/shops',
      icon: <ShopOutlined />,
      label: 'Quản lý cửa hàng',
    },
  ];

  return (
    <Layout style={{ minHeight: '80vh', background: '#fff' }}>
      <Sider width={250} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ height: '100%', borderRight: 0, paddingTop: 16 }}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '0 24px 24px', background: '#fff' }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPanel;
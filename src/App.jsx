import React from 'react';
import { ConfigProvider, Layout, Menu, theme, Button } from 'antd';
import { ShoppingCartOutlined, UserOutlined, ShopOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProductManagePage from './pages/seller/ProductManagePage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import './App.css';

const { Header, Content, Footer } = Layout;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    { key: '/', icon: <ShopOutlined />, label: 'Cửa hàng' },
    { key: '/seller/products', icon: <AppstoreOutlined />, label: 'Quản lý kho' },
    { key: '/cart', icon: <ShoppingCartOutlined />, label: 'Giỏ hàng' },
    { key: '/profile', icon: <UserOutlined />, label: 'Tài khoản' },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1, width: '100%' }}>
          <div 
            className="logo" 
            style={{ color: 'white', fontWeight: 'bold', marginRight: 40, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            A+ MARKETPLACE
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        
        <Content style={{ padding: '0 48px', marginTop: 24 }}>
          <div
            style={{
              background: colorBgContainer,
              minHeight: '80vh',
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              {/* Trang chủ Demo */}
              <Route path="/" element={
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <h1>Chào mừng bạn đến với A+ Marketplace</h1>
                  <p>Hệ thống quản lý sản phẩm chuyên nghiệp dành cho người bán.</p>
                  <Button type="primary" size="large" onClick={() => navigate('/seller/products')}>
                    Đi tới Quản lý kho
                  </Button>
                </div>
              } />
              
              {/* Module Seller Products */}
              <Route path="/seller/products" element={<ProductManagePage />} />
              <Route path="/seller/products/add" element={<AddProductPage />} />
              <Route path="/seller/products/edit/:id" element={<EditProductPage />} />
              
              {/* Fallback */}
              <Route path="*" element={<div style={{ padding: 50 }}>404 - Trang không tồn tại</div>} />
            </Routes>
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          A+ Marketplace ©{new Date().getFullYear()} - Professional E-Commerce System
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

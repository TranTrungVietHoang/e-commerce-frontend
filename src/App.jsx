import React from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, ShopOutlined,
  AppstoreOutlined, HomeOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Seller pages
import ProductManagePage  from './pages/seller/ProductManagePage';
import AddProductPage     from './pages/seller/AddProductPage';
import EditProductPage    from './pages/seller/EditProductPage';

// Public pages (Member 4)
import HomePage           from './pages/public/HomePage';
import SearchResultPage   from './pages/public/SearchResultPage';
import ProductDetailPage  from './pages/public/ProductDetailPage';

// Common components
import SearchBar from './components/common/SearchBar';

import './App.css';

const { Header, Content, Footer } = Layout;

const App = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const menuItems = [
    { key: '/',                icon: <HomeOutlined />,         label: 'Trang chủ' },
    { key: '/search',          icon: <AppstoreOutlined />,     label: 'Khám phá' },
    { key: '/seller/products', icon: <ShopOutlined />,         label: 'Quản lý kho' },
    { key: '/cart',            icon: <ShoppingCartOutlined />, label: 'Giỏ hàng' },
    { key: '/profile',         icon: <UserOutlined />,         label: 'Tài khoản' },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, width: '100%', gap: 24 }}>
          {/* Logo */}
          <div
            style={{ color: 'white', fontWeight: 800, fontSize: 18, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: 1 }}
            onClick={() => navigate('/')}
          >
            A+ MARKETPLACE
          </div>

          {/* SearchBar */}
          <SearchBar />

          {/* Navigation */}
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>

        <Content style={{ background: '#f5f6fa', minHeight: 'calc(100vh - 64px - 70px)' }}>
          <div style={{ background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: '80vh' }}>
            <Routes>
              {/* ── Public (Member 4) ── */}
              <Route path="/"            element={<HomePage />} />
              <Route path="/search"      element={<SearchResultPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />

              {/* ── Seller ── */}
              <Route path="/seller/products"       element={<ProductManagePage />} />
              <Route path="/seller/products/add"   element={<AddProductPage />} />
              <Route path="/seller/products/edit/:id" element={<EditProductPage />} />

              {/* Fallback */}
              <Route path="*" element={<div style={{ padding: 50, textAlign: 'center' }}>404 - Trang không tồn tại</div>} />
            </Routes>
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', background: '#001529', color: '#ffffff88', padding: '16px' }}>
          A+ Marketplace ©{new Date().getFullYear()} - Professional E-Commerce System
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

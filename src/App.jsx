import React from 'react';
import { ConfigProvider, Layout, Menu, theme, Button, Avatar, Dropdown, Space } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, ShopOutlined,
  AppstoreOutlined, HomeOutlined, LogoutOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SearchBar from './components/common/SearchBar';

// ── Public pages ──────────────────────────────────────────────────────────────
import HomePage          from './pages/public/HomePage';
import SearchResultPage  from './pages/public/SearchResultPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import LoginPage         from './pages/public/LoginPage';
import RegisterPage      from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// ── Seller pages ──────────────────────────────────────────────────────────────
import ProductManagePage from './pages/seller/ProductManagePage';
import AddProductPage    from './pages/seller/AddProductPage';
import EditProductPage   from './pages/seller/EditProductPage';

// ── Customer pages ────────────────────────────────────────────────────────────
import CartPage    from './pages/customer/CartPage';

import './App.css';

const { Header, Content, Footer } = Layout;

// ── Inner shell (dùng hook cần nằm trong Provider) ───────────────────────────
const AppShell = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  const menuItems = [
    { key: '/',       icon: <HomeOutlined />,         label: 'Trang chủ' },
    { key: '/search', icon: <AppstoreOutlined />,     label: 'Khám phá'  },
    { key: '/seller/products', icon: <ShopOutlined />, label: 'Quản lý kho' },
    { key: '/cart',   icon: <ShoppingCartOutlined />, label: 'Giỏ hàng'  },
  ];

  // Dropdown menu cho avatar khi đã đăng nhập
  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />,   label: 'Hồ sơ của tôi' },
    isAdmin ? { key: 'admin',   icon: <AppstoreOutlined />, label: 'Admin Dashboard' } : null,
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />,  label: 'Đăng xuất', danger: true },
  ].filter(Boolean);

  const handleUserMenu = ({ key }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
    else if (key === 'profile') navigate('/profile');
    else if (key === 'admin')   navigate('/admin/users');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, width: '100%', gap: 16 }}>
        {/* Logo */}
        <div
          style={{ color: 'white', fontWeight: 800, fontSize: 18, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: 1 }}
          onClick={() => navigate('/')}
        >
          A+ MARKETPLACE
        </div>

        <SearchBar />

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />

        {/* Auth area */}
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: 'white' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <span style={{ fontSize: 13 }}>{user?.fullName?.split(' ').at(-1)}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button size="small" onClick={() => navigate('/login')}>Đăng nhập</Button>
            <Button size="small" type="primary" onClick={() => navigate('/register')}>Đăng ký</Button>
          </Space>
        )}
      </Header>

      <Content style={{ background: '#f5f6fa', minHeight: 'calc(100vh - 134px)' }}>
        <div style={{ background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: '80vh' }}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/"              element={<HomePage />} />
            <Route path="/search"        element={<SearchResultPage />} />
            <Route path="/products/:id"  element={<ProductDetailPage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/register"      element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized"  element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>🚫 Bạn không có quyền truy cập trang này.</div>} />

            {/* ── Customer (cần đăng nhập) ── */}
            <Route path="/cart"    element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><div style={{ padding: 40 }}>Profile Page (Milestone 8)</div></ProtectedRoute>} />

            {/* ── Seller ── */}
            <Route path="/seller/products"         element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><ProductManagePage /></ProtectedRoute>} />
            <Route path="/seller/products/add"     element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><AddProductPage /></ProtectedRoute>} />
            <Route path="/seller/products/edit/:id" element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><EditProductPage /></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/admin/users" element={<ProtectedRoute roles={['ROLE_ADMIN']}><div style={{ padding: 40 }}>Admin User Manage (Milestone 9)</div></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>404 — Trang không tồn tại</div>} />
          </Routes>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#ffffff88', padding: '16px' }}>
        A+ Marketplace ©{new Date().getFullYear()} — Professional E-Commerce System
      </Footer>
    </Layout>
  );
};

// ── Root App: bọc providers ───────────────────────────────────────────────────
const App = () => (
  <ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}>
    <AuthProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </AuthProvider>
  </ConfigProvider>
);

export default App;

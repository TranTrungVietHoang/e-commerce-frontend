import React from 'react';
import { ConfigProvider, Layout, Menu, theme, Button, Avatar, Dropdown, Space } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, ShopOutlined,
  AppstoreOutlined, HomeOutlined, LogoutOutlined, PlusOutlined,
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
import ShopRegistrationPage from './pages/seller/ShopRegistrationPage';
import SellerDashboard   from './pages/seller/SellerDashboard';

// ── Customer pages ────────────────────────────────────────────────────────────
import CartPage     from './pages/customer/CartPage';
import ProfilePage  from './pages/customer/ProfilePage';

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagePage from './pages/admin/UserManagePage';
import ShopManagePage from './pages/admin/ShopManagePage';
import CategoryManagePage from './pages/admin/CategoryManagePage';

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
    isAuthenticated && (user?.roles?.includes('ROLE_SELLER')) && !isAdmin
      ? { key: 'myshop',  icon: <ShopOutlined />,   label: 'Kênh Người bán' }
      : !isAdmin ? { key: 'register-shop', icon: <PlusOutlined />, label: 'Đăng ký Bán hàng' } : null,
    
    isAdmin ? { 
      key: 'admin-dashboard', 
      icon: <AppstoreOutlined />, 
      label: 'Admin Dashboard',
      children: [
        { key: 'admin-shops', label: 'Quản lý Gian hàng' },
        { key: 'admin-products', label: 'Quản lý Sản phẩm' },
        { key: 'admin-categories', label: 'Quản lý Danh mục' },
        { key: 'admin-users', label: 'Quản lý Người dùng' },
      ]
    } : null,
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />,  label: 'Đăng xuất', danger: true },
  ].filter(Boolean);

  const handleUserMenu = ({ key }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
    else if (key === 'profile') navigate('/profile');
    else if (key === 'myshop')  navigate('/seller/shop');
    else if (key === 'register-shop')  navigate('/seller/shop/register');
    else if (key === 'admin-dashboard') navigate('/admin');
    else if (key === 'admin-shops') navigate('/admin/shops');
    else if (key === 'admin-products') navigate('/admin/products');
    else if (key === 'admin-categories') navigate('/admin/categories');
    else if (key === 'admin-users') navigate('/admin/users');
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
              <Avatar
                src={user?.avatarUrl || null}
                icon={!user?.avatarUrl && <UserOutlined />}
                style={{ backgroundColor: '#1677ff' }}
              />
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
            <Route path="/"              element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/search"        element={<SearchResultPage />} />
            <Route path="/products/:id"  element={<ProductDetailPage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/register"      element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized"  element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>🚫 Bạn không có quyền truy cập trang này.</div>} />

            {/* ── Customer (cần đăng nhập) ── */}
            <Route path="/cart"    element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* ── Seller ── */}
            <Route path="/seller/shop/register"    element={<ProtectedRoute><ShopRegistrationPage /></ProtectedRoute>} />
            <Route path="/seller/shop"             element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
            <Route path="/seller/products"         element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><ProductManagePage /></ProtectedRoute>} />
            <Route path="/seller/products/add"     element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><AddProductPage /></ProtectedRoute>} />
            <Route path="/seller/products/edit/:id" element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><EditProductPage /></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/admin"       element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['ROLE_ADMIN']}><UserManagePage /></ProtectedRoute>} />
            <Route path="/admin/shops" element={<ProtectedRoute roles={['ROLE_ADMIN']}><ShopManagePage /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute roles={['ROLE_ADMIN']}><ProductManagePage isAdminView={true} /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute roles={['ROLE_ADMIN']}><CategoryManagePage /></ProtectedRoute>} />

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

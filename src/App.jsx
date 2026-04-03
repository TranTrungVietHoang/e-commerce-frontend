import React from 'react';
import { ConfigProvider, Layout, Menu, theme, Button, Avatar, Dropdown, Space } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, ShopOutlined,
  AppstoreOutlined, HomeOutlined, LogoutOutlined, HeartOutlined,
  DashboardOutlined, TagsOutlined, GiftOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SearchBar from './components/common/SearchBar';
import NotificationDropdown from './components/common/NotificationDropdown';
import ChatWidget from './components/common/ChatWidget';

// ── Public pages ──────────────────────────────────────────────────────────────
import HomePage from './pages/public/HomePage';
import SearchResultPage from './pages/public/SearchResultPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// ── Seller pages ──────────────────────────────────────────────────────────────
import ProductManagePage from './pages/seller/ProductManagePage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import OrderManagePage from './pages/seller/OrderManagePage';
import SellerRevenueDashboard from './pages/seller/SellerRevenueDashboard';
import SellerVoucherManagePage from './pages/seller/VoucherManagePage';

// ── Customer pages ────────────────────────────────────────────────────────────
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import ProfilePage from './pages/customer/ProfilePage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import WishlistPage from './pages/customer/WishlistPage';

// ── Admin pages ───────────────────────────────────────────────────────────────
import UserManagePage from './pages/admin/UserManagePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ShopManagePage from './pages/admin/ShopManagePage';
import CategoryManagePage from './pages/admin/CategoryManagePage';
import AdminVoucherManagePage from './pages/admin/VoucherManagePage';

import './App.css';

const { Header, Content, Footer } = Layout;

// ── Inner shell (dùng hook cần nằm trong Provider) ───────────────────────────
const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const { isAuthenticated, user, logout, isAdmin, isSeller } = useAuth();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: '/search', icon: <AppstoreOutlined />, label: 'Khám phá' },
    ...(isSeller ? [
      { key: '/seller/products', icon: <ShopOutlined />, label: 'Quản lý kho' },
      { key: '/seller/orders', icon: <ShoppingCartOutlined />, label: 'Quản lý đơn' },
      { key: '/seller/revenue', icon: <DashboardOutlined />, label: 'Doanh thu' },
      { key: '/seller/categories', icon: <TagsOutlined />, label: 'Danh mục shop' },
      { key: '/seller/vouchers', icon: <GiftOutlined />, label: 'Voucher shop' }
    ] : isAdmin ? [
      { key: '/admin/revenue', icon: <DashboardOutlined />, label: 'Thống kê' },
      { key: '/admin/users', icon: <UserOutlined />, label: 'Người dùng' },
      { key: '/admin/shops', icon: <ShopOutlined />, label: 'Cửa hàng' },
      { key: '/admin/categories', icon: <TagsOutlined />, label: 'Danh mục' },
      { key: '/admin/vouchers', icon: <GiftOutlined />, label: 'Voucher' }
    ] : isAuthenticated ? [
      { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Lịch sử mua hàng' },
      { key: '/wishlist', icon: <HeartOutlined />, label: 'Yêu thích' },
    ] : []),
    ...(isAdmin ? [] : [
      { key: '/cart', icon: <ShoppingCartOutlined />, label: 'Giỏ hàng' }
    ]),
  ];

  // Dropdown menu cho avatar khi đã đăng nhập
  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ của tôi' },
    isAdmin ? { key: 'admin', icon: <AppstoreOutlined />, label: 'Admin Dashboard' } : null,
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
  ].filter(Boolean);

  const handleUserMenu = ({ key }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
    else if (key === 'profile') navigate('/profile');
    else if (key === 'admin') navigate('/admin/users');
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
          <Space style={{ alignItems: 'center', gap: 4 }}>
            <NotificationDropdown />
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
          </Space>
        ) : (
          <Space>
            <Button size="small" onClick={() => navigate('/login')}>'Đăng nhập</Button>
            <Button size="small" type="primary" onClick={() => navigate('/register')}>Đăng ký</Button>
          </Space>
        )}
      </Header>

      <Content style={{ background: '#f5f6fa', minHeight: 'calc(100vh - 134px)' }}>
        <div style={{ background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: '80vh' }}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>🚫 Bạn không có quyền truy cập trang này.</div>} />

            {/* ── Customer (cần đăng nhập) ── */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

            {/* ── Seller ── */}
            <Route path="/seller/products" element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><ProductManagePage /></ProtectedRoute>} />
            <Route path="/seller/products/add" element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><AddProductPage /></ProtectedRoute>} />
            <Route path="/seller/products/edit/:id" element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><EditProductPage /></ProtectedRoute>} />
            <Route path="/seller/orders" element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><OrderManagePage /></ProtectedRoute>} />
            <Route path="/seller/vouchers" element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><SellerVoucherManagePage /></ProtectedRoute>} />
            <Route path="/seller/revenue" element={<ProtectedRoute roles={['ROLE_SELLER', 'ROLE_ADMIN']}><SellerRevenueDashboard /></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/admin/users" element={<ProtectedRoute roles={['ROLE_ADMIN']}><UserManagePage /></ProtectedRoute>} />
            <Route path="/admin/revenue" element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/shops" element={<ProtectedRoute roles={['ROLE_ADMIN']}><ShopManagePage /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute roles={['ROLE_ADMIN']}><CategoryManagePage /></ProtectedRoute>} />
            <Route path="/admin/vouchers" element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminVoucherManagePage /></ProtectedRoute>} />



            {/* Fallback */}
            <Route path="*" element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>404 — Trang không tồn tại</div>} />
          </Routes>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#ffffff88', padding: '16px' }}>
        A+ Marketplace ©{new Date().getFullYear()} — Professional E-Commerce System
      </Footer>

      {/* Chat Widget góc dưới phải */}
      <ChatWidget />
    </Layout>
  );
};

// ── Root App: bọc providers ───────────────────────────────────────────────────
const App = () => (
  <ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}>
    <AuthProvider>
      <WebSocketProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </WebSocketProvider>
    </AuthProvider>
  </ConfigProvider>
);

export default App;

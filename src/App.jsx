import React from 'react';
import { ConfigProvider, Layout, Menu, theme, Button, Avatar, Dropdown, Space } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, ShopOutlined,
  AppstoreOutlined, HomeOutlined, LogoutOutlined, HeartOutlined,
  DashboardOutlined, TagsOutlined, GiftOutlined, ThunderboltOutlined,
  CheckCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import SearchBar from './components/common/SearchBar';
import NotificationDropdown from './components/common/NotificationDropdown';
import ChatWidget from './components/common/ChatWidget';
import ProtectedRoute from './components/common/ProtectedRoute';

// ── Routing Central ─────────────────────────────────────────────────────────────
import AppRouter from './routes/AppRouter';

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
      { key: '/seller/revenue', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/seller/products', icon: <ShopOutlined />, label: 'Quản lý kho' },
      { key: '/seller/orders', icon: <ShoppingCartOutlined />, label: 'Quản lý đơn' },
      { key: '/seller/categories', icon: <TagsOutlined />, label: 'Danh mục shop' },
      { key: '/seller/vouchers', icon: <GiftOutlined />, label: 'Voucher shop' },
      { key: '/seller/flash-sales', icon: <ThunderboltOutlined />, label: 'Flash Sale' }
    ] : isAdmin ? [
      { key: '/admin', icon: <DashboardOutlined />, label: 'Thống kê' },
      { key: '/admin/users', icon: <UserOutlined />, label: 'Người dùng' },
      { key: '/admin/shops', icon: <ShopOutlined />, label: 'Cửa hàng' },
      { key: '/admin/categories', icon: <TagsOutlined />, label: 'Danh mục' },
      { key: '/admin/vouchers', icon: <GiftOutlined />, label: 'Voucher' },
      { key: '/admin/moderation', icon: <CheckCircleOutlined />, label: 'Duyệt sản phẩm' },
      { key: '/admin/flash-sales', icon: <ThunderboltOutlined />, label: 'Flash Sale (Mới)' }
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
    
    // Nếu là Seller, thêm link vào Kênh người bán
    isAuthenticated && isSeller && !isAdmin && { key: 'myshop', icon: <ShopOutlined />, label: 'Kênh Người bán' },
    
    // Nếu chưa là Seller và không phải Admin, cho phép đăng ký
    isAuthenticated && !isSeller && !isAdmin && { key: 'register-shop', icon: <PlusOutlined />, label: 'Đăng ký Bán hàng' },
    
    // Admin dashboard link
    isAdmin && { 
      key: 'admin-dashboard', 
      icon: <AppstoreOutlined />, 
      label: 'Quản lý hệ thống',
      children: [
        { key: 'admin-shops', label: 'Quản lý Gian hàng' },
        { key: 'admin-products', label: 'Quản lý Sản phẩm' },
        { key: 'admin-categories', label: 'Quản lý Danh mục' },
        { key: 'admin-users', label: 'Quản lý Người dùng' },
      ]
    },
    
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
  ].filter(Boolean);

  const handleUserMenu = ({ key }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
    else if (key === 'profile') navigate('/profile');
    else if (key === 'myshop') navigate('/seller/revenue');
    else if (key === 'register-shop') navigate('/seller/shop/register');
    else if (key === 'admin-dashboard' || key === 'admin') navigate('/admin');
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
          <Space style={{ alignItems: 'center', gap: 4 }}>
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
            <Button size="small" onClick={() => navigate('/login')}>Đăng nhập</Button>
            <Button size="small" type="primary" onClick={() => navigate('/register')}>Đăng ký</Button>
          </Space>
        )}
      </Header>

      <Content style={{ background: '#f5f6fa', minHeight: 'calc(100vh - 134px)' }}>
        <div style={{ background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: '80vh' }}>
          <AppRouter />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#ffffff88', padding: '16px' }}>
        A+ Marketplace ©{new Date().getFullYear()} — Professional E-Commerce System
      </Footer>

      {/* Chat Widget tạm thời gỡ bỏ do thiếu file */}
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

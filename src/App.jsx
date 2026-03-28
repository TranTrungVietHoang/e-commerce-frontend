import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, ConfigProvider, Drawer, Layout, List, Menu, Space, Typography } from 'antd';
import { AppstoreOutlined, GiftOutlined, HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import useCart from './hooks/useCart';
import HomePage from './pages/public/HomePage';
import CartPage from './pages/customer/CartPage';
import ProductManagePage from './pages/seller/ProductManagePage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import VoucherManagePage from './pages/seller/VoucherManagePage';
import React from 'react';
import { ConfigProvider, Layout, Menu, theme, Button } from 'antd';
import { ShoppingCartOutlined, UserOutlined, ShopOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProductManagePage from './pages/seller/ProductManagePage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import './App.css';

const { Header, Content } = Layout;
const { Text } = Typography;

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cart, removeCartItem } = useCart();

  const items = useMemo(() => ([
    { key: '/', icon: <HomeOutlined />, label: 'Trang chu' },
    { key: '/seller/products', icon: <AppstoreOutlined />, label: 'Quan ly san pham' },
    { key: '/seller/vouchers', icon: <GiftOutlined />, label: 'Voucher' },
    { key: '/cart', icon: <ShoppingCartOutlined />, label: 'Gio hang' },
  ]), []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>
          A+ Marketplace
        </Text>
        <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]} items={items} onClick={({ key }) => navigate(key)} style={{ flex: 1 }} />
        <Badge count={cart.totalItems}>
          <Button icon={<ShoppingCartOutlined />} onClick={() => setDrawerOpen(true)}>
            Gio hang nhanh
          </Button>
        </Badge>
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/seller/products" element={<ProductManagePage />} />
          <Route path="/seller/products/add" element={<AddProductPage />} />
          <Route path="/seller/products/edit/:id" element={<EditProductPage />} />
          <Route path="/seller/vouchers" element={<VoucherManagePage />} />
        </Routes>
      </Content>
      <Drawer title="Gio hang nhanh" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={420}>
        <List
          dataSource={cart.items}
          locale={{ emptyText: 'Chua co san pham' }}
          renderItem={(item) => (
            <List.Item actions={[<Button type="link" danger onClick={() => removeCartItem(item.id)}>Xoa</Button>]}>
              <List.Item.Meta
                avatar={<img src={item.imageUrl || 'https://via.placeholder.com/48'} alt={item.productName} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                title={item.productName}
                description={`${item.quantity} x ${formatCurrency(item.unitPrice)}`}
              />
            </List.Item>
          )}
        />
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Tam tinh: {formatCurrency(cart.subtotal)}</Text>
            <Button type="primary" block onClick={() => { setDrawerOpen(false); navigate('/cart'); }}>
              Mo trang gio hang
            </Button>
          </Space>
        </Card>
      </Drawer>
    </Layout>
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

const App = () => (
  <ConfigProvider theme={{ token: { colorPrimary: '#d4380d', borderRadius: 10 } }}>
    <CartProvider>
      <AppShell />
    </CartProvider>
  </ConfigProvider>
);

export default App;

import React from 'react';
import { ConfigProvider, Layout, Menu, theme, Button, message } from 'antd';
import { ShoppingCartOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import './App.css';

const { Header, Content, Footer } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleDemo = () => {
    message.success('Vite + Ant Design đã sẵn sàng! 🚀');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div className="demo-logo" style={{ color: 'white', fontWeight: 'bold', marginRight: 40 }}>
            E-COMMERCE MARKETPLACE
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            items={[
              { key: '1', icon: <ShopOutlined />, label: 'Cửa hàng' },
              { key: '2', icon: <ShoppingCartOutlined />, label: 'Giỏ hàng' },
              { key: '3', icon: <UserOutlined />, label: 'Tài khoản' },
            ]}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content style={{ padding: '0 48px', marginTop: 32 }}>
          <div
            style={{
              background: colorBgContainer,
              minHeight: 480,
              padding: 24,
              borderRadius: borderRadiusLG,
              textAlign: 'center'
            }}
          >
            <h1>Chào mừng bạn đến với dự án E-Commerce Marketplace</h1>
            <p>Hệ thống đã được chuyển đổi sang <b>Vite</b> để đạt hiệu năng cao nhất và sửa lỗi HMR.</p>
            <Button type="primary" onClick={handleDemo} size="large">
              Bắt đầu ngay
            </Button>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          E-Commerce Marketplace ©{new Date().getFullYear()} Created by Team A+
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

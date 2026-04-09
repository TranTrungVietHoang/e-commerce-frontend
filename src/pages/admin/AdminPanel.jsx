import React, { useEffect, useState } from 'react';
import { Layout, Menu, Badge, Avatar, theme, Tooltip } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  AppstoreOutlined,
  UserOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  ShoppingOutlined,
  BellFilled,
} from '@ant-design/icons';
import shopService from '../../services/shopService';

const { Content, Sider } = Layout;

const MENU_ITEMS = (pendingCount) => [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
  },
  { type: 'divider' },
  {
    key: 'grp-content',
    type: 'group',
    label: 'NỘI DUNG',
    children: [
      { key: '/admin/categories',  icon: <AppstoreOutlined />,     label: 'Danh mục' },
      { key: '/admin/moderation',  icon: <CheckCircleOutlined />,  label: 'Duyệt sản phẩm' },
      { key: '/admin/flash-sales', icon: <ThunderboltOutlined />,  label: 'Flash Sale' },
      { key: '/admin/vouchers',    icon: <GiftOutlined />,         label: 'Voucher' },
      { key: '/admin/orders',      icon: <ShoppingOutlined />,     label: 'Đơn hàng' },
    ],
  },
  { type: 'divider' },
  {
    key: 'grp-people',
    type: 'group',
    label: 'NGƯỜI DÙNG',
    children: [
      { key: '/admin/users', icon: <UserOutlined />, label: 'Quản lý người dùng' },
      {
        key: '/admin/shops',
        icon: <ShopOutlined />,
        label: (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Gian hàng & Seller
            {pendingCount > 0 && (
              <Badge count={pendingCount} size="small" style={{ marginLeft: 6, backgroundColor: '#fa541c' }} />
            )}
          </span>
        ),
      },
    ],
  },
];

const AdminPanel = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { token }   = theme.useToken();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    shopService.getPendingShops()
      .then(d => setPending(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, []);

  const selectedKey = '/' + location.pathname.split('/').slice(1, 3).join('/');

  return (
    <Layout style={{ minHeight: '80vh', background: '#f0f2f5' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sider
        width={230}
        theme="light"
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Brand area */}
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid #f5f5f5',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Avatar
            size={38}
            style={{ background: `linear-gradient(135deg, ${token.colorPrimary}, #36cfc9)`, flexShrink: 0 }}
            icon={<DashboardOutlined />}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#141414', lineHeight: 1.2 }}>Admin Panel</div>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 1 }}>A+ Marketplace</div>
          </div>
          {pending > 0 && (
            <Tooltip title={`${pending} yêu cầu chờ duyệt`}>
              <BellFilled style={{ marginLeft: 'auto', color: '#fa541c', fontSize: 16, cursor: 'pointer' }}
                onClick={() => navigate('/admin/shops')} />
            </Tooltip>
          )}
        </div>

        {/* Nav menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ border: 0, paddingTop: 8, background: 'transparent', fontSize: 13.5 }}
          items={MENU_ITEMS(pending)}
          onClick={({ key }) => { if (!key.startsWith('grp-')) navigate(key); }}
        />

        {/* Pending alert banner */}
        {pending > 0 && (
          <div
            onClick={() => navigate('/admin/shops')}
            style={{
              margin: '12px 12px 0',
              padding: '10px 12px',
              background: '#fff2e8',
              border: '1px solid #ffbb96',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <BellFilled style={{ color: '#fa541c', fontSize: 13 }} />
            <span style={{ fontSize: 12, color: '#d4380d', fontWeight: 500 }}>
              {pending} gian hàng chờ duyệt
            </span>
          </div>
        )}
      </Sider>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <Layout style={{ background: '#f0f2f5' }}>
        <Content style={{ padding: 24, minHeight: '80vh' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPanel;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Tabs, Table, Tag, Button, Space, message, Card, Popconfirm,
  Avatar, Modal, Typography, Input, Alert, Badge, Row, Col,
  Statistic, Divider, Skeleton, Empty, Tooltip,
} from 'antd';
import {
  ShopOutlined, CheckOutlined, CloseOutlined, EyeOutlined,
  UserOutlined, ReloadOutlined, LockOutlined, UnlockOutlined,
  ClockCircleOutlined, CheckCircleFilled, CloseCircleFilled,
  WarningFilled,
} from '@ant-design/icons';
import shopService from '../../services/shopService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/* ── Status helpers ────────────────────────────────────────────────── */
const STATUS_MAP = {
  PENDING:  { color: 'warning',  icon: <ClockCircleOutlined />,  text: 'Chờ duyệt' },
  APPROVED: { color: 'success',  icon: <CheckCircleFilled />,    text: 'Hoạt động' },
  REJECTED: { color: 'error',    icon: <CloseCircleFilled />,    text: 'Từ chối' },
  LOCKED:   { color: 'volcano',  icon: <WarningFilled />,        text: 'Bị khoá' },
};

const StatusTag = ({ status }) => {
  const s = STATUS_MAP[status] || { color: 'default', text: status };
  return <Tag color={s.color} icon={s.icon}>{s.text}</Tag>;
};

/* ── Shop Detail Modal ─────────────────────────────────────────────── */
const ShopDetailModal = ({ shop, open, onClose, onAction }) => {
  const [reason, setReason]       = useState('');
  const [actionKey, setActionKey] = useState(null); // 'APPROVED' | 'REJECTED' | 'LOCKED'
  const [loading, setLoading]     = useState(false);

  const resetModal = () => { setReason(''); setActionKey(null); };

  const doAction = async (status) => {
    setLoading(true);
    try {
      await shopService.approveShop(shop.id, status, reason);
      message.success(
        status === 'APPROVED' ? '✅ Đã duyệt gian hàng và cấp quyền Seller' :
        status === 'REJECTED' ? '❌ Đã từ chối yêu cầu'                      :
        status === 'LOCKED'   ? '🔒 Đã khoá gian hàng'                        :
                                '🔓 Đã mở khoá gian hàng'
      );
      onAction();
      onClose();
      resetModal();
    } catch (err) {
      message.error(err?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  if (!shop) return null;

  const needReason = ['REJECTED', 'LOCKED'].includes(actionKey);

  return (
    <Modal
      open={open}
      onCancel={() => { onClose(); resetModal(); }}
      footer={null}
      width={700}
      title={
        <Space>
          <ShopOutlined style={{ color: '#1677ff' }} />
          <Text strong style={{ fontSize: 16 }}>Chi tiết Gian hàng</Text>
          <StatusTag status={shop.status} />
        </Space>
      }
    >
      {/* Banner */}
      <div style={{ position: 'relative', height: 160, marginBottom: 56, borderRadius: 10, overflow: 'hidden', background: '#f0f2f5' }}>
        {shop.bannerUrl
          ? <img src={shop.bannerUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
        }
        <div style={{ position: 'absolute', bottom: -40, left: 20, background: '#fff', borderRadius: 12, padding: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          <Avatar src={shop.logoUrl} size={76} shape="square" style={{ borderRadius: 10 }} icon={<ShopOutlined />} />
        </div>
      </div>

      <div style={{ padding: '0 4px' }}>
        <Title level={4} style={{ margin: 0 }}>{shop.name}</Title>
        <Space style={{ marginTop: 4, marginBottom: 16 }}>
          <UserOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary">Chủ sở hữu: <b>{shop.sellerName}</b></Text>
          <Text type="secondary">— ID: {shop.sellerId}</Text>
        </Space>

        <Divider style={{ margin: '12px 0' }} />

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>NGÀY ĐĂNG KÝ</Text>
            <div style={{ fontWeight: 600 }}>{new Date(shop.createdAt).toLocaleString('vi-VN')}</div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>ĐÁNH GIÁ</Text>
            <div style={{ fontWeight: 600 }}>{shop.rating ?? '—'} ⭐</div>
          </Col>
        </Row>

        {shop.description && (
          <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>MÔ TẢ GIAN HÀNG</Text>
            <Paragraph style={{ margin: '4px 0 0', whiteSpace: 'pre-line' }}>{shop.description}</Paragraph>
          </div>
        )}

        {shop.rejectionReason && (
          <Alert
            showIcon
            type={shop.status === 'LOCKED' ? 'warning' : 'error'}
            message={shop.status === 'LOCKED' ? 'Lý do khoá' : 'Lý do từ chối'}
            description={shop.rejectionReason}
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        <Divider style={{ margin: '12px 0' }}>Hành động quản trị</Divider>

        {/* Reason box (shown when a "bad" action is selected) */}
        {needReason && (
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {actionKey === 'REJECTED' ? 'LÝ DO TỪ CHỐI *' : 'LÝ DO KHOÁ *'}
            </Text>
            <TextArea
              rows={3}
              placeholder="Nhập lý do rõ ràng để thông báo cho chủ shop..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>
        )}

        {/* Action buttons */}
        <Space wrap>
          {shop.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={loading && actionKey === 'APPROVED'}
                onClick={() => { setActionKey('APPROVED'); doAction('APPROVED'); }}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Duyệt & Cấp quyền Seller
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                loading={loading && actionKey === 'REJECTED'}
                onClick={() => {
                  if (!actionKey) { setActionKey('REJECTED'); return; }
                  if (!reason.trim()) { message.warning('Vui lòng nhập lý do'); return; }
                  doAction('REJECTED');
                }}
              >
                Từ chối
              </Button>
            </>
          )}

          {shop.status === 'APPROVED' && (
            <Button
              danger
              icon={<LockOutlined />}
              loading={loading && actionKey === 'LOCKED'}
              onClick={() => {
                if (!actionKey) { setActionKey('LOCKED'); return; }
                if (!reason.trim()) { message.warning('Vui lòng nhập lý do khoá'); return; }
                doAction('LOCKED');
              }}
            >
              Khoá gian hàng
            </Button>
          )}

          {shop.status === 'LOCKED' && (
            <Popconfirm title="Xác nhận mở khoá gian hàng?" onConfirm={() => doAction('APPROVED')}>
              <Button type="primary" icon={<UnlockOutlined />} loading={loading}>Mở khoá</Button>
            </Popconfirm>
          )}

          {shop.status === 'REJECTED' && (
            <Popconfirm title="Duyệt lại gian hàng này?" onConfirm={() => doAction('APPROVED')}>
              <Button type="primary" icon={<CheckOutlined />} loading={loading}>Xét duyệt lại</Button>
            </Popconfirm>
          )}

          {actionKey && (
            <Button onClick={resetModal}>Huỷ hành động</Button>
          )}
        </Space>
      </div>
    </Modal>
  );
};

/* ── Main page ─────────────────────────────────────────────────────── */
const ShopManagePage = () => {
  const [shops,    setShops]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab]           = useState('PENDING');

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await shopService.getAllShops();
      setShops(data || []);
    } catch {
      message.error('Không thể tải danh sách gian hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const counts = {
    PENDING:  shops.filter(s => s.status === 'PENDING').length,
    APPROVED: shops.filter(s => s.status === 'APPROVED').length,
    REJECTED: shops.filter(s => s.status === 'REJECTED').length,
    LOCKED:   shops.filter(s => s.status === 'LOCKED').length,
  };

  const openDetail = (shop) => { setSelected(shop); setModalOpen(true); };

  /* Table columns (shared across tabs, rows filtered by tab below) */
  const columns = [
    {
      title: 'Gian hàng',
      render: (_, r) => (
        <Space>
          <Avatar src={r.logoUrl} size={44} shape="square" style={{ borderRadius: 8, background: '#f0f2f5' }} icon={<ShopOutlined />} />
          <div>
            <div style={{ fontWeight: 600, color: '#141414' }}>{r.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <UserOutlined style={{ marginRight: 4 }} />{r.sellerName}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: s => <StatusTag status={s} />,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      width: 150,
      render: d => new Date(d).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      width: 90,
      render: r => r ? `${r} ⭐` : '—',
    },
    {
      title: '',
      width: 120,
      render: (_, r) => (
        <Button type="primary" ghost size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)}>
          Xem & Duyệt
        </Button>
      ),
    },
  ];

  const filtered = tab === 'ALL' ? shops : shops.filter(s => s.status === tab);

  const tabItems = [
    {
      key: 'PENDING',
      label: (
        <Space>
          <ClockCircleOutlined />
          Chờ duyệt
          {counts.PENDING > 0 && <Badge count={counts.PENDING} size="small" style={{ backgroundColor: '#fa541c' }} />}
        </Space>
      ),
    },
    { key: 'APPROVED', label: <Space><CheckCircleFilled style={{ color: '#52c41a' }} />Đang hoạt động</Space> },
    { key: 'REJECTED', label: <Space><CloseCircleFilled style={{ color: '#ff4d4f' }} />Đã từ chối</Space> },
    { key: 'LOCKED',   label: <Space><WarningFilled     style={{ color: '#faad14' }} />Bị khoá</Space> },
    { key: 'ALL',      label: 'Tất cả' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <ShopOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            Quản lý Gian hàng & Duyệt Seller
          </Title>
          <Text type="secondary">Xem xét yêu cầu mở shop, phê duyệt và cấp quyền Seller</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchShops} loading={loading}>Làm mới</Button>
      </div>

      {/* Stats row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: 'Chờ duyệt', value: counts.PENDING, color: '#fa541c', bg: '#fff2e8', border: '#ffbb96' },
          { label: 'Hoạt động', value: counts.APPROVED, color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f' },
          { label: 'Từ chối',   value: counts.REJECTED, color: '#cf1322', bg: '#fff1f0', border: '#ffa39e' },
          { label: 'Bị khoá',   value: counts.LOCKED,   color: '#d46b08', bg: '#fff7e6', border: '#ffd591' },
        ].map(s => (
          <Col xs={24} sm={12} lg={6} key={s.label}>
            <Card
              size="small"
              style={{ border: `1px solid ${s.border}`, background: s.bg, borderRadius: 10, cursor: 'pointer' }}
              onClick={() => setTab(s.label === 'Hoạt động' ? 'APPROVED' : s.label === 'Từ chối' ? 'REJECTED' : s.label === 'Bị khoá' ? 'LOCKED' : 'PENDING')}
            >
              <Statistic title={s.label} value={s.value} valueStyle={{ color: s.color, fontSize: 28 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pending highlight */}
      {counts.PENDING > 0 && (
        <Alert
          showIcon
          type="warning"
          message={
            <span>
              <b>{counts.PENDING} gian hàng đang chờ duyệt.</b>{' '}
              Khi duyệt, hệ thống sẽ tự động <b>cấp quyền SELLER</b> cho tài khoản tương ứng.
            </span>
          }
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      {/* Main table */}
      <Card
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={tabItems}
          style={{ padding: '0 20px' }}
        />
        <div style={{ padding: '0 20px 20px' }}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            locale={{ emptyText: <Empty description="Không có gian hàng nào" /> }}
            rowClassName={r => r.status === 'PENDING' ? 'pending-row' : ''}
          />
        </div>
      </Card>

      {/* Detail + action modal */}
      <ShopDetailModal
        shop={selected}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAction={fetchShops}
      />
    </div>
  );
};

export default ShopManagePage;

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Card, Popconfirm, Avatar, Modal, Typography, Input, Alert } from 'antd';
import { ShopOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import shopService from '../../services/shopService';

const { Title, Text } = Typography;

const ShopManagePage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [actionReason, setActionReason] = useState('');

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await shopService.getAllShops();
      setShops(data);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi tải danh sách gian hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      await shopService.approveShop(id, status, reason);
      message.success(`Đã chuyển trạng thái gian hàng sang ${status}`);
      setRejectModalVisible(false);
      setLockModalVisible(false);
      setDetailModalVisible(false);
      setActionReason('');
      fetchShops();
    } catch (error) {
      message.error(error?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleShowDetail = async (id) => {
    try {
      setLoading(true);
      const data = await shopService.getAdminShopById(id);
      setSelectedShop(data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Không thể lấy thông tin chi tiết gian hàng');
    } finally {
      setLoading(false);
    }
  };

  const showRejectModal = (id) => {
    setSelectedShopId(id);
    setActionReason('');
    setRejectModalVisible(true);
  };

  const showLockModal = (id) => {
    setSelectedShopId(id);
    setActionReason('');
    setLockModalVisible(true);
  };

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      width: 80,
      render: (img) => <Avatar src={img} icon={!img && <ShopOutlined />} shape="square" size="large"/>,
    },
    {
      title: 'Tên Gian Hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <b>{text}</b>
          <br/>
          <Text type="secondary" style={{ fontSize: 12 }}>Chủ shop: {record.sellerName}</Text>
          {record.rejectionReason && (
            <div style={{ marginTop: 4 }}>
              <Text type={record.status === 'LOCKED' ? 'warning' : 'danger'} style={{ fontSize: 11 }}>
                Lý do: {record.rejectionReason}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = status;
        if (status === 'PENDING') { color = 'warning'; text = 'Chờ duyệt'; }
        if (status === 'APPROVED') { color = 'success'; text = 'Đang hoạt động'; }
        if (status === 'REJECTED') { color = 'error'; text = 'Bị từ chối'; }
        if (status === 'LOCKED') { color = 'volcano'; text = 'Đang khóa'; }
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Chờ duyệt', value: 'PENDING' },
        { text: 'Đang hoạt động', value: 'APPROVED' },
        { text: 'Bị từ chối', value: 'REJECTED' },
        { text: 'Đang khóa', value: 'LOCKED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button size="small" type="link" onClick={() => handleShowDetail(record.id)}>Xem chi tiết</Button>
          
          {record.status === 'PENDING' && (
            <Space>
              <Popconfirm title="Duyệt gian hàng này?" onConfirm={() => handleUpdateStatus(record.id, 'APPROVED')}>
                <Button type="primary" size="small" icon={<CheckOutlined />}>Duyệt</Button>
              </Popconfirm>
              <Button danger size="small" icon={<CloseOutlined />} onClick={() => showRejectModal(record.id)}>Từ chối</Button>
            </Space>
          )}

          {record.status === 'APPROVED' && (
            <Button danger size="small" onClick={() => showLockModal(record.id)}>Khóa Shop</Button>
          )}

          {record.status === 'LOCKED' && (
            <Popconfirm title="Mở khóa gian hàng này?" onConfirm={() => handleUpdateStatus(record.id, 'APPROVED')}>
              <Button type="primary" size="small">Mở khóa</Button>
            </Popconfirm>
          )}

          {record.status === 'REJECTED' && (
             <Popconfirm title="Duyệt lại gian hàng này?" onConfirm={() => handleUpdateStatus(record.id, 'APPROVED')}>
                <Button size="small">Xem xét lại</Button>
             </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<Title level={4} style={{ margin: 0 }}><ShopOutlined /> Quản lý Gian hàng</Title>}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <Table 
          columns={columns} 
          dataSource={shops} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title="Lý do xử lý gian hàng"
        open={rejectModalVisible || lockModalVisible}
        onOk={() => handleUpdateStatus(selectedShopId, rejectModalVisible ? 'REJECTED' : 'LOCKED', actionReason)}
        onCancel={() => { setRejectModalVisible(false); setLockModalVisible(false); }}
        okText={rejectModalVisible ? "Gửi từ chối" : "Xác nhận khóa"}
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Text type="secondary">Vui lòng cung cấp lý do để chủ shop biết thông tin:</Text>
        <Input.TextArea 
          rows={4} 
          value={actionReason} 
          onChange={(e) => setActionReason(e.target.value)}
          placeholder="Nhập lý do cụ thể tại đây..."
          style={{ marginTop: 12 }}
        />
      </Modal>

      {/* Modal Chi tiết Shop */}
      <Modal
        title="Thông tin chi tiết Gian hàng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>Đóng</Button>
        ]}
        width={700}
      >
        {selectedShop && (
          <div style={{ padding: '10px 0' }}>
            <div style={{ position: 'relative', height: 180, marginBottom: 60 }}>
              <img 
                src={selectedShop.bannerUrl || 'https://via.placeholder.com/1200x300'} 
                alt="Banner" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
              />
              <div style={{ position: 'absolute', bottom: -40, left: 24, padding: 4, background: 'white', borderRadius: 12 }}>
                <Avatar 
                  src={selectedShop.logoUrl} 
                  size={100} 
                  shape="square" 
                  icon={<ShopOutlined />} 
                  style={{ borderRadius: 8 }}
                />
              </div>
            </div>
            
            <div style={{ padding: '0 24px' }}>
              <Space align="center" style={{ marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>{selectedShop.name}</Title>
                <Tag color={selectedShop.status === 'APPROVED' ? 'success' : 'warning'}>{selectedShop.status}</Tag>
              </Space>
              
              <Text type="secondary">Chủ sở hữu: <b>{selectedShop.sellerName}</b> (User ID: {selectedShop.sellerId})</Text>
              <br/>
              <Text type="secondary">Ngày tạo: {new Date(selectedShop.createdAt).toLocaleString('vi-VN')}</Text>
              
              <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <Text strong>Mô tả gian hàng:</Text>
                <p style={{ marginTop: 8, whiteSpace: 'pre-line' }}>{selectedShop.description || 'Không có mô tả'}</p>
              </div>

              {selectedShop.rejectionReason && (
                <Alert
                  message={selectedShop.status === 'LOCKED' ? "Lý do khóa Shop" : "Lý do từ chối"}
                  description={selectedShop.rejectionReason}
                  type={selectedShop.status === 'LOCKED' ? "warning" : "error"}
                  showIcon
                  style={{ marginTop: 24 }}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShopManagePage;

import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Card, Typography, Input, Select, DatePicker, message, Modal, Descriptions } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AdminOrderManagePage = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data simulation for Admin
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders([
        { id: 'ORD-1001', customer: 'Nguyễn Văn A', shop: 'Shop Điện Tử', total: 1250000, status: 'PAID', createdAt: '2023-11-01 10:30' },
        { id: 'ORD-1002', customer: 'Trần Thị B', shop: 'Gia Dụng Việt', total: 450000, status: 'SHIPPED', createdAt: '2023-11-02 14:20' },
        { id: 'ORD-1003', customer: 'Lê Văn C', shop: 'Thời Trang Hè', total: 820000, status: 'PENDING', createdAt: '2023-11-03 09:15' },
        { id: 'ORD-1004', customer: 'Phạm Minh D', shop: 'Shop Điện Tử', total: 2100000, status: 'CANCELLED', createdAt: '2023-11-04 16:45' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const getStatusTag = (status) => {
    const statusMap = {
      'PAID': { color: 'green', text: 'Đã thanh toán' },
      'SHIPPED': { color: 'blue', text: 'Đang giao hàng' },
      'PENDING': { color: 'gold', text: 'Chờ xử lý' },
      'CANCELLED': { color: 'red', text: 'Đã hủy' },
      'DELIVERED': { color: 'cyan', text: 'Đã nhận hàng' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    { title: 'ID Đơn hàng', dataIndex: 'id', key: 'id', strong: true },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Gian hàng', dataIndex: 'shop', key: 'shop' },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'total', 
      key: 'total',
      render: (total) => <Text strong>{total.toLocaleString('vi-VN')} đ</Text>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    { title: 'Ngày đặt', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => { setSelectedOrder(record); setIsDetailVisible(true); }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<><ShoppingCartOutlined /> Quản lý đơn hàng hệ thống</>}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
          <Space wrap>
            <Input placeholder="Tìm theo mã đơn/khách hàng" style={{ width: 250 }} prefix={<SearchOutlined />} />
            <Select placeholder="Trạng thái" style={{ width: 150 }} allowClear>
              <Select.Option value="PAID">Đã thanh toán</Select.Option>
              <Select.Option value="PENDING">Chờ xử lý</Select.Option>
              <Select.Option value="SHIPPED">Đang giao</Select.Option>
              <Select.Option value="CANCELLED">Đã hủy</Select.Option>
            </Select>
            <RangePicker />
            <Button type="primary" icon={<FilterOutlined />}>Lọc</Button>
          </Space>
        </Space>

        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[<Button key="close" onClick={() => setIsDetailVisible(false)}>Đóng</Button>]}
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã đơn hàng">{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">{selectedOrder.createdAt}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{selectedOrder.customer}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
            <Descriptions.Item label="Gian hàng" span={2}>{selectedOrder.shop}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>123 Đường ABC, Quận X, TP. Hồ Chí Minh</Descriptions.Item>
            <Descriptions.Item label="Tổng cộng" span={2}>
              <Text type="danger" strong style={{ fontSize: 18 }}>{selectedOrder.total.toLocaleString('vi-VN')} đ</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrderManagePage;

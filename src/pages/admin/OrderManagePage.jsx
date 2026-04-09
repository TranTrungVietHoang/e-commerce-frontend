import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Card, Typography, Input, Select, DatePicker, message, Modal, Descriptions } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AdminOrderManagePage = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getOrders(page, size);
      // ApiResponse thường có { success, result, message }
      const data = response?.result || response;
      
      if (data && data.content) {
        setOrders(data.content);
        setPagination({
          current: data.number + 1,
          pageSize: data.size,
          total: data.totalElements
        });
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách đơn hàng: ' + (error.message || 'Lỗi hệ thống'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

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
    { title: 'Gian hàng', dataIndex: 'shopName', key: 'shopName' },
    { title: 'Số lượng SP', dataIndex: 'itemCount', key: 'itemCount' },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount',
      render: (totalAmount) => <Text strong>{(totalAmount || 0).toLocaleString('vi-VN')} đ</Text>
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
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchOrders(page - 1, pageSize)
          }}
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
            <Descriptions.Item label="Ngày đặt">
              {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng SP">{selectedOrder.itemCount}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
            <Descriptions.Item label="Gian hàng" span={2}>{selectedOrder.shopName}</Descriptions.Item>
            <Descriptions.Item label="Tổng cộng" span={2}>
              <Text type="danger" strong style={{ fontSize: 18 }}>
                {(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ
              </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrderManagePage;

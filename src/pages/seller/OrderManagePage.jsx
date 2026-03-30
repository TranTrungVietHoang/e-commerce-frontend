import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, message, Select, Button, Modal } from 'antd';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

/**
 * Giao diện Quản lý Đơn Hàng cho Seller (Member 6).
 */
const OrderManagePage = ({ shopId = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const data = await orderService.getShopOrders(shopId, page, size);
      setOrders(data.content);
      setPagination({ current: page + 1, pageSize: size, total: data.totalElements });
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng: ' + (error.message || 'Lỗi server'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0, pagination.pageSize);
  }, [shopId]);

  const handleUpdateStatus = (orderId, oldStatus, newStatus) => {
    if (oldStatus === newStatus) return;
    
    Modal.confirm({
      title: 'Cập nhật trạng thái',
      content: `Chuyển trạng thái đơn hàng #${orderId} sang ${newStatus}?`,
      onOk: async () => {
        setIsUpdating(true);
        try {
          await orderService.updateOrderStatus(orderId, newStatus);
          message.success('Cập nhật trạng thái thành công');
          fetchOrders(pagination.current - 1, pagination.pageSize);
        } catch (err) {
          message.error('Lỗi cập nhật: ' + (err.message || 'Có lỗi xảy ra'));
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  const statusColors = {
    'PENDING': 'orange',
    'CONFIRMED': 'blue',
    'SHIPPING': 'cyan',
    'DELIVERED': 'green',
    'CANCELLED': 'red'
  };

  const statusOptions = {
    'PENDING': ['PENDING', 'CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['CONFIRMED', 'SHIPPING', 'CANCELLED'],
    'SHIPPING': ['SHIPPING', 'DELIVERED'],
    'DELIVERED': ['DELIVERED'],
    'CANCELLED': ['CANCELLED']
  };

  const columns = [
    {
      title: 'Mã đơn', 
      dataIndex: 'id', 
      width: 80,
      render: (id) => <Text strong>#{id}</Text>
    },
    {
      title: 'Ngày tạo', 
      dataIndex: 'createdAt', 
      width: 150,
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Số sản phẩm', 
      dataIndex: 'itemCount', 
      width: 120,
      render: (count) => `${count} mặt hàng`
    },
    {
      title: 'Tổng tiền', 
      dataIndex: 'totalAmount', 
      width: 150,
      render: (amount) => <Text type="success" strong>{money(amount)}</Text>
    },
    {
      title: 'Trạng thái hiện tại', 
      dataIndex: 'status', 
      width: 150,
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>{status}</Tag>
      )
    },
    {
      title: 'Cập nhật trạng thái', 
      width: 200,
      render: (_, record) => (
        <Select 
          value={record.status} 
          style={{ width: 140 }}
          disabled={record.status === 'DELIVERED' || record.status === 'CANCELLED' || isUpdating}
          onChange={(val) => handleUpdateStatus(record.id, record.status, val)}
          onClick={(e) => e.stopPropagation()}
        >
          {(statusOptions[record.status] || []).map(st => (
            <Option key={st} value={st}>{st}</Option>
          ))}
        </Select>
      )
    }
  ];

  // No more check for missing shopId since default is 0

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Đơn hàng (Của Shop)
          </Title>
          <Button 
            type="primary" 
            onClick={() => fetchOrders(pagination.current - 1, pagination.pageSize)}
          >
            Làm mới
          </Button>
        </div>

        <Table
          columns={columns} 
          dataSource={orders} 
          rowKey="id"
          loading={loading}
          pagination={{ 
            ...pagination, 
            onChange: (page, pageSize) => fetchOrders(page - 1, pageSize),
            showSizeChanger: true
          }}
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};

export default OrderManagePage;

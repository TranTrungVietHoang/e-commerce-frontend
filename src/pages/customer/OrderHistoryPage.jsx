import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message, Select, Button, Space, Card, Alert, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

// Trạng thái đơn hàng
const STATUS_LABELS = {
  'PENDING': 'Chờ duyệt',
  'CONFIRMED': 'Đã xác nhận',
  'SHIPPING': 'Đang giao',
  'DELIVERED': 'Thành công',
  'CANCELLED': 'Hủy'
};

const STATUS_COLORS = {
  'PENDING': 'orange',
  'CONFIRMED': 'blue',
  'SHIPPING': 'cyan',
  'DELIVERED': 'green',
  'CANCELLED': 'red'
};

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = async (page = 0, size = 10, status = '') => {
    setLoading(true);
    try {
      const response = await orderService.getMyOrders(page, size);
      let filteredOrders = response.content || response || [];
      
      // Lọc theo status nếu có
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }
      
      setOrders(filteredOrders);
      setPagination({ 
        current: page + 1, 
        pageSize: size, 
        total: (response.totalPages || 1) * size 
      });
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng: ' + (error.message || 'Lỗi server'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0, pagination.pageSize, filterStatus);
  }, [filterStatus]);

  const handleCancelOrder = (orderId, currentStatus) => {
    if (currentStatus !== 'PENDING') {
      message.warning('Chỉ có thể hủy đơn hàng ở trạng thái chờ duyệt');
      return;
    }

    const confirmed = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
    if (!confirmed) return;

    orderService.cancelOrder(orderId)
      .then(() => {
        message.success('Hủy đơn hàng thành công');
        fetchOrders(pagination.current - 1, pagination.pageSize, filterStatus);
      })
      .catch(err => {
        message.error('Lỗi hủy đơn: ' + err.message);
      });
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      width: 90,
      render: (id) => <Text strong>#{id}</Text>
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      width: 140,
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Cửa hàng',
      dataIndex: 'shopName',
      width: 150,
      render: (shopName) => <Text ellipsis title={shopName}>{shopName || 'N/A'}</Text>
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'itemCount',
      width: 100,
      render: (count) => `${count} mặt hàng`
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      width: 130,
      render: (amount) => <Text type="success" strong>{money(amount)}</Text>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 110,
      render: (_, record) => (
        <Tag color={STATUS_COLORS[record.status]}>
          {STATUS_LABELS[record.status] || record.status}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <Button
              size="small"
              danger
              onClick={(e) => {
                e.stopPropagation();
                handleCancelOrder(record.id, record.status);
              }}
            >
              Hủy
            </Button>
          )}
          <Button
            size="small"
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Navigate to order detail:', record.id);
              navigate(`/orders/${record.id}`);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Title level={3} style={{ margin: 0 }}>
              Lịch sử mua hàng
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Xem và quản lý tất cả các đơn hàng của bạn
            </Text>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space>
              <Select
                placeholder="Lọc trạng thái"
                allowClear
                style={{ width: 160 }}
                value={filterStatus || undefined}
                onChange={(val) => {
                  setFilterStatus(val || '');
                  setPagination({ current: 1, pageSize: 10, total: 0 });
                }}
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <Option key={key} value={key}>{label}</Option>
                ))}
              </Select>
              <Button
                type="primary"
                onClick={() => fetchOrders(pagination.current - 1, pagination.pageSize, filterStatus)}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchOrders(page - 1, pageSize, filterStatus),
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`
          }}
          style={{ borderRadius: 8, overflow: 'hidden' }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default OrderHistoryPage;

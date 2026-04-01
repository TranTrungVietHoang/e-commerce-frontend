import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, message, Select, Button, Modal, Alert, Space, Row, Col } from 'antd';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

// Trạng thái đơn hàng theo thứ tự
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

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

/**
 * Giao diện Quản lý Đơn Hàng cho Seller
 */
const OrderManagePage = () => {
  const { user } = useAuth();
  const shopId = user?.shopId;
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = async (page = 0, size = 10, status = '') => {
    setLoading(true);
    try {
      const data = await orderService.getShopOrders(shopId, page, size);
      let filteredOrders = data.content || data;
      
      // Lọc theo status nếu có
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }
      
      setOrders(filteredOrders);
      setPagination({ current: page + 1, pageSize: size, total: filteredOrders.length });
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng: ' + (error.message || 'Lỗi server'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchOrders(0, pagination.pageSize, filterStatus);
    }
  }, [shopId, filterStatus]);

  const handleUpdateStatus = (orderId, oldStatus, newStatus) => {
    if (oldStatus === newStatus) return;
    
    Modal.confirm({
      title: 'Cập nhật trạng thái đơn hàng',
      content: `Chuyển trạng thái đơn hàng #${orderId} từ ${STATUS_LABELS[oldStatus]} sang ${STATUS_LABELS[newStatus]}?`,
      okText: 'Cập nhật',
      cancelText: 'Hủy',
      onOk: async () => {
        setIsUpdating(true);
        try {
          await orderService.updateOrderStatus(orderId, newStatus);
          message.success('Cập nhật trạng thái thành công');
          fetchOrders(pagination.current - 1, pagination.pageSize, filterStatus);
        } catch (err) {
          message.error('Lỗi cập nhật: ' + (err.message || 'Có lỗi xảy ra'));
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  const statusOptions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SHIPPING', 'CANCELLED'],
    'SHIPPING': ['DELIVERED'],
    'DELIVERED': [],
    'CANCELLED': []
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      width: 90,
      render: (id) => <Text strong>#{id}</Text>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 140,
      render: (date) => new Date(date).toLocaleString('vi-VN')
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
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_, record) => {
        const nextStatuses = statusOptions[record.status] || [];
        
        if (nextStatuses.length === 0) {
          return <Text type="secondary">-</Text>;
        }
        
        return (
          <Space size="small" wrap>
            {nextStatuses.map(st => (
              <Button
                key={st}
                size="small"
                onClick={() => handleUpdateStatus(record.id, record.status, st)}
                loading={isUpdating}
              >
                {STATUS_LABELS[st]}
              </Button>
            ))}
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {!shopId && (
          <Alert
            message="Lỗi"
            description="Không tìm thấy cửa hàng của bạn. Vui lòng liên hệ hỗ trợ."
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        {shopId && (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12}>
                <Title level={3} style={{ margin: 0 }}>
                  Quản lý Đơn hàng
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Theo dõi và cập nhật trạng thái đơn hàng
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
                    {ORDER_STATUSES.map(st => (
                      <Option key={st} value={st}>{STATUS_LABELS[st]}</Option>
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
              scroll={{ x: 800 }}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default OrderManagePage;

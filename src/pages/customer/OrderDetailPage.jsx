import React, { useState, useEffect } from 'react';
import { Card, Divider, Space, Button, Tag, Typography, message, Row, Col, Table, Empty, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

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

const OrderDetailPage = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderDetail(orderId);
        console.log('Order Detail Response:', response);
        if (response) {
          setOrder(response);
        } else {
          message.error('Không tìm thấy đơn hàng');
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error loading order:', error);
        message.error('Lỗi tải dữ liệu: ' + error.message);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId, navigate]);

  const handleCancelOrder = () => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
    if (!confirmed) return;

    setCanceling(true);
    orderService.cancelOrder(orderId)
      .then(() => {
        message.success('Hủy đơn hàng thành công');
        setOrder({ ...order, status: 'CANCELLED' });
      })
      .catch(err => {
        message.error('Lỗi hủy đơn: ' + err.message);
      })
      .finally(() => {
        setCanceling(false);
      });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description="Không tìm thấy đơn hàng" />
        </Card>
      </div>
    );
  }

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text>{name}</Text>
    },
    {
      title: 'Biến thể',
      dataIndex: 'variantName',
      key: 'variantName',
      render: (name) => <Text type="secondary">{name || 'N/A'}</Text>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (qty) => <Text>{qty}</Text>
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (price) => <Text>{money(price)}</Text>
    },
    {
      title: 'Tổng',
      key: 'total',
      width: 130,
      render: (_, record) => <Text strong>{money(record.unitPrice * record.quantity)}</Text>
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        {/* Header */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Title level={3} style={{ margin: 0 }}>
              Chi tiết đơn hàng
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Mã đơn: <Text strong>#{orderId}</Text>
            </Text>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space>
              <Tag 
                color={STATUS_COLORS[order.status]} 
                style={{ padding: '6px 12px', fontSize: 13 }}
              >
                {STATUS_LABELS[order.status] || order.status}
              </Tag>
              {order.status === 'PENDING' && (
                <Button 
                  danger 
                  loading={canceling}
                  onClick={handleCancelOrder}
                >
                  Hủy đơn
                </Button>
              )}
              <Button onClick={() => navigate('/orders')}>
                Quay lại
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Order Information */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Card size="small" title="Thông tin đơn hàng" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div>
                  <Text type="secondary">Ngày đặt:</Text>
                  <br />
                  <Text strong>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
                </div>
                <div>
                  <Text type="secondary">Cửa hàng:</Text>
                  <br />
                  <Text strong>{order.shopName || 'N/A'}</Text>
                </div>
                <div>
                  <Text type="secondary">Phương thức thanh toán:</Text>
                  <br />
                  <Text strong>
                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận' : 'Chuyển khoản'}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title="Thông tin giao hàng" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div>
                  <Text type="secondary">Người nhận:</Text>
                  <br />
                  <Text strong>{order.recipientName}</Text>
                </div>
                <div>
                  <Text type="secondary">Số điện thoại:</Text>
                  <br />
                  <Text strong>{order.recipientPhone}</Text>
                </div>
                <div>
                  <Text type="secondary">Địa chỉ:</Text>
                  <br />
                  <Text>{order.shippingAddress}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Order Items */}
        <Card 
          size="small" 
          title="Sản phẩm đã đặt" 
          bordered={false}
          style={{ marginBottom: 24 }}
        >
          <Table
            columns={columns}
            dataSource={order.orderItems || order.items || []}
            rowKey={(_, index) => index}
            pagination={false}
            size="small"
          />
        </Card>

        {/* Price Summary */}
        <Card size="small" title="Tóm tắt đơn hàng" bordered={false}>
          <Space direction="vertical" style={{ width: '100%' }} size={0}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
              <Text>Tiền hàng:</Text>
              <Text>{money(order.subtotal || order.totalAmount || 0)}</Text>
            </div>
            
            {(order.discountAmount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
                <Text type="danger">
                  Giảm giá {order.voucherCode && <Tag color="red" style={{ marginLeft: 8 }}>{order.voucherCode}</Tag>}:
                </Text>
                <Text type="danger">-{money(order.discountAmount)}</Text>
              </div>
            )}

            {(order.pointsUsed || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
                <Text type="danger">Điểm thưởng:</Text>
                <Text type="danger">-{money(order.pointsUsed)}</Text>
              </div>
            )}

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
              <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                {money(order.totalAmount || 0)}
              </Text>
            </div>
          </Space>
        </Card>
      </Card>
    </div>
  );
};

export default OrderDetailPage;

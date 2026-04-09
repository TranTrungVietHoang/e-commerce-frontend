import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Button, Spin, Result, Form, Input, message, Divider, Space, Alert, Row, Col, Statistic } from 'antd';
import { EditOutlined, ShopOutlined, InfoCircleOutlined, RiseOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import shopService from '../../services/shopService';
import orderService from '../../services/orderService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SellerDashboard = () => {
  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState({ todayRevenue: 0, todayOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const shopData = await shopService.getMyShop();
      setShop(shopData);
      form.setFieldsValue({
        name: shopData.name,
        description: shopData.description,
        logoUrl: shopData.logoUrl,
        bannerUrl: shopData.bannerUrl,
      });

      // Fetch thêm thống kê nếu shop đã được duyệt
      if (shopData.status === 'APPROVED') {
        try {
          const todayData = await orderService.getTodayRevenue(shopData.id);
          setStats({
            todayRevenue: todayData?.totalRevenue || 0,
            todayOrders: todayData?.totalOrders || 0
          });
        } catch (err) {
          console.error("Lỗi lấy thống kê nhanh:", err);
        }
      }
    } catch (error) {
      if (error?.code !== 404 && error?.code !== 'SHOP_NOT_FOUND') {
        message.warning('Bạn chưa có gian hàng nào.');
      }
      setShop(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (values) => {
    try {
      setSubmitLoading(true);
      const updated = await shopService.updateShop(values);
      setShop(updated);
      setEditing(false);
      message.success('Cập nhật thông tin gian hàng thành công!');
    } catch (error) {
      message.error(error?.message || 'Lỗi cập nhật gian hàng');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  // Nếu chưa có shop, dẫn đến trang đăng ký
  if (!shop) {
    return (
      <Result
        icon={<ShopOutlined />}
        title="Bạn chưa có gian hàng nào rên hệ thống"
        subTitle="Đăng ký ngay để bắt đầu bán hàng và tiếp cận hàng ngàn khách hàng tiềm năng!"
        extra={<Button type="primary" onClick={() => navigate('/seller/shop/register')}>Đăng ký gian hàng</Button>}
      />
    );
  }

  // Trạng thái chờ duyệt
  if (shop.status === 'PENDING') {
    return (
      <Card style={{ margin: 24, borderRadius: 12, textAlign: 'center' }}>
        <InfoCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
        <Title level={4}>Gian hàng đang chờ duyệt</Title>
        <Text type="secondary">
          Yêu cầu đăng ký gian hàng <b>{shop.name}</b> của bạn đã được tiếp nhận và đang trong quá trình xét duyệt của Quản trị viên. Vui lòng quay lại sau!
        </Text>
      </Card>
    );
  }

  // Nếu đã bị reject hoặc bị khóa
  if (shop.status !== 'APPROVED' && shop.status !== 'PENDING') {
     return (
        <Card style={{ margin: 24, borderRadius: 12, textAlign: 'center' }}>
           <Result 
              status={shop.status === 'LOCKED' ? "warning" : "error"}
              title={shop.status === 'LOCKED' ? "Gian hàng đã bị tạm khóa" : "Yêu cầu đăng ký bị từ chối"}
              subTitle={
                <Space direction="vertical">
                  <Text type="secondary">Trạng thái hiện tại: <b>{shop.status}</b></Text>
                  {shop.rejectionReason && (
                    <Alert 
                      type={shop.status === 'LOCKED' ? "warning" : "error"}
                      message={<Text strong>Lý do từ hệ thống:</Text>}
                      description={shop.rejectionReason}
                      showIcon
                      style={{ marginTop: 16, textAlign: 'left', borderRadius: 8 }}
                    />
                  )}
                  {shop.status === 'LOCKED' ? (
                    <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
                      Vui lòng liên hệ với Quản trị viên để được hỗ trợ mở lại gian hàng.
                    </Text>
                  ) : (
                    <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/seller/shop/register')}>
                       Chỉnh sửa và gửi lại yêu cầu
                    </Button>
                  )}
                </Space>
              }
           />
        </Card>
     )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard Người bán</Title>
      
      {/* Quick Stats Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.todayRevenue}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<RiseOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Đơn hàng mới"
              value={stats.todayOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8 rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Trạng thái Shop"
              value={shop.status}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: shop.status === 'APPROVED' ? '#52c41a' : '#faad14', fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={<><ShopOutlined /> Tổng quan Gian hàng</>}
        extra={!editing && <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>Chỉnh sửa</Button>}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        {!editing ? (
          <Descriptions bordered column={{ md: 2, sm: 1, xs: 1 }} labelStyle={{ fontWeight: 600, width: 200 }}>
            <Descriptions.Item label="Tên Gian Hàng" span={2}>
              <b>{shop.name}</b> <Tag color="success" style={{ marginLeft: 8 }}>{shop.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô Tả" span={2}>{shop.description || <i>Không có mô tả</i>}</Descriptions.Item>
             <Descriptions.Item label="Đánh giá">{shop.rating || 0} / 5 ⭐️</Descriptions.Item>
             <Descriptions.Item label="Ngày tạo">{new Date(shop.createdAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Logo">
              {shop.logoUrl ? <img src={shop.logoUrl} alt="Logo" style={{ maxHeight: 60, objectFit: 'contain' }} /> : <i>Chưa có</i>}
            </Descriptions.Item>
            <Descriptions.Item label="Banner">
              {shop.bannerUrl ? <img src={shop.bannerUrl} alt="Banner" style={{ maxHeight: 60, objectFit: 'contain' }} /> : <i>Chưa có</i>}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
            <Form.Item name="name" label="Tên gian hàng" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name="logoUrl" label="URL Logo" rules={[{ type: 'url' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="bannerUrl" label="URL Banner" rules={[{ type: 'url' }]}>
              <Input />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitLoading}>Lưu thay đổi</Button>
              <Button onClick={() => { setEditing(false); form.resetFields(); }}>Hủy</Button>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default SellerDashboard;

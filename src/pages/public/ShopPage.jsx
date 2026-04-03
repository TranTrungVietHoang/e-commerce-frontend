import React, { useState, useEffect } from 'react';
import { Layout, Card, Avatar, Typography, Space, Tag, Button, Row, Col, List, Spin, Result } from 'antd';
import { ShopOutlined, CheckCircleOutlined, StarOutlined, AppstoreOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ShopPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Mock simulation
    setTimeout(() => {
      setShop({
        id: shopId,
        name: 'Cửa hàng Phụ kiện Công nghệ',
        description: 'Chuyên cung cấp cáp sạc, tai nghe, pin dự phòng chính hãng.',
        logoUrl: 'https://via.placeholder.com/100',
        bannerUrl: 'https://via.placeholder.com/1200x300',
        rating: 4.8,
        totalProducts: 120,
        createdAt: '2023-01-15'
      });
      setProducts([
        { id: 101, name: 'Cáp sạc Type-C 20W', price: 99000, category: 'Phụ kiện', image: 'https://via.placeholder.com/200' },
        { id: 102, name: 'Tai nghe Bluetooth Pro', price: 599000, category: 'Âm thanh', image: 'https://via.placeholder.com/200' },
        { id: 103, name: 'Pin dự phòng 10.000mAh', price: 350000, category: 'Phụ kiện', image: 'https://via.placeholder.com/200' },
      ]);
      setLoading(false);
    }, 800);
  }, [shopId]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!shop) return <Result status="404" title="Không tìm thấy gian hàng" extra={<Button onClick={() => navigate('/')}>Quay lại trang chủ</Button>} />;

  return (
    <Layout style={{ background: '#f5f6fa' }}>
      {/* Banner */}
      <div style={{ width: '100%', height: 250, backgroundImage: `url(${shop.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)' }} />
      </div>

      <Content style={{ maxWidth: 1200, margin: '-60px auto 0', padding: '0 16px', zIndex: 1, width: '100%' }}>
        {/* Shop Info Card */}
        <Card style={{ borderRadius: 12, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
              <Avatar size={100} shape="square" src={shop.logoUrl} icon={<ShopOutlined />} style={{ border: '4px solid #fff' }} />
            </Col>
            <Col xs={24} sm={18} md={12}>
              <Space direction="vertical" size={0}>
                <Title level={3} style={{ margin: 0 }}>{shop.name} <CheckCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} /></Title>
                <Paragraph type="secondary">{shop.description}</Paragraph>
                <Space>
                  <Tag color="gold" icon={<StarOutlined />}>{shop.rating} Đánh giá</Tag>
                  <Tag color="blue" icon={<AppstoreOutlined />}>{shop.totalProducts} Sản phẩm</Tag>
                </Space>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />}>Theo dõi</Button>
                <Button icon={<ShoppingOutlined />}>Chat ngay</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Product Grid */}
        <Title level={4}><ShoppingOutlined /> Tất cả sản phẩm</Title>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
          dataSource={products}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                cover={<img alt={item.name} src={item.image} />}
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <Card.Meta 
                  title={item.name} 
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">{item.category}</Text>
                      <Text type="danger" strong>{item.price.toLocaleString('vi-VN')} đ</Text>
                    </Space>
                  } 
                />
              </Card>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

// Cần export component Plus cho Button Theo dõi vì chưa import từ @ant-design/icons
import { PlusOutlined } from '@ant-design/icons';

export default ShopPage;

import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Empty, Row, Space, Tag, Typography } from 'antd';
import productService from '../../services/productService';
import useCart from '../../hooks/useCart';

const { Title, Text } = Typography;

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const getCountdown = (endAt) => {
  if (!endAt) return null;
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return 'Da ket thuc';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [now, setNow] = useState(Date.now());
  const { addToCart, loading } = useCart();

  useEffect(() => {
    productService.getPublicProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const productsWithCountdown = useMemo(
    () => products.map((product) => ({ ...product, countdown: getCountdown(product.flashSaleEndAt) })),
    [products, now]
  );

  if (!productsWithCountdown.length) {
    return <Empty description="Chua co san pham" style={{ marginTop: 80 }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>Flash Sale va Gio Hang</Title>
          <Text type="secondary">Gia flash sale duoc uu tien tu dong khi san pham dang trong khung gio su kien.</Text>
        </div>
        <Row gutter={[16, 16]}>
          {productsWithCountdown.map((product) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
              <Badge.Ribbon text={product.flashSaleActive ? 'Flash Sale' : 'San pham'} color={product.flashSaleActive ? 'red' : 'blue'}>
                <Card
                  cover={
                    <div style={{ height: 220, overflow: 'hidden', background: '#fafafa' }}>
                      <img
                        src={product.primaryImageUrl || 'https://via.placeholder.com/400x220?text=No+Image'}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  }
                >
                  <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <Title level={5} style={{ margin: 0 }}>{product.name}</Title>
                    <Tag>{product.categoryName}</Tag>
                    <div>
                      <Text strong style={{ fontSize: 18, color: '#cf1322' }}>{formatCurrency(product.effectivePrice || product.basePrice)}</Text>
                      {product.flashSaleActive && (
                        <div>
                          <Text delete type="secondary">{formatCurrency(product.basePrice)}</Text>
                        </div>
                      )}
                    </div>
                    {product.flashSaleActive && (
                      <Card size="small" styles={{ body: { padding: 12, background: '#fff1f0' } }}>
                        <Text strong>Con lai: {product.countdown}</Text>
                      </Card>
                    )}
                    <Text type="secondary">Ton kho: {product.stockQuantity}</Text>
                    <Button
                      type="primary"
                      block
                      disabled={product.stockQuantity <= 0}
                      loading={loading}
                      onClick={() => addToCart({ productId: product.id, quantity: 1 })}
                    >
                      Them vao gio
                    </Button>
                  </Space>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </Space>
    </div>
  );
};

export default HomePage;

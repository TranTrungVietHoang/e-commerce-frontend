import React, { useEffect, useMemo, useState } from 'react';
import { Carousel, Row, Col, Typography, Divider, Spin, Empty, Badge, Button, Card, Space, Tag } from 'antd';
import CategoryMenu from '../../components/common/CategoryMenu';
import ProductCard from '../../components/product/ProductCard';
import homeService from '../../services/homeService';
import productService from '../../services/productService';
import useCart from '../../hooks/useCart';

const { Title, Text } = Typography;

const bannerStyle = {
  width: '100%',
  height: 320,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  color: '#fff',
  textAlign: 'center',
};

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
];

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
  const [data, setData] = useState(null);
  const [loadingHome, setLoadingHome] = useState(true);
  
  const [products, setProducts] = useState([]);
  const [now, setNow] = useState(Date.now());
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    homeService.getHomeData()
      .then(res => {
        // API interceptor already unwraps to return the result directly
        console.log('DEBUG: Home Data:', res);
        setData(res || null);
      })
      .catch(err => {
        console.error('DEBUG: API Error:', err);
      })
      .finally(() => setLoadingHome(false));
  }, []);

  useEffect(() => {
    productService.getPublicProducts()
      .then(res => {
        // API interceptor already unwraps - res is already the array of products
        console.log('DEBUG: Public Products:', res);
        const _products = Array.isArray(res) ? res : [];
        setProducts(_products);
      })
      .catch(err => {
        console.error('DEBUG: Error fetching products:', err);
        setProducts([]);
      });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const productsWithCountdown = useMemo(
    () => products.map((product) => ({ ...product, countdown: getCountdown(product.flashSaleEndAt) })),
    [products, now]
  );

  if (loadingHome) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;

  const { banners = [], newestProducts = [], bestSellingProducts = [] } = data || {};

  return (
    <div>
      {/* Banner Carousel */}
      <Carousel autoplay effect="fade">
        {banners.map((b, i) => (
          <div key={i}>
            <div style={{ ...bannerStyle, background: BANNER_GRADIENTS[i % BANNER_GRADIENTS.length] }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{b.title}</h1>
              <p style={{ fontSize: 18, marginTop: 12, opacity: 0.9 }}>{b.subtitle}</p>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Category Menu */}
      <div style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <CategoryMenu />
      </div>

      <div style={{ padding: '24px 48px' }}>
        {/* Flash Sale Section */}
        {productsWithCountdown.length > 0 && (
          <Space direction="vertical" size={24} style={{ width: '100%', marginBottom: 40 }}>
            <div>
              <Title level={2} style={{ marginBottom: 8 }}>Flash Sale va Gio Hang</Title>
              <Text type="secondary">Gia flash sale duoc uu tien tu dong khi san pham dang trong khung gio su kien.</Text>
            </div>
            <Row gutter={[16, 20]}>
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
                          loading={cartLoading}
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
        )}

        {/* Newest Products Section */}
        <Title level={3} style={{ margin: '24px 0 16px' }}>🆕 Sản phẩm mới nhất</Title>
        {newestProducts.length === 0
          ? <Empty description="Chưa có sản phẩm" />
          : <Row gutter={[16, 20]}>{newestProducts.map(p => <Col key={p.id} xs={24} sm={12} md={8} lg={6}><ProductCard product={p} /></Col>)}</Row>
        }

        <Divider style={{ margin: '40px 0 8px' }} />

        {/* Best Selling Products Section */}
        <Title level={3} style={{ margin: '24px 0 16px' }}>🔥 Bán chạy nhất</Title>
        {bestSellingProducts.length === 0
          ? <Empty description="Chưa có sản phẩm" />
          : <Row gutter={[16, 20]}>{bestSellingProducts.map(p => <Col key={p.id} xs={24} sm={12} md={8} lg={6}><ProductCard product={p} /></Col>)}</Row>
        }
      </div>
    </div>
  );
};

export default HomePage;

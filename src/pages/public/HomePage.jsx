import React, { useEffect, useState } from 'react';
import { Carousel, Row, Col, Typography, Divider, Spin, Empty } from 'antd';
import CategoryMenu from '../../components/common/CategoryMenu';
import ProductCard from '../../components/product/ProductCard';
import homeService from '../../services/homeService';

const { Title } = Typography;

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

/**
 * HomePage – Trang chủ: Banner + CategoryMenu + Sản phẩm mới + Bán chạy nhất.
 */
const HomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homeService.getHomeData()
      .then(res => setData(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;

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
        <Title level={3} style={{ margin: '24px 0 16px' }}>🆕 Sản phẩm mới nhất</Title>
        {newestProducts.length === 0
          ? <Empty description="Chưa có sản phẩm" />
          : <Row gutter={[16, 20]}>{newestProducts.map(p => <Col key={p.id} xs={24} sm={12} md={8} lg={6}><ProductCard product={p} /></Col>)}</Row>
        }

        <Divider style={{ margin: '40px 0 8px' }} />

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

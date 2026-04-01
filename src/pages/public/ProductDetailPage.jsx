import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Rate, Button, Tag, Divider, Spin, Empty, Breadcrumb, Card } from 'antd';
import { ShoppingCartOutlined, HomeOutlined, ShopOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ProductGallery from '../../components/product/ProductGallery';
import VariantSelector from '../../components/product/VariantSelector';
import productService from '../../services/productService';

const { Title, Text, Paragraph } = Typography;

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/**
 * ProductDetailPage (PDP) – Chi tiết sản phẩm.
 * Hiển thị: Gallery ảnh | Tiêu đề, giá, đánh giá | VariantSelector | Reviews.
 */
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    productService.getProductById(id)
      .then(res => {
        setProduct(res || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 100 }}><Spin size="large" /></div>;
  if (!product) return <Empty description="Không tìm thấy sản phẩm" style={{ paddingTop: 80 }} />;

  const displayPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const hasVariants  = product.variants && product.variants.length > 0;

  return (
    <div style={{ padding: '24px 48px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}><HomeOutlined /> Trang chủ</span> },
          { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate('/search')}>{product.categoryName || 'Danh mục'}</span> },
          { title: product.name },
        ]}
      />

      <Row gutter={40}>
        {/* Cột trái: Gallery */}
        <Col xs={24} md={12}>
          <ProductGallery images={product.images || []} />
        </Col>

        {/* Cột phải: Thông tin sản phẩm */}
        <Col xs={24} md={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {product.categoryName && <Tag color="blue">{product.categoryName}</Tag>}
            {product.status === 'ACTIVE' ? <Tag color="green">Còn hàng</Tag> : <Tag color="red">Hết hàng</Tag>}
          </div>

          <Title level={2} style={{ margin: '0 0 12px', lineHeight: 1.3 }}>{product.name}</Title>

          {/* Rating và lượng bán */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Rate disabled value={Math.round(product.rating || 0)} />
            <Text type="secondary">{product.rating?.toFixed(1) || '0'} sao</Text>
            <Divider type="vertical" />
            <Text type="secondary">Đã bán: {product.soldCount?.toLocaleString?.() || 0}</Text>
          </div>

          {/* Giá */}
          <div style={{
            background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)',
            borderRadius: 12, padding: '16px 20px', marginBottom: 20,
            border: '1px solid #ffebe6',
          }}>
            <Text style={{ fontSize: 32, fontWeight: 800, color: '#f5222d' }}>
              {formatPrice(displayPrice)}
            </Text>
            {hasVariants && !selectedVariant && (
              <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
                * Chọn phân loại để xem giá chính xác
              </Text>
            )}
          </div>

          {/* Shop info */}
          {product.shopName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <ShopOutlined style={{ color: '#1677ff' }} />
              <Text>Gian hàng: <Text strong>{product.shopName}</Text></Text>
            </div>
          )}

          {/* Variant Selector */}
          {hasVariants && (
            <VariantSelector
              variants={product.variants}
              onVariantSelect={setSelectedVariant}
            />
          )}

          {/* Nút thêm vào giỏ (placeholder cho Member 5) */}
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            style={{ width: '100%', height: 52, borderRadius: 12, fontSize: 16, fontWeight: 600, marginTop: 24 }}
            disabled={hasVariants && !selectedVariant}
          >
            {hasVariants && !selectedVariant ? 'Vui lòng chọn phân loại' : 'Thêm vào giỏ hàng'}
          </Button>
        </Col>
      </Row>

      {/* Mô tả sản phẩm */}
      <Divider style={{ margin: '40px 0 20px' }} />
      <Title level={4}>📋 Mô tả sản phẩm</Title>
      <Card style={{ borderRadius: 12 }}>
        <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
          {product.description || 'Chưa có mô tả.'}
        </Paragraph>
      </Card>

      {/* Danh sách đánh giá */}
      {product.reviews && product.reviews.length > 0 && (
        <>
          <Divider style={{ margin: '40px 0 20px' }} />
          <Title level={4}>⭐ Đánh giá từ khách hàng ({product.reviews.length})</Title>
          {product.reviews.map(rv => (
            <Card key={rv.id} style={{ marginBottom: 12, borderRadius: 12 }}>
              <Rate disabled defaultValue={rv.rating} style={{ fontSize: 14 }} />
              <Text style={{ display: 'block', marginTop: 6 }}>{rv.comment}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</Text>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default ProductDetailPage;

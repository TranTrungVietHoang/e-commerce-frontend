import React, { useEffect, useState, useCallback } from 'react';
import {
  Row, Col, Typography, Rate, Button, Tag, Divider, Spin, Empty,
  Breadcrumb, Card, Form, Input, message, Progress, Avatar,
} from 'antd';
import {
  ShoppingCartOutlined, HomeOutlined, ShopOutlined,
  HeartFilled, HeartOutlined, UserOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ProductGallery from '../../components/product/ProductGallery';
import VariantSelector from '../../components/product/VariantSelector';
import productService from '../../services/productService';
import wishlistService from '../../services/wishlistService';
import reviewService from '../../services/reviewService';
import orderService from '../../services/orderService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// ── Review Section ────────────────────────────────────────────────────────────
const ReviewSection = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchReviews = useCallback(async () => {
    try {
      const data = await reviewService.getProductReviews(productId);
      setReviews(Array.isArray(data) ? data : (data?.content || []));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Kiểm tra quyền đánh giá (đã mua & nhận hàng chưa)
  const [purchaseInfo, setPurchaseInfo] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!isAuthenticated) return;
      setVerifying(true);
      try {
        const res = await orderService.verifyPurchase(productId);
        // res.result = { canReview: true/false, orderItemId: number }
        setPurchaseInfo(res?.result || res || null);
      } catch (e) {
        console.error('Verify purchase error:', e);
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [productId, isAuthenticated]);

  const onSubmit = async (values) => {
    if (!purchaseInfo?.canReview) {
      message.error('Bạn cần mua và nhận hàng thành công để đánh giá sản phẩm này!');
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.submitReview({
        orderItemId: purchaseInfo.orderItemId,
        rating: values.rating,
        comment: values.comment,
      });
      message.success('Đánh giá của bạn đã được gửi thành công! ⭐');
      form.resetFields();
      fetchReviews();
    } catch (err) {
      message.error(err?.message || 'Gửi đánh giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Tính phân phối sao
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div>
      <Divider style={{ margin: '40px 0 24px' }} />
      <Title level={4}>⭐ Đánh giá từ khách hàng</Title>

      {/* Tổng quan đánh giá */}
      {reviews.length > 0 && (
        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <Row gutter={24} align="middle">
            <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 48, fontWeight: 800, color: '#faad14', display: 'block' }}>
                {avgRating.toFixed(1)}
              </Text>
              <Rate disabled value={Math.round(avgRating)} style={{ fontSize: 18 }} />
              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                {reviews.length} đánh giá
              </Text>
            </Col>
            <Col xs={24} sm={16}>
              {ratingDist.map(({ star, count }) => (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Rate disabled value={star} count={star} style={{ fontSize: 12, flexShrink: 0 }} />
                  <Progress
                    percent={reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0}
                    showInfo={false} strokeColor="#faad14"
                    style={{ flex: 1 }}
                  />
                  <Text type="secondary" style={{ width: 24, flexShrink: 0, fontSize: 12 }}>{count}</Text>
                </div>
              ))}
            </Col>
          </Row>
        </Card>
      )}

      {/* Form gửi đánh giá */}
      {isAuthenticated && (
        <Card
          title="✍️ Viết đánh giá của bạn"
          style={{ borderRadius: 12, marginBottom: 24, border: '1px solid #e6f4ff', background: '#fafcff' }}
        >
          {verifying ? (
            <div style={{ textAlign: 'center', padding: 20 }}><Spin tip="Đang kiểm tra quyền đánh giá..." /></div>
          ) : purchaseInfo?.canReview ? (
            <Form form={form} onFinish={onSubmit} layout="vertical">
              <Form.Item name="rating" label="Xếp hạng" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
                <Rate allowHalf />
              </Form.Item>
              <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}>
                <TextArea rows={3} placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." maxLength={500} showCount />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} size="large" block style={{ borderRadius: 8, height: 48, fontWeight: 600 }}>
                Gửi đánh giá ngay
              </Button>
            </Form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được giao thành công.
              </Text>
              <Button type="primary" ghost onClick={() => navigate('/search')}>
                Tiếp tục mua sắm ngay
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Danh sách reviews */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : reviews.length === 0 ? (
        <Empty description="Chưa có đánh giá nào. Hãy là người đầu tiên!" />
      ) : (
        reviews.map((rv) => (
          <Card key={rv.id} style={{ marginBottom: 12, borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Avatar icon={<UserOutlined />} style={{ background: '#1677ff', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>{rv.reviewerName || 'Người dùng'}</Text>
                  <Rate disabled value={rv.rating} style={{ fontSize: 13 }} />
                </div>
                <Text style={{ display: 'block', marginBottom: 4 }}>{rv.comment}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('vi-VN') : ''}
                </Text>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

// ── Main ProductDetailPage ────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    productService.getProductById(id)
      .then((res) => setProduct(res || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Check wishlist status bằng cách lấy danh sách và tìm productId
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    wishlistService.getWishlist()
      .then((data) => {
        // data là Page object, cần lấy .content
        const list = data?.content || data || [];
        const found = Array.isArray(list)
          ? list.some((item) => String(item.productId) === String(id))
          : false;
        setInWishlist(found);
      })
      .catch(() => {});
  }, [id, isAuthenticated]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(id);
        setInWishlist(false);
        message.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await wishlistService.addToWishlist(id);
        setInWishlist(true);
        message.success('Đã thêm vào danh sách yêu thích ❤️');
      }
    } catch {
      message.error('Thao tác thất bại');
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 100 }}><Spin size="large" /></div>;
  if (!product) return <Empty description="Không tìm thấy sản phẩm" style={{ paddingTop: 80 }} />;

  const displayPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const hasVariants = product.variants && product.variants.length > 0;

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

          {/* Rating */}
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
            <VariantSelector variants={product.variants} onVariantSelect={setSelectedVariant} />
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              style={{ flex: 1, height: 52, borderRadius: 12, fontSize: 16, fontWeight: 600 }}
              disabled={hasVariants && !selectedVariant}
            >
              {hasVariants && !selectedVariant ? 'Vui lòng chọn phân loại' : 'Thêm vào giỏ hàng'}
            </Button>

            {/* Nút Wishlist */}
            <Button
              size="large"
              icon={inWishlist ? <HeartFilled style={{ color: '#f5222d' }} /> : <HeartOutlined />}
              loading={wishlistLoading}
              onClick={toggleWishlist}
              style={{
                height: 52, width: 52, borderRadius: 12,
                borderColor: inWishlist ? '#f5222d' : undefined,
                background: inWishlist ? '#fff0f0' : undefined,
              }}
            />
          </div>
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

      {/* Review Section */}
      <ReviewSection productId={id} />
    </div>
  );
};

export default ProductDetailPage;

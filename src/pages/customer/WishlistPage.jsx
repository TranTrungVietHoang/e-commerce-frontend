import React, { useEffect, useState, useCallback } from 'react';
import {
  Row, Col, Card, Button, Empty, Spin, Typography, Tag, Image, message
} from 'antd';
import { HeartFilled, HeartOutlined, ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import wishlistService from '../../services/wishlistService';

const { Title, Text } = Typography;

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      // API trả về Page object → phải lấy .content
      const list = data?.content || data || [];
      setWishlist(Array.isArray(list) ? list : []);
    } catch {
      message.error('Không tải được danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
      message.success('Đã xóa khỏi danh sách yêu thích');
    } catch {
      message.error('Xóa thất bại, vui lòng thử lại');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 100 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <HeartFilled style={{ fontSize: 28, color: '#f5222d' }} />
        <Title level={3} style={{ margin: 0 }}>Sản phẩm yêu thích</Title>
        <Tag color="red">{wishlist.length} sản phẩm</Tag>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <HeartOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
          <Empty
            description="Bạn chưa có sản phẩm yêu thích nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/search')}>
              Khám phá sản phẩm
            </Button>
          </Empty>
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {wishlist.map((item) => {
            // Backend trả về productPrice (không có flashSale từ wishlist API)
            const price = item.productPrice || item.basePrice || 0;
            const imgUrl = item.productImageUrl || item.primaryImageUrl || 'https://via.placeholder.com/300';
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={item.productId}>
                <Card
                  hoverable
                  cover={
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <Image
                        src={imgUrl}
                        alt={item.productName}
                        height={220}
                        style={{ objectFit: 'cover', width: '100%' }}
                        preview={false}
                        onClick={() => navigate(`/products/${item.productId}`)}
                      />
                    </div>
                  }
                  bodyStyle={{ padding: '14px 16px' }}
                  style={{ borderRadius: 12, overflow: 'hidden' }}
                >
                  <Text
                    strong
                    style={{ fontSize: 14, display: 'block', marginBottom: 8, cursor: 'pointer',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onClick={() => navigate(`/products/${item.productId}`)}
                  >
                    {item.productName}
                  </Text>
                  <div style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: 800, color: '#f5222d' }}>
                      {formatPrice(price)}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="primary" icon={<ShoppingCartOutlined />} style={{ flex: 1, borderRadius: 8 }}
                      onClick={() => navigate(`/products/${item.productId}`)}>
                      Xem sản phẩm
                    </Button>
                    <Button danger icon={<DeleteOutlined />} loading={removing === item.productId}
                      onClick={() => handleRemove(item.productId)} style={{ borderRadius: 8 }} />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default WishlistPage;

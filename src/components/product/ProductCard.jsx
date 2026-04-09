import React, { useState } from 'react';
import { Card, Rate, Tag, Button, Space, message, InputNumber } from 'antd';
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import wishlistService from '../../services/wishlistService';

const { Meta } = Card;

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/**
 * ProductCard – Thẻ sản phẩm tái sử dụng trên trang chủ và trang tìm kiếm.
 * Hiển thị nút "Thêm vào giỏ" + "Yêu thích"
 */
const ProductCard = ({ product, showActions = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const availableStock = product?.stockQuantity ?? 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Ngăn click navigate trang chi tiết
    
    if (!user) {
      message.warning('Vui lòng đăng nhập trước');
      return;
    }

    if (quantity <= 0 || quantity > availableStock) {
      message.error(`Số lượng không hợp lệ (Kho còn: ${availableStock})`);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart({
        productId: product.id,
        variantId: null,
        quantity: quantity,
      });
      message.success('Đã thêm vào giỏ hàng');
      setQuantity(1);
    } catch (error) {
      message.error(error.message || 'Lỗi thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      message.warning('Vui lòng đăng nhập trước');
      return;
    }

    try {
      setWishlistLoading(true);
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        message.success('Đã xóa khỏi yêu thích');
      } else {
        await wishlistService.addToWishlist(product.id);
        message.success('Đã thêm vào yêu thích');
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      message.error(error.message || 'Lỗi cập nhật yêu thích');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Card
      hoverable
      onClick={() => navigate(`/products/${product.id}`)}
      cover={
        <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
          <img
            alt={product.name}
            src={product.primaryImageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      }
      bodyStyle={{ padding: '12px' }}
      style={{ borderRadius: 12, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', height: showActions ? 'auto' : undefined }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <Meta
        title={
          <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {product.name}
          </span>
        }
        description={
          <div>
            <div style={{ color: '#f5222d', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              {formatPrice(product.basePrice || product.effectivePrice)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Rate disabled defaultValue={Math.round(product.rating || 0)} style={{ fontSize: 11 }} />
              <span style={{ fontSize: 11, color: '#888' }}>({product.soldCount || 0} đã bán)</span>
            </div>
            {product.categoryName && (
              <Tag color="blue" style={{ marginTop: 6, fontSize: 11 }}>{product.categoryName}</Tag>
            )}

            {/* Hiển thị stock */}
            <div style={{ fontSize: 11, color: availableStock > 0 ? '#52c41a' : '#ff4d4f', marginTop: 8 }}>
              {availableStock > 0 ? `Còn: ${availableStock}` : 'Hết hàng'}
            </div>

            {/* Nút hành động - chỉ hiển thị khi showActions = true */}
            {showActions && (
              <div style={{ marginTop: 12 }}>
                <Space size="small" style={{ width: '100%', gap: '4px' }}>
                  <InputNumber
                    min={1}
                    max={availableStock}
                    value={quantity}
                    onChange={setQuantity}
                    size="small"
                    style={{ width: '50px' }}
                    disabled={availableStock === 0 || addingToCart}
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon={<ShoppingCartOutlined />}
                    loading={addingToCart}
                    onClick={handleAddToCart}
                    disabled={availableStock === 0}
                    style={{ flex: 1, fontSize: 12 }}
                  >
                    Giỏ
                  </Button>
                  <Button
                    size="small"
                    icon={<HeartOutlined />}
                    loading={wishlistLoading}
                    onClick={handleAddToWishlist}
                    style={{ 
                      color: isInWishlist ? '#ff4d4f' : 'inherit',
                      borderColor: isInWishlist ? '#ff4d4f' : 'inherit',
                    }}
                  />
                </Space>
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default ProductCard;

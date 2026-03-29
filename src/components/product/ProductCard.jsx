import React from 'react';
import { Card, Rate, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/**
 * ProductCard – Thẻ sản phẩm tái sử dụng trên trang chủ và trang tìm kiếm.
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();

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
      style={{ borderRadius: 12, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
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
              {formatPrice(product.basePrice)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Rate disabled defaultValue={Math.round(product.rating || 0)} style={{ fontSize: 11 }} />
              <span style={{ fontSize: 11, color: '#888' }}>({product.soldCount || 0} đã bán)</span>
            </div>
            {product.categoryName && (
              <Tag color="blue" style={{ marginTop: 6, fontSize: 11 }}>{product.categoryName}</Tag>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default ProductCard;

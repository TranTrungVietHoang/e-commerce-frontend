import React from 'react';
import { Card, Badge, Typography, Space } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const {
    id,
    name,
    basePrice,
    primaryImageUrl,
    stockQuantity,
    categoryName,
    rating,
    soldCount,
  } = product;

  const isOutOfStock = stockQuantity === 0;

  // Format tiền Việt Nam
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Badge.Ribbon
      text={isOutOfStock ? "Hết hàng" : null}
      color="volcano"
      hidden={!isOutOfStock}
    >
      <Card
        hoverable
        className="product-card-premium"
        cover={
          <div style={{ height: 200, overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
            <img
              alt={name}
              src={primaryImageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isOutOfStock ? 0.6 : 1,
              }}
            />
          </div>
        }
        actions={[
          <EyeOutlined key="view" onClick={() => navigate(`/products/${id}`)} />,
          <ShoppingCartOutlined key="cart" disabled={isOutOfStock} />,
        ]}
      >
        <div style={{ height: 100 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>{categoryName}</Text>
          <Title level={5} ellipsis={{ rows: 2 }} style={{ marginTop: '4px', marginBottom: '8px' }}>
            {name}
          </Title>
          <Space direction="vertical" size={0}>
            <Text type="danger" strong style={{ fontSize: '18px' }}>
              {formatPrice(basePrice)}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Đã bán: {soldCount || 0}
            </Text>
          </Space>
        </div>
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;

import React, { useState } from 'react';
import { Image } from 'antd';

/**
 * ProductGallery – Ảnh gallery cho trang chi tiết sản phẩm.
 * Cột trái: thumbnail nhỏ, cột phải: ảnh lớn.
 */
const ProductGallery = ({ images = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images.length) {
    return (
      <div style={{ width: '100%', height: 400, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
        <span style={{ color: '#aaa' }}>Không có ảnh</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {/* Thumbnail list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 72 }}>
        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            onClick={() => setSelectedIndex(idx)}
            style={{
              width: 72, height: 72, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              border: idx === selectedIndex ? '2px solid #1677ff' : '2px solid transparent',
              transition: 'border 0.2s',
            }}
          >
            <img src={img.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {/* Main image */}
      <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
        <Image
          src={images[selectedIndex]?.imageUrl}
          alt="product"
          style={{ width: '100%', height: 420, objectFit: 'contain', background: '#f9f9f9' }}
          preview={{ mask: 'Xem ảnh lớn' }}
        />
      </div>
    </div>
  );
};

export default ProductGallery;

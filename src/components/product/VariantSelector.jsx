import React, { useState, useMemo } from 'react';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/**
 * VariantSelector – Chọn biến thể (Màu sắc, Size...) và hiển thị giá tương ứng.
 * 
 * Variants có format: [ { id, attributes: "{\"Màu\":\"Đỏ\",\"Size\":\"L\"}", price, stock } ]
 * Component sẽ parse JSON attributes, gom nhóm theo key, hiển thị các nút chọn.
 * Khi chọn đủ tổ hợp → callback onVariantSelect(variant).
 */
const VariantSelector = ({ variants = [], onVariantSelect }) => {
  const [selected, setSelected] = useState({});

  // Parse attributes JSON và gom nhóm theo key
  const attributeMap = useMemo(() => {
    const map = {};
    variants.forEach(v => {
      try {
        const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
        Object.entries(attrs || {}).forEach(([key, val]) => {
          if (!map[key]) map[key] = new Set();
          map[key].add(val);
        });
      } catch (_) {}
    });
    // Chuyển Set -> Array
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]));
  }, [variants]);

  // Tìm variant khớp với lựa chọn hiện tại
  const matchedVariant = useMemo(() => {
    const keys = Object.keys(attributeMap);
    if (keys.length === 0 || Object.keys(selected).length < keys.length) return null;
    return variants.find(v => {
      try {
        const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
        return keys.every(k => attrs[k] === selected[k]);
      } catch (_) { return false; }
    }) || null;
  }, [selected, variants, attributeMap]);

  const handleSelect = (key, val) => {
    const newSelected = { ...selected, [key]: val };
    setSelected(newSelected);
    // Tìm matched variant với lựa chọn mới
    const keys = Object.keys(attributeMap);
    if (Object.keys(newSelected).length === keys.length) {
      const found = variants.find(v => {
        try {
          const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
          return keys.every(k => attrs[k] === newSelected[k]);
        } catch (_) { return false; }
      });
      if (found && onVariantSelect) onVariantSelect(found);
    }
  };

  if (!variants.length) return null;

  return (
    <div style={{ marginTop: 16 }}>
      {Object.entries(attributeMap).map(([key, values]) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>{key}:</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {values.map(val => {
              const isSelected = selected[key] === val;
              return (
                <Tag
                  key={val}
                  onClick={() => handleSelect(key, val)}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 14px',
                    fontSize: 13,
                    borderRadius: 8,
                    border: isSelected ? '2px solid #1677ff' : '1px solid #d9d9d9',
                    background: isSelected ? '#e6f4ff' : '#fff',
                    color: isSelected ? '#1677ff' : '#333',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.2s',
                    userSelect: 'none',
                  }}
                >
                  {val}
                </Tag>
              );
            })}
          </div>
        </div>
      ))}

      {/* Hiển thị giá và tồn kho của variant đang chọn */}
      {matchedVariant && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
          <Text style={{ fontSize: 20, color: '#f5222d', fontWeight: 700 }}>
            {formatPrice(matchedVariant.price)}
          </Text>
          <Text style={{ marginLeft: 12, color: '#52c41a' }}>
            Còn {matchedVariant.stock} sản phẩm
          </Text>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;

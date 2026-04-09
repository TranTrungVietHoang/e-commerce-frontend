import React, { useState, useMemo, useEffect } from 'react';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/**
 * VariantSelector – Chọn biến thể (Màu sắc, Size...) và hiển thị giá tương ứng.
 */
const VariantSelector = ({ variants = [], onVariantSelect }) => {
  const [selected, setSelected] = useState({});

  // 1. Dựng attributeMap: Gộp các key trùng nhau khi đưa về chữ thường (case-insensitive)
  const attributeMapping = useMemo(() => {
    const internalMap = {}; // lowercaseKey -> { displayKey, values: Set }
    variants.forEach(v => {
      try {
        const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
        Object.entries(attrs || {}).forEach(([key, val]) => {
          const k = (key || '').trim().normalize('NFC');
          const valStr = String(val).trim().normalize('NFC');
          if (k && valStr) {
            const lowK = k.toLowerCase();
            if (!internalMap[lowK]) {
              internalMap[lowK] = { displayKey: k, values: new Set() };
            }
            internalMap[lowK].values.add(valStr);
          }
        });
      } catch (_) {}
    });

    // Chuyển Set -> Array cho từng nhóm
    return Object.entries(internalMap).map(([lowK, data]) => ({
      lowKey: lowK,
      displayKey: data.displayKey,
      values: [...data.values]
    }));
  }, [variants]);

  // 2. Hàm tìm variant khớp với một tập lựa chọn
  const findMatch = (currentSelected, allVariants) => {
    // Không ép buộc phải chọn đủ số lượng thuộc tính nữa, 
    // miễn là có lựa chọn và biến thể khớp với *tất cả* các lựa chọn đó.
    const selectedKeys = Object.keys(currentSelected);
    if (selectedKeys.length === 0) return null;

    // Tìm tất cả các variants khớp
    const matchedVariants = allVariants.filter(v => {
      try {
        const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
        const normalizedAttrs = {};
        Object.entries(attrs || {}).forEach(([k, val]) => {
          const cleanK = (k || '').trim().normalize('NFC').toLowerCase();
          const cleanVal = String(val || '').trim().normalize('NFC').toLowerCase();
          normalizedAttrs[cleanK] = cleanVal;
        });
        
        // So khớp bắt buộc với TẤT CẢ các tiêu chí khách đã chọn
        return selectedKeys.every(lowKey => {
          const selectedVal = String(currentSelected[lowKey] || '').normalize('NFC').toLowerCase();
          return normalizedAttrs[lowKey] === selectedVal;
        });
      } catch (_) { return false; }
    });

    // Ưu tiên variant khớp hoàn toàn toàn bộ số lượng thuộc tính trước, 
    // Nếu không có, lấy variant đầu tiên khớp các tiêu chí đang chọn
    if (matchedVariants.length === 0) return null;
    
    // Tìm variant nào có độ dài thuộc tính bằng với độ dài attributeMapping
    const exactMatch = matchedVariants.find(v => {
        try {
            const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
            return Object.keys(attrs).length === attributeMapping.length;
        } catch (_) { return false; }
    });

    return exactMatch ? exactMatch : matchedVariants[0];
  };

  const handleSelect = (lowKey, val) => {
    const newSelected = { ...selected, [lowKey]: val };
    setSelected(newSelected);
    
    const matched = findMatch(newSelected, variants);
    if (onVariantSelect) onVariantSelect(matched);
  };

  // Reset khi variants thay đổi
  useEffect(() => {
    setSelected({});
    if (onVariantSelect) onVariantSelect(null);
  }, [variants]);

  if (!variants.length || attributeMapping.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      {attributeMapping.map((group) => (
        <div key={group.lowKey} style={{ marginBottom: 12 }}>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>{group.displayKey}:</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {group.values.map(val => {
              const isSelected = selected[group.lowKey] === val;
              return (
                <Tag
                  key={val}
                  onClick={() => handleSelect(group.lowKey, val)}
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
      {(() => {
        const matched = findMatch(selected, variants);
        if (!matched) return null;
        return (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
            <Text style={{ fontSize: 20, color: '#f5222d', fontWeight: 700 }}>
              {formatPrice(matched.price)}
            </Text>
            <Text style={{ marginLeft: 12, color: '#52c41a' }}>
              Còn {matched.stock} sản phẩm
            </Text>
          </div>
        );
      })()}
    </div>
  );
};

export default VariantSelector;

import React, { useEffect, useState } from 'react';
import { Menu } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

/**
 * CategoryMenu – Menu danh mục ngang.
 * Lấy danh sách danh mục từ /api/categories, click → navigate /search?categoryId=...
 */
const CategoryMenu = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productService.getCategories()
      .then(res => setCategories(res.data?.data || []))
      .catch(() => {});
  }, []);

  const items = [
    { key: 'all', icon: <AppstoreOutlined />, label: 'Tất cả' },
    ...categories.slice(0, 10).map(cat => ({
      key: String(cat.id),
      label: cat.name,
    })),
  ];

  const handleClick = ({ key }) => {
    if (key === 'all') navigate('/search');
    else navigate(`/search?categoryId=${key}`);
  };

  return (
    <Menu
      mode="horizontal"
      items={items}
      onClick={handleClick}
      style={{ borderBottom: 'none', fontWeight: 500 }}
      overflowedIndicator={null}
    />
  );
};

export default CategoryMenu;

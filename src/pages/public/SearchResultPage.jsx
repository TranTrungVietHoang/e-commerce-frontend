import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Input, Slider, Rate, Select, Pagination, Card, Typography, Spin, Empty, Divider, Tag } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import searchService from '../../services/searchService';
import productService from '../../services/productService';

const { Title, Text } = Typography;
const { Option } = Select;

const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v) + '₫';

/**
 * SearchResultPage – Trang kết quả tìm kiếm.
 * Layout: Sidebar lọc bên trái | Grid kết quả bên phải.
 */
const SearchResultPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter state từ URL params
  const [keyword, setKeyword]     = useState(searchParams.get('keyword') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [minRating, setMinRating] = useState(null);
  const [sort, setSort]           = useState('newest');
  const [page, setPage]           = useState(1);

  const [products, setProducts]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [categories, setCategories] = useState([]);

  // Load categories cho filter
  useEffect(() => {
    productService.getCategories()
      .then(res => setCategories(res.data?.data || []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {
      keyword: keyword || undefined,
      categoryId: categoryId || undefined,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
      minRating: minRating || undefined,
      sort,
      page: page - 1,
      size: 12,
    };
    searchService.search(params)
      .then(res => {
        const data = res.data?.data;
        setProducts(data?.content || []);
        setTotal(data?.totalElements || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [keyword, categoryId, priceRange, minRating, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Sync URL khi filter thay đổi
  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (categoryId) params.categoryId = categoryId;
    setSearchParams(params);
  }, [keyword, categoryId]);

  const handleSearch = () => { setPage(1); fetchProducts(); };

  return (
    <div style={{ padding: '16px 32px' }}>
      <Row gutter={24}>
        {/* Sidebar bộ lọc */}
        <Col xs={24} sm={6}>
          <Card
            title={<span><FilterOutlined /> Bộ lọc</span>}
            bordered
            style={{ borderRadius: 12, position: 'sticky', top: 80 }}
          >
            {/* Từ khóa */}
            <Text strong>Từ khóa</Text>
            <Input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Tìm sản phẩm..."
              prefix={<SearchOutlined />}
              onPressEnter={() => { setPage(1); fetchProducts(); }}
              style={{ marginTop: 8, marginBottom: 16, borderRadius: 8 }}
            />

            {/* Danh mục */}
            <Text strong>Danh mục</Text>
            <Select
              placeholder="Tất cả danh mục"
              allowClear
              value={categoryId}
              onChange={v => { setCategoryId(v); setPage(1); }}
              style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
            >
              {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>

            {/* Khoảng giá */}
            <Text strong>Khoảng giá</Text>
            <Slider
              range
              min={0}
              max={10000000}
              step={100000}
              value={priceRange}
              onChange={setPriceRange}
              onChangeComplete={() => setPage(1)}
              tooltip={{ formatter: formatPrice }}
              style={{ margin: '12px 4px 4px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12, color: '#888' }}>
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>

            {/* Rating tối thiểu */}
            <Text strong>Đánh giá tối thiểu</Text>
            <div style={{ marginTop: 8 }}>
              {[5, 4, 3, 2, 1].map(r => (
                <Tag
                  key={r}
                  onClick={() => { setMinRating(minRating === r ? null : r); setPage(1); }}
                  style={{
                    cursor: 'pointer',
                    marginBottom: 6,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: minRating === r ? '#e6f4ff' : '#fff',
                    border: minRating === r ? '1px solid #1677ff' : '1px solid #d9d9d9',
                    display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content',
                  }}
                >
                  <Rate disabled defaultValue={r} style={{ fontSize: 12 }} /> <span style={{ fontSize: 12 }}>trở lên</span>
                </Tag>
              ))}
            </div>
          </Card>
        </Col>

        {/* Kết quả tìm kiếm */}
        <Col xs={24} sm={18}>
          {/* Header + Sort */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              {total > 0 ? `${total} sản phẩm` : 'Không tìm thấy sản phẩm'}
              {keyword && <Text type="secondary" style={{ fontSize: 14, marginLeft: 8 }}>cho "{keyword}"</Text>}
            </Title>
            <Select value={sort} onChange={v => { setSort(v); setPage(1); }} style={{ width: 170 }}>
              <Option value="newest">Mới nhất</Option>
              <Option value="bestseller">Bán chạy nhất</Option>
              <Option value="price_asc">Giá tăng dần</Option>
              <Option value="price_desc">Giá giảm dần</Option>
            </Select>
          </div>

          <Divider style={{ margin: '0 0 16px' }} />

          {loading
            ? <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
            : products.length === 0
              ? <Empty description="Không tìm thấy sản phẩm phù hợp" style={{ padding: 60 }} />
              : (
                <>
                  <Row gutter={[16, 20]}>
                    {products.map(p => <Col key={p.id} xs={24} sm={12} lg={8}><ProductCard product={p} /></Col>)}
                  </Row>
                  <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Pagination
                      current={page}
                      total={total}
                      pageSize={12}
                      onChange={p => setPage(p)}
                      showTotal={t => `Tổng ${t} sản phẩm`}
                      showSizeChanger={false}
                    />
                  </div>
                </>
              )
          }
        </Col>
      </Row>
    </div>
  );
};

export default SearchResultPage;

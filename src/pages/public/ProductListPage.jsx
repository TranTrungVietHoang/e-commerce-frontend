import React, { useState, useEffect } from 'react';
import { Layout, Card, List, Typography, Space, Tag, Input, Select, Pagination, Spin, Empty } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const ProductListPage = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('grid');
  const navigate = useNavigate();

  // Mock data for initial restore
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts([
        { id: 1, name: 'Sản phẩm mẫu 1', price: 150000, category: 'Điện tử', image: 'https://via.placeholder.com/200' },
        { id: 2, name: 'Sản phẩm mẫu 2', price: 250000, category: 'Gia dụng', image: 'https://via.placeholder.com/200' },
        { id: 3, name: 'Sản phẩm mẫu 3', price: 350000, category: 'Thời trang', image: 'https://via.placeholder.com/200' },
        { id: 4, name: 'Sản phẩm mẫu 4', price: 450000, category: 'Làm đẹp', image: 'https://via.placeholder.com/200' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Layout style={{ padding: '24px 0', background: '#fff' }}>
      <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', padding: '0 16px' }}>
        <Title level={5}><FilterOutlined /> Bộ lọc tìm kiếm</Title>
        <div style={{ marginBottom: 24 }}>
          <Text strong>Danh mục</Text>
          <div style={{ marginTop: 8 }}>
            <Tag color="blue" style={{ marginBottom: 8, cursor: 'pointer' }}>Tất cả</Tag>
            <Tag style={{ marginBottom: 8, cursor: 'pointer' }}>Điện tử</Tag>
            <Tag style={{ marginBottom: 8, cursor: 'pointer' }}>Thời trang</Tag>
          </div>
        </div>
        <div>
          <Text strong>Khoảng giá</Text>
          <Select 
            placeholder="Chọn giá" 
            style={{ width: '100%', marginTop: 8 }}
            options={[
              { value: 'under-100', label: 'Dưới 100k' },
              { value: '100-500', label: '100k - 500k' },
              { value: 'over-500', label: 'Trên 500k' },
            ]}
          />
        </div>
      </Sider>
      <Content style={{ padding: '0 24px', minHeight: 280 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Kết quả sản phẩm</Title>
            <Space>
              <Select 
                defaultValue="newest" 
                style={{ width: 150 }}
                options={[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'price-asc', label: 'Giá thấp đến cao' },
                  { value: 'price-desc', label: 'Giá cao đến thấp' },
                ]}
              />
              <Space.Compact>
                <Button 
                  icon={<AppstoreOutlined />} 
                  type={view === 'grid' ? 'primary' : 'default'}
                  onClick={() => setView('grid')}
                />
                <Button 
                  icon={<UnorderedListOutlined />} 
                  type={view === 'list' ? 'primary' : 'default'}
                  onClick={() => setView('list')}
                />
              </Space.Compact>
            </Space>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
          ) : products.length > 0 ? (
            <List
              grid={view === 'grid' ? { gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 } : null}
              dataSource={products}
              renderItem={item => (
                <List.Item>
                  <Card
                    hoverable
                    cover={<img alt={item.name} src={item.image} />}
                    onClick={() => navigate(`/products/${item.id}`)}
                  >
                    <Card.Meta 
                      title={item.name} 
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{item.category}</Text>
                          <Text type="danger" strong>{item.price.toLocaleString('vi-VN')} đ</Text>
                        </Space>
                      } 
                    />
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="Không tìm thấy sản phẩm nào" />
          )}

          <div style={{ textAlign: 'right' }}>
            <Pagination defaultCurrent={1} total={products.length} pageSize={8} />
          </div>
        </Space>
      </Content>
    </Layout>
  );
};

export default ProductListPage;

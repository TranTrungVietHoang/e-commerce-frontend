import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Image, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const { Title, Text } = Typography;
const shopId = 1;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const ProductManagePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [lowStockVariants, setLowStockVariants] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchProducts = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const data = await productService.getShopProducts(shopId, page, size);
      setProducts(data.content);
      setPagination({ current: page + 1, pageSize: size, total: data.totalElements });
    } catch (error) {
      message.error(error.message || 'Khong the tai danh sach san pham');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      setLowStockVariants(await productService.getLowStockVariants(shopId));
    } catch {
      setLowStockVariants([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLowStock();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xoa san pham?',
      onOk: async () => {
        await productService.deleteProduct(id, shopId);
        fetchProducts(pagination.current - 1, pagination.pageSize);
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Quan ly san pham</Title>
          <Space>
            <Button onClick={() => navigate('/seller/vouchers')}>Quan ly voucher</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/seller/products/add')}>
              Them san pham
            </Button>
          </Space>
        </Space>
        {lowStockVariants.length > 0 && (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message={`Co ${lowStockVariants.length} bien the sap het hang`}
            style={{ marginBottom: 16 }}
          />
        )}
        <Table
          rowKey="id"
          loading={loading}
          dataSource={products}
          pagination={{ ...pagination, onChange: (page, pageSize) => fetchProducts(page - 1, pageSize) }}
          columns={[
            {
              title: 'Anh',
              dataIndex: 'primaryImageUrl',
              width: 90,
              render: (value) => <Image width={60} height={60} src={value || 'https://via.placeholder.com/60'} style={{ objectFit: 'cover' }} />,
            },
            {
              title: 'Ten',
              dataIndex: 'name',
              render: (_, record) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{record.name}</div>
                  <Text type="secondary">{record.categoryName}</Text>
                </div>
              ),
            },
            {
              title: 'Gia',
              render: (_, record) => (
                <div>
                  <Text strong>{money(record.effectivePrice || record.basePrice)}</Text>
                  {record.flashSalePrice && <div><Text delete type="secondary">{money(record.basePrice)}</Text></div>}
                </div>
              ),
            },
            {
              title: 'Flash sale',
              render: (_, record) => (
                record.flashSalePrice ? <Tag color={record.flashSaleActive ? 'red' : 'gold'}>{record.flashSaleActive ? 'Dang sale' : 'Da len lich'}</Tag> : <Tag>Khong co</Tag>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status) => <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{status}</Tag>,
            },
            {
              title: 'Ton kho',
              dataIndex: 'stockQuantity',
              render: (stock) => <Tag color={stock === 0 ? 'red' : stock < 10 ? 'orange' : 'green'}>{stock}</Tag>,
            },
            {
              title: 'Thao tac',
              render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => navigate(`/seller/products/edit/${record.id}`)} />
                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ProductManagePage;

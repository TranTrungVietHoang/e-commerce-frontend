import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Image, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const { Title, Text } = Typography;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const ProductManagePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [lowStockVariants, setLowStockVariants] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const shopId = 1;

  const fetchProducts = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const data = await productService.getShopProducts(shopId, page, size);
      setProducts(data.content);
      setPagination({ current: page + 1, pageSize: size, total: data.totalElements });
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const data = await productService.getLowStockVariants(shopId);
      setLowStockVariants(data);
    } catch {
      setLowStockVariants([]);
    }
  };

  useEffect(() => { fetchProducts(); fetchLowStock(); }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này? (Xóa mềm)',
      okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
      onOk: async () => {
        try {
          await productService.deleteProduct(id, shopId);
          message.success('Xóa sản phẩm thành công');
          fetchProducts(pagination.current - 1);
        } catch (error) {
          message.error('Lỗi khi xóa: ' + error.message);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Ảnh', dataIndex: 'primaryImageUrl', width: 100,
      render: (url) => <Image src={url || 'https://via.placeholder.com/60'} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    {
      title: 'Tên sản phẩm', dataIndex: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.categoryName}</Text>
        </div>
      ),
    },
    {
      title: 'Giá cơ bản', dataIndex: 'basePrice', width: 150,
      render: (price) => <Text strong>{money(price)}</Text>,
    },
    {
      title: 'Tổng kho', dataIndex: 'stockQuantity', width: 100,
      render: (stock) => <Tag color={stock === 0 ? 'red' : stock < 10 ? 'orange' : 'green'}>{stock}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 120,
      render: (status) => {
        let color = status === 'ACTIVE' ? 'green' : 'orange';
        if (status === 'DELETED') color = 'volcano';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác', width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/seller/products/edit/${record.id}`)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Sản phẩm</Title>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/seller/products/add')} style={{ borderRadius: 8 }}>
            Thêm sản phẩm mới
          </Button>
        </div>

        {lowStockVariants.length > 0 && (
          <Alert
            message="Cảnh báo tồn kho"
            description={`Bạn có ${lowStockVariants.length} loại hàng sắp hết hoặc đã hết. Hãy cập nhật kho ngay!`}
            type="warning" showIcon icon={<WarningOutlined />}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        <Table
          columns={columns} dataSource={products} rowKey="id"
          loading={loading}
          pagination={{ ...pagination, onChange: (page, pageSize) => fetchProducts(page - 1, pageSize) }}
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};

export default ProductManagePage;

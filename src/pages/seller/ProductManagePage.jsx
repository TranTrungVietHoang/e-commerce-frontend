import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Typography, Card, Alert, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const { Title, Text } = Typography;

const ProductManagePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [lowStockVariants, setLowStockVariants] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Giả sử shopId = 1 (Bạn sẽ tích hợp lấy từ Auth context sau)
  const shopId = 1;

  const fetchProducts = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const data = await productService.getShopProducts(shopId, page, size);
      setProducts(data.content);
      setPagination({
        ...pagination,
        current: page + 1,
        total: data.totalElements,
      });
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
    } catch (error) {
      console.error('Lỗi lấy hàng sắp hết:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLowStock();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này? (Xóa mềm)',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
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
      title: 'Ảnh',
      dataIndex: 'primaryImageUrl',
      key: 'image',
      width: 100,
      render: (url) => (
        <Image
          src={url || 'https://via.placeholder.com/60/ffffff/cccccc?text=No+Img'}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.categoryName}</Text>
        </div>
      ),
    },
    {
      title: 'Giá cơ bản',
      dataIndex: 'basePrice',
      key: 'price',
      width: 150,
      render: (price) => (
        <Text strong>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
        </Text>
      ),
    },
    {
      title: 'Tổng kho',
      dataIndex: 'stockQuantity',
      key: 'stock',
      width: 100,
      render: (stock) => (
        <Tag color={stock === 0 ? 'red' : stock < 10 ? 'orange' : 'green'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = status === 'ACTIVE' ? 'green' : 'orange';
        if (status === 'DELETED') color = 'volcano';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/seller/products/edit/${record.id}`)}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false} className="premium-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Sản phẩm</Title>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />} 
            onClick={() => navigate('/seller/products/add')}
            style={{ borderRadius: '8px' }}
          >
            Thêm sản phẩm mới
          </Button>
        </div>

        {lowStockVariants.length > 0 && (
          <Alert
            message="Cảnh báo tồn kho"
            description={`Bạn có ${lowStockVariants.length} loại hàng sắp hết hoặc đã hết. Hãy cập nhật kho ngay!`}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          />
        )}

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchProducts(page - 1, pageSize),
          }}
          style={{ borderRadius: '8px', overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};

export default ProductManagePage;

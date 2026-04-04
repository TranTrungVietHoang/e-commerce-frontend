import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, message, Image, Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import productService from '../../services/productService';

const { Title, Text } = Typography;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const ProductModerationPage = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchPendingProducts = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const data = await productService.getPendingProducts(page, size);
      setProducts(data.content);
      setPagination({
        current: page + 1,
        pageSize: size,
        total: data.totalElements
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách chờ duyệt: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleModerate = (id, status) => {
    const actionText = status === 'APPROVED' ? 'phê duyệt' : 'từ chối';
    Modal.confirm({
      title: `Xác nhận ${actionText}`,
      content: `Bạn có chắc chắn muốn ${actionText} sản phẩm này?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await productService.moderateProduct(id, status);
          message.success(`Đã ${actionText} sản phẩm thành công`);
          fetchPendingProducts(pagination.current - 1);
        } catch (error) {
          message.error('Lỗi: ' + error.message);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'primaryImageUrl',
      width: 100,
      render: (url) => <Image src={url || 'https://via.placeholder.com/60'} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    {
      title: 'Thông tin sản phẩm',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>{record.name}</div>
          <Text type="secondary">Danh mục: {record.categoryName}</Text>
          <br />
          <Text type="secondary">Giá: {money(record.basePrice)}</Text>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái AI',
      dataIndex: 'moderationStatus',
      width: 120,
      render: () => <Tag color="gold">Chờ duyệt</Tag>,
    },
    {
      title: 'Thao tác',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={() => handleModerate(record.id, 'APPROVED')}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Duyệt
          </Button>
          <Button 
            danger 
            icon={<CloseCircleOutlined />} 
            onClick={() => handleModerate(record.id, 'REJECTED')}
          >
            Từ chối
          </Button>
          <Button 
            icon={<EyeOutlined />} 
            href={`/products/${record.id}`} 
            target="_blank"
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false} className="shadow-sm">
        <Title level={3}>Kiểm duyệt Sản phẩm</Title>
        <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
          Danh sách các sản phẩm mới đăng hoặc cập nhật cần được Admin kiểm tra nội dung trước khi hiển thị công khai.
        </Text>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchPendingProducts(page - 1, pageSize),
          }}
        />
      </Card>
    </div>
  );
};


export default ProductModerationPage;

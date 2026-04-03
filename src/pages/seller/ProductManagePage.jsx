import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Image, Modal, Space, Table, Tag, Typography, message, Input, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, WarningOutlined, EyeInvisibleOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import shopService from '../../services/shopService';

const { Title, Text } = Typography;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const ProductManagePage = ({ isAdminView = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [lowStockVariants, setLowStockVariants] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [shopId, setShopId] = useState(null);

  const fetchProducts = async (page = 0, size = 10, currentShopId = shopId) => {
    setLoading(true);
    try {
      let data;
      if (isAdminView) {
        data = await productService.getAdminProducts(page, size);
      } else {
        if (!currentShopId) return;
        data = await productService.getShopProducts(currentShopId, page, size);
      }
      setProducts(data.content);
      setPagination({ current: page + 1, pageSize: size, total: data.totalElements });
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async (currentShopId = shopId) => {
    if (isAdminView || !currentShopId) return;
    try {
      const data = await productService.getLowStockVariants(currentShopId);
      setLowStockVariants(data);
    } catch {
      setLowStockVariants([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (isAdminView) {
        fetchProducts(0, 10);
      } else {
        try {
          const myShop = await shopService.getMyShop();
          setShopId(myShop.id);
          fetchProducts(0, 10, myShop.id);
          fetchLowStock(myShop.id);
        } catch (error) {
          message.error("Không thể xác định thông tin gian hàng");
        }
      }
    };
    init();
  }, [isAdminView]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này? (Xóa mềm)',
      okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Nếu Admin xóa thì shopId truyền vào có thể lấy từ record, ở đây tạm thời dùng 0 hoặc id thực tế
          await productService.deleteProduct(id, isAdminView ? products.find(p => p.id === id)?.shopId : shopId);
          message.success('Xóa sản phẩm thành công');
          fetchProducts(pagination.current - 1);
        } catch (error) {
          message.error('Lỗi khi xóa: ' + error.message);
        }
      },
    });
  };

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      if (isAdminView) {
        await productService.updateProductStatus(id, status, reason);
      } else {
        await productService.updateProductStatusForSeller(id, shopId, status);
      }
      message.success(`Đã cập nhật trạng thái sản phẩm sang ${status}`);
      fetchProducts(pagination.current - 1);
    } catch (error) {
      message.error('Lỗi cập nhật trạng thái: ' + error.message);
    }
  };

  const showReasonModal = (id, targetStatus) => {
    let reason = '';
    Modal.confirm({
      title: targetStatus === 'REJECTED' ? 'Lý do từ chối' : 'Lý do ẩn sản phẩm',
      content: (
        <Input.TextArea 
          placeholder="Nhập lý do tại đây..." 
          rows={4} 
          onChange={(e) => reason = e.target.value}
          style={{ marginTop: 16 }}
        />
      ),
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => handleUpdateStatus(id, targetStatus, reason),
    });
  };

  const columns = [
    {
      title: 'Ảnh', dataIndex: 'primaryImageUrl', width: 80,
      render: (url) => <Image src={url || 'https://via.placeholder.com/60'} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    {
      title: 'Sản phẩm', dataIndex: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <Space size={4} split={<span style={{ color: '#ccc' }}>|</span>}>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.categoryName}</Text>
            {isAdminView && <Text type="warning" style={{ fontSize: 12 }}>Shop ID: {record.shopId}</Text>}
          </Space>
        </div>
      ),
    },
    {
      title: 'Giá gốc', dataIndex: 'basePrice', width: 120,
      render: (price) => <Text strong>{money(price)}</Text>,
    },
    {
      title: 'Kho', dataIndex: 'stockQuantity', width: 80,
      render: (stock) => <Tag color={stock === 0 ? 'red' : stock < 10 ? 'orange' : 'green'}>{stock}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 150,
      render: (status, record) => {
        let color = 'default';
        let text = status;
        if (status === 'ACTIVE') { color = 'green'; text = 'Đang bán'; }
        if (status === 'INACTIVE') { color = 'default'; text = 'Đang ẩn'; }
        if (status === 'PENDING') { color = 'orange'; text = 'Chờ duyệt'; }
        if (status === 'REJECTED') { color = 'red'; text = 'Từ chối'; }
        if (status === 'DELETED') { color = 'volcano'; text = 'Đã xóa'; }
        
        return (
          <Space direction="vertical" size={0}>
            <Tag color={color} style={{ margin: 0 }}>{text}</Tag>
            {record.statusReason && (
              <Tooltip title={record.statusReason}>
                <Text type="secondary" style={{ fontSize: 11, cursor: 'help' }}>
                  <QuestionCircleOutlined /> Xem lý do
                </Text>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Hành động', width: 220,
      render: (_, record) => (
        <Space size="small">
          {!isAdminView ? (
            <>
              <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/seller/products/edit/${record.id}`)} />
              {record.status === 'ACTIVE' && (
                <Tooltip title="Ẩn sản phẩm">
                  <Button size="small" icon={<EyeInvisibleOutlined />} onClick={() => handleUpdateStatus(record.id, 'INACTIVE')} />
                </Tooltip>
              )}
              {record.status === 'INACTIVE' && (
                <Tooltip title="Hiện sản phẩm">
                  <Button size="small" icon={<EyeOutlined />} onClick={() => handleUpdateStatus(record.id, 'ACTIVE')} />
                </Tooltip>
              )}
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
            </>
          ) : (
            <>
              {record.status === 'PENDING' && (
                <Space>
                  <Button size="small" type="primary" onClick={() => handleUpdateStatus(record.id, 'ACTIVE')}>Duyệt</Button>
                  <Button size="small" danger onClick={() => showReasonModal(record.id, 'REJECTED')}>Từ chối</Button>
                </Space>
              )}
              {record.status === 'ACTIVE' && (
                <Button size="small" danger icon={<EyeInvisibleOutlined />} onClick={() => showReasonModal(record.id, 'INACTIVE')}>Ẩn kho</Button>
              )}
              {record.status === 'INACTIVE' && (
                <Button size="small" icon={<EyeOutlined />} onClick={() => handleUpdateStatus(record.id, 'ACTIVE')}>Mở lại</Button>
              )}
              {record.status === 'REJECTED' && (
                <Button size="small" type="primary" onClick={() => handleUpdateStatus(record.id, 'ACTIVE')}>Cấp phép lại</Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>{isAdminView ? 'Quản trị Sản phẩm Toàn hệ thống' : 'Quản lý Kho hàng'}</Title>
            <Text type="secondary">{isAdminView ? 'Xem và phê duyệt sản phẩm từ mọi Seller' : 'Quản lý danh sách sản phẩm của cửa hàng bạn'}</Text>
          </div>
          {!isAdminView && (
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/seller/products/add')} style={{ borderRadius: 8 }}>
              Thêm sản phẩm mới
            </Button>
          )}
        </div>

        {lowStockVariants.length > 0 && !isAdminView && (
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

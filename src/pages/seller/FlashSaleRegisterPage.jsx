import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Modal, Form, Select, 
  InputNumber, Tag, Space, Popconfirm, message, Typography 
} from 'antd';
import { ThunderboltOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import flashSaleService from '../../services/flashSaleService';
import productService from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const FlashSaleRegisterPage = () => {
  const { user } = useAuth();
  const [availableFlashSales, setAvailableFlashSales] = useState([]);
  const [myRegisteredProducts, setMyRegisteredProducts] = useState([]);
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sales, registered, products] = await Promise.all([
        flashSaleService.getAllFlashSales(),
        flashSaleService.getMyRegisteredProducts(),
        productService.getShopProducts(user.shopId, 0, 100),
      ]);
      setAvailableFlashSales(sales.filter(s => ['PENDING', 'ACTIVE'].includes(s.status)));
      setMyRegisteredProducts(registered);
      setShopProducts(products.content || []);
    } catch (err) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.shopId) {
        fetchData();
    }
  }, [user]);

  const handleRegister = async (values) => {
    try {
      await flashSaleService.registerProduct(values);
      message.success('Đăng ký sản phẩm tham gia Flash Sale thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      message.error(err.message || 'Lỗi khi đăng ký sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    try {
      await flashSaleService.unregisterProduct(id);
      message.success('Đã hủy đăng ký sản phẩm');
      fetchData();
    } catch (err) {
      message.error('Không thể hủy đăng ký lúc này');
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'productName',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <strong>{name}</strong>
          <Text type="secondary" size="small">Gốc: {record.product?.basePrice?.toLocaleString()}đ</Text>
        </Space>
      )
    },
    {
        title: 'Giá Flash Sale',
        dataIndex: 'flashSalePrice',
        key: 'flashSalePrice',
        render: (price) => <strong style={{ color: '#f5222d' }}>{price?.toLocaleString()}đ</strong>,
    },
    {
      title: 'Số lượng (Slots)',
      dataIndex: 'slots',
      key: 'slots',
      render: (slots, record) => <Tag color="blue">{record.soldCount} / {slots}</Tag>,
    },
    {
        title: 'Chiến dịch',
        dataIndex: ['flashSale', 'name'],
        key: 'flashSaleName',
    },
    {
        title: 'Trạng thái đợt Sale',
        dataIndex: ['flashSale', 'status'],
        key: 'flashSaleStatus',
        render: (status) => <Tag color={status === 'ACTIVE' ? 'green' : 'blue'}>{status}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        record.flashSale?.status === 'PENDING' && (
          <Popconfirm title="Xác nhận hủy đăng ký?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <Title level={3}>Đăng ký Khung giờ vàng (Flash Sale)</Title>
            <Text type="secondary">Đưa sản phẩm của bạn vào các đợt Flash Sale của sàn để bùng nổ doanh số.</Text>
          </div>
          <Button 
            type="primary" 
            icon={<ThunderboltOutlined />} 
            onClick={() => setIsModalOpen(true)}
            size="large"
          >
            Đăng ký sản phẩm mới
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={myRegisteredProducts} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Đăng ký sản phẩm tham gia Flash Sale"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleRegister}>
          <Form.Item label="Chọn đợt Flash Sale" name="flashSaleId" rules={[{ required: true }]}>
            <Select placeholder="Chọn chiến dịch đang mở">
              {availableFlashSales
                .filter(fs => fs.status === 'PENDING' || fs.status === 'ACTIVE')
                .map(fs => (
                  <Select.Option key={fs.id} value={fs.id}>
                    {fs.name} ({dayjs(fs.startTime).format('HH:mm DD/MM')} - {dayjs(fs.endTime).format('HH:mm DD/MM')})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="Chọn sản phẩm" name="productId" rules={[{ required: true }]}>
            <Select placeholder="Chọn sản phẩm từ shop của bạn">
              {shopProducts.map(p => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} (Giá gốc: {p.basePrice?.toLocaleString()}đ)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item label="Giá Flash Sale" name="flashSalePrice" rules={[{ required: true }]} style={{ flex: 1 }}>
                <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="Nhập giá khuyến mãi"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="VND"
                />
            </Form.Item>
            <Form.Item label="Số lượng tham gia (Slots)" name="slots" rules={[{ required: true }]} style={{ flex: 1 }}>
                <InputNumber style={{ width: '100%' }} min={1} placeholder="Ví dụ: 100" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FlashSaleRegisterPage;

import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Modal, Form, Input, 
  DatePicker, Tag, Space, Popconfirm, message, Typography 
} from 'antd';
import { PlusOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import flashSaleService from '../../services/flashSaleService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const FlashSaleManagePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      const res = await flashSaleService.getAllFlashSales();
      setData(res);
    } catch (err) {
      message.error('Không thể tải danh sách Flash Sale');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const handleCreate = async (values) => {
    try {
      const payload = {
        name: values.name,
        startTime: values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss'),
        endTime: values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss'),
      };
      await flashSaleService.createFlashSale(payload);
      message.success('Tạo đợt Flash Sale thành công');
      setIsModalOpen(false);
      form.resetFields();
      fetchFlashSales();
    } catch (err) {
      message.error(err.message || 'Lỗi khi tạo Flash Sale');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await flashSaleService.updateStatus(id, status);
      message.success(`Đã cập nhật trạng thái sang ${status}`);
      fetchFlashSales();
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    try {
      await flashSaleService.deleteFlashSale(id);
      message.success('Đã xóa đợt Flash Sale');
      fetchFlashSales();
    } catch (err) {
      message.error('Không thể xóa đợt Flash Sale này');
    }
  };

  const columns = [
    {
      title: 'Tên đợt Sale',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === 'ACTIVE') color = 'green';
        if (status === 'FINISHED') color = 'gray';
        if (status === 'CANCELLED') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'PENDING' && (
            <Button size="small" type="primary" onClick={() => updateStatus(record.id, 'ACTIVE')}>Kích hoạt</Button>
          )}
          {record.status === 'ACTIVE' && (
            <Button size="small" danger onClick={() => updateStatus(record.id, 'FINISHED')}>Kết thúc sớm</Button>
          )}
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <Title level={3}>Quản lý Khung giờ vàng (Flash Sale)</Title>
            <Text type="secondary">Tạo các khung giờ chiến dịch. Seller sẽ tự đăng ký sản phẩm và đặt mức giá ưu đãi của họ trong từng đợt sale.</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsModalOpen(true)}
            size="large"
          >
            Tạo khung giờ mới
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Tạo khung giờ Flash Sale mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="Tên chiến dịch" name="name" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Siêu Sale Cuối Tuần" />
          </Form.Item>
          <Form.Item label="Khoảng thời gian" name="timeRange" rules={[{ required: true }]}>
            <DatePicker.RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FlashSaleManagePage;

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Card, Popconfirm, Modal, Form, Input, Typography, TreeSelect } from 'antd';
import { AppstoreOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const CategoryManagePage = () => {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      message.error(error?.message || 'Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      message.error(error?.message || 'Lỗi khi xóa danh mục');
    }
  };

  const handleModalSubmit = async (values) => {
    try {
      if (editingCat) {
        await categoryService.updateCategory(editingCat.id, values);
        message.success('Cập nhật thành công');
      } else {
        await categoryService.createCategory(values);
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error(error?.message || 'Lỗi thao tác');
    }
  };

  const openAddModal = () => {
    setEditingCat(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (record) => {
    setEditingCat(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      iconUrl: record.iconUrl,
      parentId: record.parent?.id || null 
    });
    setIsModalVisible(true);
  };

  // Convert danh mục list -> Tree format dùng cho TreeSelect
  const buildTreeData = (cats) => {
    return cats.map(c => ({
      title: c.name,
      value: c.id,
      children: (c.children && c.children.length) ? buildTreeData(c.children) : undefined
    }));
  };

  const columns = [
    {
      title: 'Tên Danh Mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Icon (URL)',
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      render: (url) => url ? <img src={url} alt="icon" style={{width: 30}} /> : '-'
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined style={{color: '#1677ff'}}/>} onClick={() => openEditModal(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={
          <Space>
            <AppstoreOutlined />
            <Title level={4} style={{ margin: 0 }}>
              {isAdmin ? 'Cây Danh Mục Hệ Thống' : 'Danh Mục Sản Phẩm'}
            </Title>
          </Space>
        }
        extra={isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Thêm Mới</Button>}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {isAdmin 
            ? 'Quản trị viên có quyền quản lý cấu trúc danh mục toàn sàn.' 
            : 'Người bán xem danh mục để phân loại sản phẩm chính xác.'
          }
        </Text>
        <Table 
          columns={isAdmin ? columns : columns.filter(c => c.key !== 'action')} 
          dataSource={categories} 
          rowKey="id" 
          loading={loading}
          pagination={false}
        />
      </Card>

      {isAdmin && (
        <Modal
          title={editingCat ? "Cập Nhật Danh Mục" : "Thêm Mới Danh Mục"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => form.submit()}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
            <Form.Item name="name" label="Tên Danh Mục" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="parentId" label="Danh mục cha (Chọn nếu là danh mục con)">
              <TreeSelect
                treeData={buildTreeData(categories)}
                placeholder="-- Rễ (Không có cha) --"
                allowClear
                treeDefaultExpandAll
              />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="iconUrl" label="Icon URL">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default CategoryManagePage;

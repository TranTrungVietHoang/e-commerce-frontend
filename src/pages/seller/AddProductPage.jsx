import React, { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Form, Input, InputNumber, List, Select, Space, Table, Typography, Upload, message } from 'antd';
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { 
  Steps, Form, Input, InputNumber, Button, Card, Space, 
  Table, message, Typography, Select, Divider, List, Avatar, Tag, Upload
} from 'antd';
import { 
  InfoCircleOutlined, PictureOutlined, AppstoreAddOutlined, 
  PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, CheckOutlined, UploadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const shopId = 1;

const mapVariantsPayload = (variants) => variants.map(({ key, attributes, ...rest }) => ({
  ...rest,
  attributes: JSON.stringify(Object.fromEntries(attributes.filter((attr) => attr.key && attr.value).map((attr) => [attr.key, attr.value]))),
}));

const normalizeProductPayload = (values, imageUrls, variants) => ({
  ...values,
  status: values.status || 'ACTIVE',
  imageUrls,
  variants: mapVariantsPayload(variants),
  flashSaleEnabled: !!values.flashSaleEnabled,
  flashSalePrice: values.flashSaleEnabled ? values.flashSalePrice : null,
  flashSaleStartAt: values.flashSaleEnabled ? values.flashSaleStartAt : null,
  flashSaleEndAt: values.flashSaleEnabled ? values.flashSaleEndAt : null,
});

const { Dragger } = Upload;

const AddProductPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false); // Giữ từ feature

  // Giả sử shopId = 1
  const shopId = 1;

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // --- LOGIC HÌNH ẢNH (Giữ nguyên logic handleUpload của bạn) ---
  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const url = await productService.uploadImage(file);
      setImageUrls((prev) => [...prev, url]);
      message.success(`Tai anh ${file.name} thanh cong`);
    } catch (error) {
      message.error(error.message || 'Tai anh that bai');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const removeImage = (url) => {
    setImageUrls(imageUrls.filter(u => u !== url));
  };

  // --- LOGIC BIẾN THỂ (Giữ nguyên logic của bạn) ---
  const addVariant = () => setVariants((prev) => [...prev, { key: Date.now(), attributes: [{ key: 'Loai', value: '' }], price: form.getFieldValue('basePrice') || 0, stock: 0, sku: '' }]);
  
  const updateVariant = (key, field, value) => setVariants((prev) => prev.map((item) => item.key === key ? { ...item, [field]: value } : item));
  
  const updateAttribute = (key, index, field, value) => setVariants((prev) => prev.map((item) => {
    if (item.key !== key) return item;
    const attributes = [...item.attributes];
    attributes[index] = { ...attributes[index], [field]: value };
    return { ...item, attributes };
  }));

  const addAttribute = (key) => setVariants((prev) => prev.map((item) => item.key === key ? { ...item, attributes: [...item.attributes, { key: '', value: '' }] } : item));
  
  const removeAttribute = (variantKey, attrIndex) => {
    setVariants(variants.map(v => {
      if (v.key === variantKey) {
        const newAttrs = v.attributes.filter((_, i) => i !== attrIndex);
        return { ...v, attributes: newAttrs.length > 0 ? newAttrs : [{ key: '', value: '' }] };
      }
      return v;
    }));
  };

  const removeVariant = (key) => setVariants((prev) => prev.filter((item) => item.key !== key));

  // --- SUBMIT (Sử dụng hàm onFinish và normalizePayload của bạn) ---
  const onFinish = async (values) => {
    if (!imageUrls.length) {
      message.warning('Can it nhat 1 hinh anh san pham');
      setCurrentStep(1); // Chuyển về step hình ảnh nếu thiếu
      return;
    }

    setSaving(true);
    setLoading(true);
    try {
      const payload = normalizeProductPayload(values, imageUrls, variants);
      await productService.createProduct(shopId, payload);
      message.success('Da tao san pham');
      navigate('/seller/products');
    } catch (error) {
      message.error(error.message || 'Khong the tao san pham');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'categoryId', 'description', 'basePrice']);
      }
      setCurrentStep(currentStep + 1);
    } catch (err) { /* Validate failed */ }
  };

  const prev = () => setCurrentStep(currentStep - 1);

  // --- RENDER STEPS ---
  const steps = [
    {
      title: 'Thông tin',
      icon: <InfoCircleOutlined />,
      content: (
        <div style={{ padding: '10px 0' }}>
          <Form.Item name="name" label="Ten san pham" rules={[{ required: true }]}><Input size="large" /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <Form.Item name="categoryId" label="Danh muc" rules={[{ required: true }]}>
              <Select size="large" options={categories.map((item) => ({ value: item.id, label: item.name }))} />
            </Form.Item>
            <Form.Item name="basePrice" label="Gia goc" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} size="large" />
            </Form.Item>
            <Form.Item name="status" label="Trang thai" rules={[{ required: true }]}>
              <Select size="large" options={[{ value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }]} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mo ta" rules={[{ required: true }]}><TextArea rows={5} /></Form.Item>
          
          {/* Tích hợp Flash Sale vào Step 1 */}
          <Card size="small" title="Flash sale" style={{ marginBottom: 16 }}>
            <Form.Item name="flashSaleEnabled" valuePropName="checked"><Checkbox>Kich hoat flash sale</Checkbox></Form.Item>
            <Space style={{ width: '100%' }} align="start">
              <Form.Item name="flashSalePrice" label="Gia flash sale" style={{ flex: 1 }}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="flashSaleStartAt" label="Bat dau" style={{ flex: 1 }}><Input type="datetime-local" /></Form.Item>
              <Form.Item name="flashSaleEndAt" label="Ket thuc" style={{ flex: 1 }}><Input type="datetime-local" /></Form.Item>
            </Space>
          </Card>
        </div>
      )
    },
    {
      title: 'Hình ảnh',
      icon: <PictureOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Dragger beforeUpload={handleUpload} showUploadList={false} disabled={uploading}>
            <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: '48px', color: '#1677ff' }} /></p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào đây để tải lên</p>
          </Dragger>
          <List
            header={<Text strong>Danh sách ảnh ({imageUrls.length})</Text>}
            bordered
            dataSource={imageUrls}
            renderItem={(item) => (
              <List.Item actions={[<Button danger type="link" onClick={() => removeImage(item)}>Xoa</Button>]}>
                <List.Item.Meta avatar={<Avatar shape="square" size={64} src={item} />} description={item} />
              </List.Item>
            )}
          />
        </Space>
      )
    },
    {
      title: 'Biến thể',
      icon: <AppstoreAddOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<PlusOutlined />} onClick={addVariant}>Them bien the</Button>
          <Table 
            rowKey="key" 
            pagination={false} 
            dataSource={variants} 
            columns={[
              {
                title: 'Thuoc tinh',
                render: (_, record) => (
                  <Space direction="vertical">
                    {record.attributes.map((attribute, index) => (
                      <Space key={index}>
                        <Input value={attribute.key} placeholder="Ten" onChange={(e) => updateAttribute(record.key, index, 'key', e.target.value)} />
                        <Input value={attribute.value} placeholder="Gia tri" onChange={(e) => updateAttribute(record.key, index, 'value', e.target.value)} />
                        {record.attributes.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeAttribute(record.key, index)} />}
                      </Space>
                    ))}
                    <Button type="link" onClick={() => addAttribute(record.key)}>Them thuoc tinh</Button>
                  </Space>
                ),
              },
              { title: 'Gia', render: (_, record) => <InputNumber min={1} value={record.price} onChange={(value) => updateVariant(record.key, 'price', value)} /> },
              { title: 'Kho', render: (_, record) => <InputNumber min={0} value={record.stock} onChange={(value) => updateVariant(record.key, 'stock', value)} /> },
              { title: 'SKU', render: (_, record) => <Input value={record.sku} onChange={(e) => updateVariant(record.key, 'sku', e.target.value)} /> },
              { title: '', render: (_, record) => <Button danger icon={<DeleteOutlined />} onClick={() => removeVariant(record.key)} /> },
            ]}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'ACTIVE', flashSaleEnabled: false, basePrice: 1000 }}>
        <Card bordered={false}>
          <Title level={3} style={{ marginBottom: '32px' }}>Thêm sản phẩm mới</Title>
          <Steps current={currentStep} items={steps} style={{ marginBottom: '40px' }} />
          <Divider />
          <div style={{ minHeight: '300px', marginBottom: '40px' }}>
            {steps.map((step, idx) => (
              <div key={idx} style={{ display: currentStep === idx ? 'block' : 'none' }}>{step.content}</div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {currentStep > 0 ? <Button size="large" onClick={prev}>Quay lại</Button> : <div />}
            {currentStep < steps.length - 1 ? (
              <Button type="primary" size="large" onClick={next}>Tiếp tục</Button>
            ) : (
              <Button type="primary" size="large" icon={<CheckOutlined />} loading={saving} onClick={() => form.submit()}>
                Hoàn tất & Đăng bán
              </Button>
            )}
          </div>
        </Card>
      </Form>

export default AddProductPage;

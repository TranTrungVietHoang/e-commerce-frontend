import React, { useEffect, useState } from 'react';
import {
  Steps, Form, Input, InputNumber, Button, Card, Space,
  Table, message, Typography, Select, Divider, List, Avatar, Tag, Upload, Checkbox, Spin
} from 'antd';
import {
  InfoCircleOutlined, PictureOutlined, AppstoreAddOutlined,
  PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, CheckOutlined, UploadOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/productService';
import shopService from '../../services/shopService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [shopId, setShopId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [cats, product, myShop] = await Promise.all([
          productService.getCategories(),
          productService.getProductById(id),
          shopService.getMyShop(),
        ]);
        setShopId(myShop.id);
        setCategories(cats);
        form.setFieldsValue({
          name: product.name,
          categoryId: product.categoryId,
          basePrice: product.basePrice,
          status: product.status || 'ACTIVE',
          description: product.description,
          flashSaleEnabled: !!product.flashSaleEnabled,
          flashSalePrice: product.flashSalePrice,
          flashSaleStartAt: product.flashSaleStartAt ? product.flashSaleStartAt.slice(0, 16) : null,
          flashSaleEndAt: product.flashSaleEndAt ? product.flashSaleEndAt.slice(0, 16) : null,
        });
        setImageUrls((product.images || []).map(img => img.imageUrl));
        setVariants((product.variants || []).map(v => {
          let parsedAttrs = [];
          try {
            const obj = JSON.parse(v.attributes || '{}');
            parsedAttrs = Object.entries(obj).map(([key, value]) => ({ key, value }));
            if (!parsedAttrs.length) parsedAttrs = [{ key: 'Màu sắc', value: '' }];
          } catch {
            parsedAttrs = [{ key: 'Màu sắc', value: '' }];
          }
          return { key: v.id, attributes: parsedAttrs, price: v.price, stock: v.stock, sku: v.sku };
        }));
      } catch (error) {
        message.error('Không thể nạp dữ liệu sản phẩm: ' + error.message);
        navigate('/seller/products');
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id]);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const url = await productService.uploadImage(file);
      setImageUrls([...imageUrls, url]);
      message.success(`Tải ảnh ${file.name} thành công`);
    } catch (error) {
      message.error(`Tải ảnh ${file.name} thất bại`);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const removeImage = (url) => setImageUrls(imageUrls.filter(u => u !== url));

  const addVariant = () => setVariants(prev => [...prev, { key: Date.now(), attributes: [{ key: 'Màu sắc', value: '' }], price: form.getFieldValue('basePrice') || 0, stock: 0, sku: '' }]);
  const updateVariant = (key, field, value) => setVariants(prev => prev.map(v => v.key === key ? { ...v, [field]: value } : v));
  const updateAttribute = (variantKey, attrIndex, field, value) => setVariants(prev => prev.map(v => {
    if (v.key !== variantKey) return v;
    const newAttrs = [...v.attributes];
    newAttrs[attrIndex] = { ...newAttrs[attrIndex], [field]: value };
    return { ...v, attributes: newAttrs };
  }));
  const addAttribute = (variantKey) => setVariants(prev => prev.map(v => v.key === variantKey ? { ...v, attributes: [...v.attributes, { key: '', value: '' }] } : v));
  const removeAttribute = (variantKey, attrIndex) => setVariants(prev => prev.map(v => {
    if (v.key !== variantKey) return v;
    const newAttrs = v.attributes.filter((_, i) => i !== attrIndex);
    return { ...v, attributes: newAttrs.length > 0 ? newAttrs : [{ key: '', value: '' }] };
  }));
  const removeVariant = (key) => setVariants(prev => prev.filter(v => v.key !== key));

  const handleFinish = async (values) => {
    if (!imageUrls.length) { message.error('Cần ít nhất 1 hình ảnh'); setCurrentStep(1); return; }
    setLoading(true);
    try {
      const payload = {
        ...values,
        imageUrls,
        variants: variants.map(({ key, attributes, ...v }) => {
          const attrObj = {};
          attributes.forEach(a => { if (a.key && a.value) attrObj[a.key] = a.value; });
          return { ...v, attributes: JSON.stringify(attrObj) };
        }),
      };
      await productService.updateProduct(id, shopId, payload);
      message.success('Cập nhật sản phẩm thành công!');
      navigate('/seller/products');
    } catch (error) {
      message.error('Lỗi khi cập nhật: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      if (currentStep === 0) await form.validateFields(['name', 'categoryId', 'description', 'basePrice']);
      setCurrentStep(currentStep + 1);
    } catch (err) {}
  };
  const prev = () => setCurrentStep(currentStep - 1);

  if (fetching) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  const steps = [
    {
      title: 'Thông tin', icon: <InfoCircleOutlined />,
      content: (
        <div style={{ padding: '10px 0' }}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, min: 10, max: 200 }]}><Input size="large" /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
              <Select size="large">{categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item name="basePrice" label="Giá cơ bản (VNĐ)" rules={[{ required: true }, { type: 'number', min: 1 }]}>
              <InputNumber style={{ width: '100%' }} min={1} size="large" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả sản phẩm" rules={[{ required: true }]}><TextArea rows={6} /></Form.Item>
        </div>
      )
    },
    {
      title: 'Hình ảnh', icon: <PictureOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Dragger beforeUpload={handleUpload} showUploadList={false} multiple={false} disabled={uploading}>
            <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: '48px', color: '#1677ff' }} /></p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào đây để tải lên</p>
          </Dragger>
          <List header={<Text strong>Danh sách ảnh ({imageUrls.length})</Text>} bordered dataSource={imageUrls}
            renderItem={(item, index) => (
              <List.Item actions={[<Button type="link" danger icon={<DeleteOutlined />} onClick={() => removeImage(item)} />]}>
                <List.Item.Meta
                  avatar={<Avatar shape="square" size={64} src={item} />}
                  title={index === 0 ? <Tag color="blue">Ảnh chính</Tag> : `Ảnh phụ ${index}`}
                  description={<Text ellipsis={{ tooltip: item }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
        </Space>
      )
    },
    {
      title: 'Biến thể', icon: <AppstoreAddOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addVariant}>Thêm phân loại</Button>
          </div>
          <Table dataSource={variants} rowKey="key" pagination={false} columns={[
            { title: 'Thuộc tính', dataIndex: 'attributes', width: 400, render: (attrs, record) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                {attrs.map((attr, index) => (
                  <Space key={index} style={{ marginBottom: 4 }}>
                    <Input placeholder="Tên" value={attr.key} onChange={e => updateAttribute(record.key, index, 'key', e.target.value)} style={{ width: 120 }} />
                    <Input placeholder="Giá trị" value={attr.value} onChange={e => updateAttribute(record.key, index, 'value', e.target.value)} style={{ width: 150 }} />
                    {attrs.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeAttribute(record.key, index)} />}
                  </Space>
                ))}
                <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => addAttribute(record.key)} style={{ padding: 0 }}>Thêm thuộc tính</Button>
              </Space>
            )},
            { title: 'Giá', dataIndex: 'price', width: 140, render: (val, r) => <InputNumber value={val} onChange={v => updateVariant(r.key, 'price', v)} style={{ width: '100%' }} /> },
            { title: 'Kho', dataIndex: 'stock', width: 100, render: (val, r) => <InputNumber min={0} value={val} onChange={v => updateVariant(r.key, 'stock', v)} style={{ width: '100%' }} /> },
            { title: 'SKU', dataIndex: 'sku', render: (val, r) => <Input value={val} onChange={e => updateVariant(r.key, 'sku', e.target.value)} placeholder="Mã sp" /> },
            { title: '', key: 'action', width: 50, render: (_, r) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeVariant(r.key)} /> },
          ]} />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Card bordered={false}>
          <Title level={3} style={{ marginBottom: '32px' }}>Chỉnh sửa sản phẩm</Title>
          <Steps current={currentStep} items={steps} style={{ marginBottom: '40px' }} />
          <Divider />
          <div style={{ minHeight: '300px', marginBottom: '40px' }}>
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>{steps[0].content}</div>
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>{steps[1].content}</div>
            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>{steps[2].content}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {currentStep > 0 ? <Button size="large" icon={<LeftOutlined />} onClick={prev}>Quay lại</Button> : <div />}
            {currentStep < steps.length - 1 ? (
              <Button type="primary" size="large" icon={<RightOutlined />} onClick={next}>Tiếp tục</Button>
            ) : (
              <Button type="primary" size="large" icon={<CheckOutlined />} loading={loading} onClick={() => form.submit()}>Lưu thay đổi</Button>
            )}
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default EditProductPage;

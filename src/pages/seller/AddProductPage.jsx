import React, { useEffect, useState } from 'react';
import {
  Steps, Form, Input, InputNumber, Button, Card, Space,
  Table, message, Typography, Select, Divider, List, Avatar, Tag, Upload, Checkbox, Alert, Spin
} from 'antd';
import {
  InfoCircleOutlined, PictureOutlined, AppstoreAddOutlined,
  PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, CheckOutlined, UploadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import shopService from '../../services/shopService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const AddProductPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shop, setShop] = useState(null);
  const [fetchingShop, setFetchingShop] = useState(true);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => setCategories([]));
    
    setFetchingShop(true);
    shopService.getMyShop()
      .then(s => {
        setShop(s);
      })
      .catch((err) => {
        console.error(err);
        message.error("Không thể xác định thông tin gian hàng");
      })
      .finally(() => setFetchingShop(false));
  }, []);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const url = await productService.uploadImage(file);
      setImageUrls((prev) => [...prev, url]);
      message.success(`Tải ảnh ${file.name} thành công`);
    } catch (error) {
      message.error(error.message || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const removeImage = (url) => setImageUrls(imageUrls.filter(u => u !== url));

  const addVariant = () => setVariants((prev) => [...prev, { key: Date.now(), attributes: [{ key: 'Loại', value: '' }], price: form.getFieldValue('basePrice') || 0, stock: 0, sku: '' }]);
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

  const onFinish = async (values) => {
    if (!imageUrls.length) { message.warning('Cần ít nhất 1 hình ảnh'); setCurrentStep(1); return; }
    if (!variants.length) { message.warning('Cần ít nhất 1 biến thể sản phẩm'); setCurrentStep(2); return; }
    if (!shop?.id) { message.error('Không tìm thấy ID gian hàng. Vui lòng tải lại trang.'); return; }
    
    // Tính tổng tồn kho từ tất cả biến thể
    const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

    setLoading(true);
    try {
      const payload = {
        ...values,
        status: values.status || 'ACTIVE',
        imageUrls,
        stockQuantity: totalStock, // Bổ sung thông số bắt buộc này
        flashSaleEnabled: !!values.flashSaleEnabled,
        flashSalePrice: values.flashSaleEnabled ? values.flashSalePrice : null,
        flashSaleStartAt: values.flashSaleEnabled ? values.flashSaleStartAt : null,
        flashSaleEndAt: values.flashSaleEnabled ? values.flashSaleEndAt : null,
        variants: variants.map(({ key, attributes, ...rest }) => ({
          ...rest,
          attributes: JSON.stringify(Object.fromEntries(attributes.filter(a => a.key && a.value).map(a => [a.key, a.value]))),
        })),
      };
      await productService.createProduct(shop.id, payload);
      message.success('Đã tạo sản phẩm thành công và đang chờ duyệt!');
      navigate('/seller/products');
    } catch (error) {
      // Hiển thị chi tiết lỗi nếu có (ví dụ: "Tên sản phẩm quá ngắn")
      const errMsg = error.message || (typeof error === 'string' ? error : 'Dữ liệu đầu vào không hợp lệ');
      message.error(errMsg);
      
      // Nếu là lỗi validation ở một bước cụ thể, có thể tự động chuyển trang
      if (errMsg.includes('Ten san pham')) setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      if (currentStep === 0) await form.validateFields(['name', 'categoryId', 'description', 'basePrice']);
      setCurrentStep(currentStep + 1);
    } catch (err) { /* validation failed */ }
  };
  const prev = () => setCurrentStep(currentStep - 1);

  const steps = [
    {
      title: 'Thông tin', icon: <InfoCircleOutlined />,
      content: (
        <div style={{ padding: '10px 0' }}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}><Input size="large" /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
              <Select size="large" options={categories.map((item) => ({ value: item.id, label: item.name }))} placeholder="Chọn danh mục" />
            </Form.Item>
            <Form.Item name="basePrice" label="Giá gốc" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} size="large" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select size="large" options={[{ value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }]} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}><TextArea rows={5} /></Form.Item>
          <Card size="small" title="Flash sale" style={{ marginBottom: 16 }}>
            <Form.Item name="flashSaleEnabled" valuePropName="checked"><Checkbox>Kích hoạt flash sale</Checkbox></Form.Item>
            <Space style={{ width: '100%' }} align="start">
              <Form.Item name="flashSalePrice" label="Giá flash sale" style={{ flex: 1 }}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="flashSaleStartAt" label="Bắt đầu" style={{ flex: 1 }}><Input type="datetime-local" /></Form.Item>
              <Form.Item name="flashSaleEndAt" label="Kết thúc" style={{ flex: 1 }}><Input type="datetime-local" /></Form.Item>
            </Space>
          </Card>
        </div>
      )
    },
    {
      title: 'Hình ảnh', icon: <PictureOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Dragger beforeUpload={handleUpload} showUploadList={false} disabled={uploading}>
            <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: '48px', color: '#1677ff' }} /></p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào đây để tải lên</p>
          </Dragger>
          <List header={<Text strong>Danh sách ảnh ({imageUrls.length})</Text>} bordered dataSource={imageUrls}
            renderItem={(item) => (
              <List.Item actions={[<Button danger type="link" onClick={() => removeImage(item)}>Xóa</Button>]}>
                <List.Item.Meta avatar={<Avatar shape="square" size={64} src={item} />} description={item} />
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
          <Button icon={<PlusOutlined />} onClick={addVariant}>Thêm biến thể</Button>
          <Table rowKey="key" pagination={false} dataSource={variants} columns={[
            { title: 'Thuộc tính', render: (_, record) => (
              <Space direction="vertical">
                {record.attributes.map((attr, index) => (
                  <Space key={index}>
                    <Input value={attr.key} placeholder="Tên" onChange={(e) => updateAttribute(record.key, index, 'key', e.target.value)} />
                    <Input value={attr.value} placeholder="Giá trị" onChange={(e) => updateAttribute(record.key, index, 'value', e.target.value)} />
                    {record.attributes.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeAttribute(record.key, index)} />}
                  </Space>
                ))}
                <Button type="link" onClick={() => addAttribute(record.key)}>Thêm thuộc tính</Button>
              </Space>
            )},
            { title: 'Giá', render: (_, r) => <InputNumber min={1} value={r.price} onChange={(v) => updateVariant(r.key, 'price', v)} /> },
            { title: 'Kho', render: (_, r) => <InputNumber min={0} value={r.stock} onChange={(v) => updateVariant(r.key, 'stock', v)} /> },
            { title: 'SKU', render: (_, r) => <Input value={r.sku} onChange={(e) => updateVariant(r.key, 'sku', e.target.value)} /> },
            { title: '', render: (_, r) => <Button danger icon={<DeleteOutlined />} onClick={() => removeVariant(r.key)} /> },
          ]} />
        </Space>
      )
    }
  ];

  if (fetchingShop) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tải thông tin gian hàng..." /></div>;
  }

  if (!shop || shop.status !== 'APPROVED') {
    return (
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <Alert
          message={shop?.status === 'LOCKED' ? "Gian hàng đã bị khóa" : "Gian hàng chưa được duyệt"}
          description={
            <div>
              <p>Bạn không thể thêm sản phẩm mới khi gian hàng đang ở trạng thái: <b>{shop?.status || 'Chưa đăng ký'}</b></p>
              {shop?.rejectionReason && <p>Lý do: <i>{shop.rejectionReason}</i></p>}
              <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/seller/dashboard')}>
                Quay lại Dashboard
              </Button>
            </div>
          }
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'ACTIVE', flashSaleEnabled: false, basePrice: 1000 }}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Title level={3} style={{ marginBottom: '32px' }}>Thêm sản phẩm mới</Title>
          <Steps current={currentStep} items={steps.map(s => ({ title: s.title, icon: s.icon }))} style={{ marginBottom: '40px' }} />
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
              <Button type="primary" size="large" icon={<CheckOutlined />} loading={loading} onClick={() => form.submit()}>
                Hoàn tất & Đăng bán
              </Button>
            )}
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default AddProductPage;

import React, { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Form, Input, InputNumber, List, Select, Space, Table, Typography, Upload, message } from 'antd';
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { 
  Steps, Form, Input, InputNumber, Button, Card, Space, 
  Table, message, Typography, Select, Divider, List, Avatar, Spin, Tag, Upload
} from 'antd';
import { 
  InfoCircleOutlined, PictureOutlined, AppstoreAddOutlined, 
  PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, CheckOutlined, UploadOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [variants, setVariants] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([productService.getCategories(), productService.getProductById(id)])
      .then(([categoryData, product]) => {
        setCategories(categoryData);
        setImageUrls((product.images || []).map((item) => item.imageUrl));
        setVariants((product.variants || []).map((variant) => ({
          id: variant.id,
          key: variant.id,
          attributes: Object.entries(JSON.parse(variant.attributes || '{}')).map(([key, value]) => ({ key, value })),
          price: variant.price,
          stock: variant.stock,
          sku: variant.sku,
        })));
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Giả sử shopId = 1
  const shopId = 1;

  useEffect(() => {
    const initData = async () => {
      try {
        const [cats, product] = await Promise.all([
          productService.getCategories(),
          productService.getProductById(id)
        ]);
        
        setCategories(cats);
        
        // Fill form
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
      })
      .catch((error) => message.error(error.message || 'Khong the tai san pham'));
  }, [id, form]);

  const addVariant = () => setVariants((prev) => [...prev, { key: Date.now(), attributes: [{ key: 'Loai', value: '' }], price: form.getFieldValue('basePrice') || 0, stock: 0, sku: '' }]);
  const updateVariant = (key, field, value) => setVariants((prev) => prev.map((item) => item.key === key ? { ...item, [field]: value } : item));
  const updateAttribute = (key, index, field, value) => setVariants((prev) => prev.map((item) => {
    if (item.key !== key) return item;
    const attributes = [...item.attributes];
    attributes[index] = { ...attributes[index], [field]: value };
    return { ...item, attributes };
  }));
  const addAttribute = (key) => setVariants((prev) => prev.map((item) => item.key === key ? { ...item, attributes: [...item.attributes, { key: '', value: '' }] } : item));
  const removeVariant = (key) => setVariants((prev) => prev.filter((item) => item.key !== key));

  const handleUpload = async (file) => {
    try {
      const url = await productService.uploadImage(file);
      setImageUrls((prev) => [...prev, url]);
    } catch (error) {
      message.error(error.message || 'Tai anh that bai');
    }
    return false;
  };

  const onFinish = async (values) => {
    if (!imageUrls.length) {
      message.warning('Can it nhat 1 hinh anh san pham');
      return;
    }

    setSaving(true);
    try {
      const payload = normalizeProductPayload(values, imageUrls, variants);
      const updated = await productService.updateProduct(id, shopId, payload);
      message.success(`Da cap nhat san pham: ${updated.name}`);
      navigate('/seller/products');
    } catch (error) {
      message.error(error.message || 'Khong the cap nhat san pham');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <Card>
        <Title level={3}>Cap nhat san pham</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Ten san pham" rules={[{ required: true }]}><Input /></Form.Item>
          <Space style={{ width: '100%' }} align="start">
            <Form.Item name="categoryId" label="Danh muc" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={categories.map((item) => ({ value: item.id, label: item.name }))} />
            </Form.Item>
            <Form.Item name="basePrice" label="Gia goc" rules={[{ required: true }]} style={{ width: 240 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="Trang thai" rules={[{ required: true }]} style={{ width: 220 }}>
              <Select options={[{ value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }]} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="Mo ta" rules={[{ required: true }]}><TextArea rows={5} /></Form.Item>
          <Card size="small" title="Flash sale" style={{ marginBottom: 16 }}>
            <Form.Item name="flashSaleEnabled" valuePropName="checked"><Checkbox>Kich hoat flash sale</Checkbox></Form.Item>
            <Space style={{ width: '100%' }} align="start">
              <Form.Item name="flashSalePrice" label="Gia flash sale" style={{ flex: 1 }}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="flashSaleStartAt" label="Bat dau" style={{ flex: 1 }}><Input type="datetime-local" /></Form.Item>
              <Form.Item name="flashSaleEndAt" label="Ket thuc" style={{ flex: 1 }}><Input type="datetime-local" /></Form.Item>
            </Space>
          </Card>
          <Card size="small" title="Hinh anh" style={{ marginBottom: 16 }}>
            <Upload beforeUpload={handleUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Tai anh</Button>
            </Upload>
            <List
              style={{ marginTop: 12 }}
              dataSource={imageUrls}
              renderItem={(item) => (
                <List.Item actions={[<Button danger type="link" onClick={() => setImageUrls((prev) => prev.filter((url) => url !== item))}>Xoa</Button>]}>
                  <Text ellipsis>{item}</Text>
                </List.Item>
              )}
            />
          </Card>
          <Card size="small" title="Bien the">
            <Button icon={<PlusOutlined />} onClick={addVariant} style={{ marginBottom: 12 }}>Them bien the</Button>
            <Table
              rowKey="key"
              pagination={false}
              dataSource={variants}
              columns={[
                {
                  title: 'Thuoc tinh',
                  render: (_, record) => (
                    <Space direction="vertical">
                      {(record.attributes || [{ key: 'Loai', value: '' }]).map((attribute, index) => (
                        <Space key={`${record.key}-${index}`}>
                          <Input value={attribute.key} placeholder="Ten" onChange={(e) => updateAttribute(record.key, index, 'key', e.target.value)} />
                          <Input value={attribute.value} placeholder="Gia tri" onChange={(e) => updateAttribute(record.key, index, 'value', e.target.value)} />
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
          </Card>
          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => navigate('/seller/products')}>Huy</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>Luu</Button>
          </Space>
        </Form>
      </Card>
          description: product.description
        });
        
        // Fill images
        setImageUrls(product.images.map(img => img.imageUrl));
        
        // Fill variants
        setVariants(product.variants.map(v => {
          let parsedAttrs = [];
          try {
            const attrObj = JSON.parse(v.attributes || '{}');
            parsedAttrs = Object.entries(attrObj).map(([key, value]) => ({ key, value }));
            if (parsedAttrs.length === 0) parsedAttrs = [{ key: 'Màu sắc', value: '' }];
          } catch (e) {
            parsedAttrs = [{ key: 'Màu sắc', value: '' }];
          }
          
          return {
            key: v.id,
            attributes: parsedAttrs,
            price: v.price,
            stock: v.stock,
            sku: v.sku
          };
        }));
        
      } catch (error) {
        message.error('Không thể nạp dữ liệu sản phẩm: ' + error.message);
        navigate('/seller/products');
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id]);

  // --- LOGIC HÌNH ẢNH (CLOUDINARY) ---
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
    return false; // Prevent default upload behavior
  };

  const removeImage = (url) => {
    setImageUrls(imageUrls.filter(u => u !== url));
  };

  // --- LOGIC BIẾN THỂ ---
  const addVariant = () => {
    const newVariant = {
      key: Date.now(),
      attributes: [{ key: 'Màu sắc', value: '' }],
      price: form.getFieldValue('basePrice') || 0,
      stock: 0,
      sku: ''
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (key, field, value) => {
    setVariants(variants.map(v => v.key === key ? { ...v, [field]: value } : v));
  };

  const addAttribute = (variantKey) => {
    setVariants(variants.map(v => {
      if (v.key === variantKey) {
        return { ...v, attributes: [...v.attributes, { key: '', value: '' }] };
      }
      return v;
    }));
  };

  const updateAttribute = (variantKey, attrIndex, field, value) => {
    setVariants(variants.map(v => {
      if (v.key === variantKey) {
        const newAttrs = [...v.attributes];
        newAttrs[attrIndex] = { ...newAttrs[attrIndex], [field]: value };
        return { ...v, attributes: newAttrs };
      }
      return v;
    }));
  };

  const removeAttribute = (variantKey, attrIndex) => {
    setVariants(variants.map(v => {
      if (v.key === variantKey) {
        const newAttrs = v.attributes.filter((_, i) => i !== attrIndex);
        return { ...v, attributes: newAttrs.length > 0 ? newAttrs : [{ key: '', value: '' }] };
      }
      return v;
    }));
  };

  const removeVariant = (key) => {
    setVariants(variants.filter(v => v.key !== key));
  };

  // --- SUBMIT ---
  const handleFinish = async (values) => {
    if (imageUrls.length === 0) {
      message.error('Cần ít nhất 1 hình ảnh sản phẩm');
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        imageUrls: imageUrls,
        variants: variants.map(({ key, attributes, ...v }) => {
          const attrObj = {};
          attributes.forEach(attr => {
            if (attr.key && attr.value) {
              attrObj[attr.key] = attr.value;
            }
          });
          return {
            ...v,
            attributes: JSON.stringify(attrObj)
          };
        })
      };
      await productService.updateProduct(id, shopId, payload);
      message.success('Cập nhật sản phẩm thành công!');
      navigate('/seller/products');
    } catch (error) {
      if (error.code === 400 && error.result) {
        message.error({
          content: (
            <div style={{ textAlign: 'left' }}>
              <strong>Dữ liệu không hợp lệ:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                {Object.entries(error.result).map(([field, msg]) => (
                  <li key={field}>{msg}</li>
                ))}
              </ul>
            </div>
          ),
          duration: 5
        });
      } else {
        message.error('Lỗi khi cập nhật sản phẩm: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'categoryId', 'description', 'basePrice']);
      }
      setCurrentStep(currentStep + 1);
    } catch (err) {}
  };

  const prev = () => setCurrentStep(currentStep - 1);

  if (fetching) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  const steps = [
    {
      title: 'Thông tin',
      icon: <InfoCircleOutlined />,
      content: (
        <div style={{ padding: '10px 0' }}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, min: 10, max: 200 }]}>
            <Input size="large" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
              <Select size="large">
                {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item 
              name="basePrice" 
              label="Giá cơ bản (VNĐ)" 
              rules={[
                { required: true, message: 'Nhập giá' },
                { type: 'number', min: 1, message: 'Giá phải lớn hơn 0' }
              ]}
            >
              <InputNumber style={{ width: '100%' }} min={1} size="large" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả sản phẩm" rules={[{ required: true }]}>
            <TextArea rows={6} />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Hình ảnh',
      icon: <PictureOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card 
            style={{ textAlign: 'center', backgroundColor: '#fafafa' }} 
            styles={{ body: { padding: '40px' } }}
          >
            <Dragger
              beforeUpload={handleUpload}
              showUploadList={false}
              multiple={false}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: '48px', color: '#1677ff' }} />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào đây để tải lên</p>
              <p className="ant-upload-hint">Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 10MB.</p>
            </Dragger>
          </Card>

          <List
            header={<Text strong>Danh sách ảnh ({imageUrls.length})</Text>}
            bordered
            dataSource={imageUrls}
            renderItem={(item, index) => (
              <List.Item
                actions={[<Button type="link" danger icon={<DeleteOutlined />} onClick={() => removeImage(item)} />]}
              >
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
      title: 'Biến thể',
      icon: <AppstoreAddOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addVariant}>Thêm phân loại</Button>
          </div>
          <Table 
            dataSource={variants} 
            rowKey="key"
            pagination={false}
            columns={[
              {
                title: 'Thuộc tính',
                dataIndex: 'attributes',
                width: 400,
                render: (attrs, record) => (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {attrs.map((attr, index) => (
                      <Space key={index} style={{ marginBottom: 4 }}>
                        <Input 
                          placeholder="Tên" 
                          value={attr.key} 
                          onChange={e => updateAttribute(record.key, index, 'key', e.target.value)}
                          style={{ width: 120 }}
                        />
                        <Input 
                          placeholder="Giá trị" 
                          value={attr.value} 
                          onChange={e => updateAttribute(record.key, index, 'value', e.target.value)}
                          style={{ width: 150 }}
                        />
                        {attrs.length > 1 && (
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => removeAttribute(record.key, index)} 
                          />
                        )}
                      </Space>
                    ))}
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<PlusOutlined />} 
                      onClick={() => addAttribute(record.key)}
                      style={{ padding: 0 }}
                    >
                      Thêm thuộc tính
                    </Button>
                  </Space>
                )
              },
              {
                title: 'Giá',
                dataIndex: 'price',
                width: 140,
                render: (val, record) => (
                  <InputNumber 
                    value={val} 
                    onChange={val => updateVariant(record.key, 'price', val)} 
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={value => value.replace(/\./g, '')}
                  />
                )
              },
              {
                title: 'Kho',
                dataIndex: 'stock',
                width: 100,
                render: (val, record) => <InputNumber min={0} value={val} onChange={val => updateVariant(record.key, 'stock', val)} style={{ width: '100%' }} />
              },
              {
                title: 'SKU',
                dataIndex: 'sku',
                render: (val, record) => <Input value={val} onChange={e => updateVariant(record.key, 'sku', e.target.value)} placeholder="Mã sp" />
              },
              {
                title: '',
                key: 'action',
                width: 50,
                render: (_, record) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeVariant(record.key)} />
              }
            ]}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleFinish}
      >
        <Card bordered={false} className="premium-card">
          <Title level={3} style={{ marginBottom: '32px' }}>Chỉnh sửa sản phẩm</Title>
          <Steps current={currentStep} items={steps} style={{ marginBottom: '40px' }} />
          <Divider />
          <div style={{ minHeight: '300px', marginBottom: '40px' }}>
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              {steps[0].content}
            </div>
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              {steps[1].content}
            </div>
            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
              {steps[2].content}
            </div>
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

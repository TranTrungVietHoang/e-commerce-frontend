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
const { Dragger } = Upload;

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

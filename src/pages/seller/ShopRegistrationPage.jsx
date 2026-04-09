import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Result, Upload, Alert } from 'antd';
import { ShopOutlined, CheckCircleOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import shopService from '../../services/shopService';
import productService from '../../services/productService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ShopRegistrationPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [existingShop, setExistingShop] = useState(null);
  
  const [logoLoading, setLogoLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  
  const navigate = useNavigate();

  // Kiểm tra xem user đã có shop chưa
  useEffect(() => {
    const checkExistingShop = async () => {
      try {
        const shop = await shopService.getMyShop();
        setExistingShop(shop);
        
        if (shop.status === 'PENDING') {
          setSubmitted(true);
        } else if (shop.status === 'REJECTED') {
          // Điền dữ liệu cũ vào form để user sửa và gửi lại
          form.setFieldsValue({
            name: shop.name,
            description: shop.description,
            logoUrl: shop.logoUrl,
            bannerUrl: shop.bannerUrl
          });
          setLogoUrl(shop.logoUrl);
          setBannerUrl(shop.bannerUrl);
        } else if (shop.status === 'APPROVED') {
          navigate('/seller/shop'); // Đã có shop thì vào dashboard luôn
        }
      } catch (err) {
        // Lỗi 404 là bình thường (chưa có shop)
        console.log("Chưa có gian hàng cũ");
      } finally {
        setInitLoading(false);
      }
    };
    checkExistingShop();
  }, [form, navigate]);

  const handleUpload = async (file, type) => {
    try {
      if (type === 'logo') setLogoLoading(true);
      else setBannerLoading(true);

      const result = await productService.uploadImage(file);
      const url = result;
      
      if (type === 'logo') {
        setLogoUrl(url);
        form.setFieldsValue({ logoUrl: url });
      } else {
        setBannerUrl(url);
        form.setFieldsValue({ bannerUrl: url });
      }
      message.success(`Tải ${type === 'logo' ? 'Logo' : 'Banner'} thành công!`);
    } catch (error) {
      console.error('Upload Error:', error);
      message.error(error?.message || 'Lỗi tải ảnh');
    } finally {
      if (type === 'logo') setLogoLoading(false);
      else setBannerLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await shopService.registerShop(values);
      message.success('Đã gửi lại yêu cầu đăng ký gian hàng! Vui lòng chờ admin phê duyệt.');
      setSubmitted(true);
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra khi đăng ký gian hàng');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><LoadingOutlined style={{ fontSize: 40 }} /><br/>Đang tải dữ liệu...</div>;
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
        <Card style={{ maxWidth: 600, width: '100%', borderRadius: 16 }}>
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Đăng ký gian hàng thành công"
            subTitle="Yêu cầu mở gian hàng của bạn đã được gửi. Quản trị viên sẽ tiến hành phê duyệt trong thời gian sớm nhất."
            extra={[
              <Button type="primary" key="home" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
      <Card
        style={{ maxWidth: 600, width: '100%', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Space direction="vertical" align="center" style={{ width: '100%', marginBottom: 24 }}>
          <ShopOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <Title level={3} style={{ margin: 0 }}>Đăng ký Gian hàng</Title>
          <Text type="secondary">Bắt đầu kinh doanh cùng A+ Marketplace ngay hôm nay!</Text>
        </Space>

        {existingShop?.status === 'REJECTED' && (
          <Alert
            message="Yêu cầu trước đó bị từ chối"
            description={
              <div>
                <div style={{ fontWeight: 'bold' }}>Lý do: {existingShop.rejectionReason || 'Không có lý do cụ thể'}</div>
                <div>Vui lòng chỉnh sửa thông tin bên dưới và gửi lại yêu cầu.</div>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            label="Tên gian hàng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên gian hàng!' },
              { min: 3, message: 'Tên gian hàng phải từ 3 ký tự trở lên' }
            ]}
          >
            <Input size="large" placeholder="Ví dụ: A+ Store" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả gian hàng"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả cho gian hàng!' }
            ]}
          >
            <Input.TextArea size="large" rows={4} placeholder="Giới thiệu nhanh về các sản phẩm bạn sẽ bán..." />
          </Form.Item>

          <Form.Item
            name="logoUrl"
            label="Logo Gian hàng (Ảnh chọn từ máy)"
            rules={[{ required: true, message: 'Vui lòng tải lên Logo gian hàng!' }]}
            valuePropName="file" // Tránh truyền 'value' vào Upload
          >
            <Upload
              name="logo"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                handleUpload(file, 'logo');
                return false; // Chặn upload tự động của antd
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="logo" style={{ width: '100%', borderRadius: 8 }} />
              ) : (
                <div>
                  {logoLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Tải Logo</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="bannerUrl"
            label="Banner Gian hàng (Ảnh chọn từ máy)"
            rules={[{ required: true, message: 'Vui lòng tải lên Banner gian hàng!' }]}
            valuePropName="file" // Tránh truyền 'value' vào Upload
          >
            <Upload
              name="banner"
              listType="picture"
              showUploadList={false}
              beforeUpload={(file) => {
                handleUpload(file, 'banner');
                return false;
              }}
            >
              {bannerUrl ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={bannerUrl} alt="banner" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', opacity: 0, transition: '0.3s', borderRadius: 8 }}>
                    <Text style={{ color: 'white' }}>Thay đổi</Text>
                  </div>
                </div>
              ) : (
                <Button icon={bannerLoading ? <LoadingOutlined /> : <PlusOutlined />} block style={{ height: 100, borderStyle: 'dashed' }}>
                  {bannerLoading ? 'Đang tải...' : 'Bấm để tải Banner (Kích thước gợi ý 1200x300)'}
                </Button>
              )}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Đăng ký ngay
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ShopRegistrationPage;

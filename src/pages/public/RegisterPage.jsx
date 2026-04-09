import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authService.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || null,
      });
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      message.error(err?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 460, boxShadow: '0 4px 24px rgba(0,0,0,.08)', borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0 }}>Tạo tài khoản mới</Title>
          <Text type="secondary">Tham gia A+ Marketplace ngay hôm nay!</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="fullName" label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }, { min: 5, message: 'Tối thiểu 5 ký tự' }, { max: 100, message: 'Tối đa 100 ký tự' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item name="email" label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không đúng định dạng' }]}>
            <Input prefix={<MailOutlined />} placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 8, message: 'Tối thiểu 8 ký tự' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, message: 'Cần ít nhất 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt' },
            ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item name="confirmPassword" label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại (tuỳ chọn)"
            rules={[{ pattern: /^(03|05|07|08|09)\d{8}$/, message: 'SĐT phải đúng đầu số VN (10 chữ số)' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>Đăng ký</Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">Đã có tài khoản? </Text>
          <Link to="/login">Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;

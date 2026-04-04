  import React from 'react';
  import { Form, Input, Button, Card, Typography, Divider, Space, message } from 'antd';
  import { UserOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
  import { Link, useNavigate, useLocation } from 'react-router-dom';
  import { useAuth } from '../../context/AuthContext';

  const { Title, Text } = Typography;

  const LoginPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();

    const from = location.state?.from?.pathname || '/';

    const onFinish = async (values) => {
      setLoading(true);
      try {
        const data = await login(values);
        message.success('Đăng nhập thành công!');
        if (data.roles?.includes('ROLE_ADMIN')) navigate('/admin/users', { replace: true });
        else navigate(from, { replace: true });
      } catch (err) {
        message.error(err?.message || 'Sai email hoặc mật khẩu');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Card style={{ width: 420, boxShadow: '0 4px 24px rgba(0,0,0,.08)', borderRadius: 12 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={3} style={{ margin: 0 }}>Đăng nhập</Title>
            <Text type="secondary">Chào mừng trở lại A+ Marketplace!</Text>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <Button type="primary" htmlType="submit" block loading={loading}>Đăng nhập</Button>
          </Form>

          <Divider plain>hoặc</Divider>

          {/* OAuth2 */}
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              icon={<GoogleOutlined />} 
              block 
              onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            >
              Đăng nhập bằng Google
            </Button>
            <Button icon={<GithubOutlined />} block disabled>Đăng nhập bằng GitHub (Sắp ra mắt)</Button>
          </Space>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text type="secondary">Chưa có tài khoản? </Text>
            <Link to="/register">Đăng ký ngay</Link>
          </div>
        </Card>
      </div>
    );
  };

  export default LoginPage;

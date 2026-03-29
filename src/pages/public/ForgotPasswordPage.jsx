import React, { useState, useRef } from 'react';
import { Form, Input, Button, Card, Typography, Steps, message, Alert, Statistic } from 'antd';
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const ForgotPasswordPage = () => {
  const [step, setStep]           = useState(0); // 0=email, 1=otp+newpw
  const [loading, setLoading]     = useState(false);
  const [email, setEmail]         = useState('');
  const [otpDeadline, setOtpDeadline] = useState(null);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const navigate = useNavigate();

  // Bước 1: gửi OTP
  const handleSendOtp = async ({ email: emailVal }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(emailVal);
      setEmail(emailVal);
      setOtpDeadline(Date.now() + 5 * 60 * 1000); // 5 phút
      message.success('Mã OTP đã được gửi đến email của bạn!');
      setStep(1);
    } catch (err) {
      message.error(err?.message || 'Không thể gửi OTP. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: đặt lại mật khẩu
  const handleReset = async (values) => {
    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp: values.otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      message.error(err?.message || 'OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 460, boxShadow: '0 4px 24px rgba(0,0,0,.08)', borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Title level={3} style={{ margin: 0 }}>Quên mật khẩu</Title>
          <Text type="secondary">Chúng tôi sẽ gửi mã OTP qua email</Text>
        </div>

        <Steps current={step} items={[{ title: 'Nhập email' }, { title: 'OTP & Mật khẩu mới' }]} style={{ marginBottom: 32 }} />

        {step === 0 && (
          <Form form={form1} layout="vertical" onFinish={handleSendOtp} size="large">
            <Form.Item name="email" label="Email"
              rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
              <Input prefix={<MailOutlined />} placeholder="email@example.com" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>Gửi mã OTP</Button>
          </Form>
        )}

        {step === 1 && (
          <>
            <Alert
              message={<>Mã OTP đã gửi đến <strong>{email}</strong>. Hết hạn sau: <Countdown value={otpDeadline} format="mm:ss" valueStyle={{ fontSize: 14, color: '#ff4d4f', display: 'inline' }} onFinish={() => message.warning('OTP đã hết hạn, vui lòng gửi lại')} /></>}
              type="info" showIcon style={{ marginBottom: 24 }}
            />
            <Form form={form2} layout="vertical" onFinish={handleReset} size="large">
              <Form.Item name="otp" label="Mã OTP (6 chữ số)"
                rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }, { len: 6, message: 'OTP gồm 6 chữ số' }]}>
                <Input prefix={<SafetyCertificateOutlined />} placeholder="123456" maxLength={6} />
              </Form.Item>
              <Form.Item name="newPassword" label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 8, message: 'Tối thiểu 8 ký tự' },
                  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, message: 'Cần ít nhất 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt' },
                ]}>
                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
              </Form.Item>
              <Form.Item name="confirmPassword" label="Xác nhận mật khẩu"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                    },
                  }),
                ]}>
                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>Đặt lại mật khẩu</Button>
              <Button type="link" block onClick={() => setStep(0)} style={{ marginTop: 8 }}>Gửi lại OTP</Button>
            </Form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

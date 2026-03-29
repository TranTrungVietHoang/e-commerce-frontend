import React, { useEffect, useState } from 'react';
import {
  Avatar, Button, Card, Divider, Form, Input, Tabs, Tag, Typography,
  message, Spin, Space, Upload,
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined, PhoneOutlined,
  EditOutlined, SaveOutlined, LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const { Title, Text } = Typography;

// ── Tab 1: Thông tin cá nhân ─────────────────────────────────────────────────
const ProfileTab = ({ user, onUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await userService.getProfile();
        form.setFieldsValue({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || '',
        });
      } catch (err) {
        message.error('Không thể tải thông tin. Vui lòng thử lại.');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await userService.updateProfile({
        fullName: values.fullName,
        phone: values.phone || null,
        avatarUrl: values.avatarUrl || null,
      });
      message.success('Cập nhật thông tin thành công!');
      if (onUpdated) onUpdated();
    } catch (err) {
      message.error(err?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} size="large" style={{ maxWidth: 520 }}>
      <Form.Item name="email" label="Email">
        <Input prefix={<MailOutlined />} disabled style={{ background: '#f5f5f5' }} />
      </Form.Item>

      <Form.Item name="fullName" label="Họ và tên"
        rules={[
          { required: true, message: 'Vui lòng nhập họ tên' },
          { min: 5, message: 'Tối thiểu 5 ký tự' },
          { max: 100, message: 'Tối đa 100 ký tự' },
        ]}>
        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
      </Form.Item>

      <Form.Item name="phone" label="Số điện thoại"
        rules={[{ pattern: /^(03|05|07|08|09)\d{8}$/, message: 'SĐT phải đúng đầu số VN (10 chữ số)' }]}>
        <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
      </Form.Item>

      <Form.Item name="avatarUrl" label="URL Ảnh đại diện">
        <Input prefix={<EditOutlined />} placeholder="https://..." />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
        Lưu thay đổi
      </Button>
    </Form>
  );
};

// ── Tab 2: Đổi mật khẩu ──────────────────────────────────────────────────────
const ChangePasswordTab = ({ onPasswordChanged }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await userService.changePassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      form.resetFields();
      // Chờ 1.5s để người dùng thấy thông báo rồi mới logout
      setTimeout(() => { if (onPasswordChanged) onPasswordChanged(); }, 1500);
    } catch (err) {
      message.error(err?.message || 'Đổi mật khẩu thất bại. Kiểm tra mật khẩu hiện tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} size="large" style={{ maxWidth: 520 }}>
      <Form.Item name="currentPassword" label="Mật khẩu hiện tại"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
      </Form.Item>

      <Form.Item name="newPassword" label="Mật khẩu mới"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu mới' },
          { min: 8, message: 'Tối thiểu 8 ký tự' },
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, message: 'Cần ít nhất 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt' },
        ]}>
        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
      </Form.Item>

      <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới"
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

      <Button type="primary" danger htmlType="submit" loading={loading} icon={<LockOutlined />}>
        Đổi mật khẩu
      </Button>
    </Form>
  );
};

// ── Main ProfilePage ──────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChanged = async () => {
    await logout();
    navigate('/login');
  };

  const roleColor = (role) => {
    if (role?.includes('ADMIN')) return 'red';
    if (role?.includes('SELLER')) return 'blue';
    return 'green';
  };

  return (
    <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 24px' }}>
      {/* Header card */}
      <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <Space size={20} align="center">
          <Avatar
            size={80}
            src={user?.avatarUrl}
            icon={!user?.avatarUrl && <UserOutlined />}
            style={{ backgroundColor: '#1677ff', fontSize: 32 }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>{user?.fullName}</Title>
            <Text type="secondary">{user?.email}</Text>
            <div style={{ marginTop: 8 }}>
              {user?.roles?.map((role) => (
                <Tag key={role} color={roleColor(role)} style={{ marginRight: 4 }}>
                  {role.replace('ROLE_', '')}
                </Tag>
              ))}
            </div>
          </div>
        </Space>
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <Tabs
          size="large"
          items={[
            {
              key: 'profile',
              label: <span><UserOutlined /> Thông tin cá nhân</span>,
              children: <ProfileTab user={user} />,
            },
            {
              key: 'password',
              label: <span><LockOutlined /> Đổi mật khẩu</span>,
              children: <ChangePasswordTab onPasswordChanged={handlePasswordChanged} />,
            },
          ]}
        />
      </Card>

      {/* Logout button */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button
          icon={<LogoutOutlined />}
          danger
          onClick={async () => { await logout(); navigate('/login'); }}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;

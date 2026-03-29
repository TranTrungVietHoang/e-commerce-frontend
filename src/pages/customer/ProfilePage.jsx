import React, { useEffect, useState, useCallback } from 'react';
import {
  Avatar, Button, Card, Form, Input, Tabs, Tag, Typography,
  message, Spin, Space, Upload,
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined, PhoneOutlined,
  SaveOutlined, LogoutOutlined, CameraOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const { Title, Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// ProfilePage: toàn bộ avatarUrl state quản lý ở đây, truyền xuống con
// ─────────────────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, logout, updateAvatar } = useAuth();
  const navigate = useNavigate();

  // State chia sẻ cho cả header card + AvatarUpload
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load profile 1 lần khi mount để lấy avatarUrl mới nhất từ DB
  useEffect(() => {
    userService.getProfile()
      .then((data) => {
        const url = data?.avatarUrl || '';
        setAvatarUrl(url);
        // Đồng bộ vào AuthContext nếu khác nhau
        if (url && url !== user?.avatarUrl) updateAvatar(url);
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, []);

  // Gọi khi upload thành công: cập nhật TẤT CẢ nơi hiển thị avatar
  const handleAvatarUploaded = useCallback((url) => {
    setAvatarUrl(url);      // cập nhật header card trong trang
    updateAvatar(url);      // cập nhật navbar góc phải (AuthContext → App.jsx)
  }, [updateAvatar]);

  const handlePasswordChanged = async () => {
    await logout();
    navigate('/login');
  };

  const roleColor = (role) => {
    if (role?.includes('ADMIN'))  return 'red';
    if (role?.includes('SELLER')) return 'blue';
    return 'green';
  };

  return (
    <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 24px' }}>

      {/* ── Header card ─────────────────────────────────────────────────── */}
      <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <Space size={20} align="center">
          <Avatar
            size={80}
            src={avatarUrl || null}
            icon={!avatarUrl && <UserOutlined />}
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

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <Tabs
          size="large"
          items={[
            {
              key: 'profile',
              label: <span><UserOutlined /> Thông tin cá nhân</span>,
              children: (
                <ProfileTab
                  avatarUrl={avatarUrl}
                  onAvatarUploaded={handleAvatarUploaded}
                />
              ),
            },
            {
              key: 'password',
              label: <span><LockOutlined /> Đổi mật khẩu</span>,
              children: <ChangePasswordTab onPasswordChanged={handlePasswordChanged} />,
            },
          ]}
        />
      </Card>

      {/* ── Logout ──────────────────────────────────────────────────────── */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1: Thông tin cá nhân
// avatarUrl + onAvatarUploaded truyền từ ProfilePage xuống
// ─────────────────────────────────────────────────────────────────────────────
const ProfileTab = ({ avatarUrl, onAvatarUploaded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    userService.getProfile()
      .then((data) => {
        form.setFieldsValue({
          fullName: data.fullName,
          email:    data.email,
          phone:    data.phone || '',
        });
      })
      .catch(() => message.error('Không thể tải thông tin.'))
      .finally(() => setFetching(false));
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await userService.updateProfile({
        fullName: values.fullName,
        phone:    values.phone || null,
        avatarUrl: avatarUrl || null,
      });
      message.success('Cập nhật thông tin thành công!');
    } catch (err) {
      message.error(err?.message || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      {/* Avatar click-to-upload */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <AvatarUpload avatarUrl={avatarUrl} onUploaded={onAvatarUploaded} />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Bấm vào ảnh để thay đổi · Tối đa 5MB
          </Text>
        </div>
      </div>

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

        <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
          Lưu thay đổi
        </Button>
      </Form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AvatarUpload: nhận avatarUrl làm controlled prop từ ProfilePage
// ─────────────────────────────────────────────────────────────────────────────
const AvatarUpload = ({ avatarUrl, onUploaded }) => {
  const [uploading, setUploading] = useState(false);

  const beforeUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('Chỉ chấp nhận file ảnh (jpg, png, webp...)');
      return false;
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error('Ảnh không được vượt quá 5MB');
      return false;
    }

    setUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      // Interceptor unwrap: result = { avatarUrl: "https://..." }
      // Nhưng đảm bảo lấy đúng dù server trả về dạng nào
      const url = (typeof res === 'string') ? res
                : res?.avatarUrl || res?.result?.avatarUrl || '';

      if (!url) throw new Error('Không nhận được URL ảnh từ máy chủ');

      message.success('Tải ảnh thành công!');
      if (onUploaded) onUploaded(url);  // báo lên ProfilePage → cập nhật TẤT CẢ
    } catch (err) {
      message.error(err?.message || 'Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
    return false;
  };

  return (
    <Upload showUploadList={false} beforeUpload={beforeUpload} accept="image/*">
      <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
        <Avatar
          size={96}
          src={avatarUrl || null}
          icon={!avatarUrl && (uploading ? <LoadingOutlined /> : <UserOutlined />)}
          style={{ backgroundColor: '#1677ff', fontSize: 36 }}
        />
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          background: 'rgba(0,0,0,0.6)', borderRadius: '50%',
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {uploading
            ? <LoadingOutlined  style={{ color: '#fff', fontSize: 13 }} />
            : <CameraOutlined   style={{ color: '#fff', fontSize: 13 }} />
          }
        </div>
      </div>
    </Upload>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: Đổi mật khẩu
// ─────────────────────────────────────────────────────────────────────────────
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

export default ProfilePage;

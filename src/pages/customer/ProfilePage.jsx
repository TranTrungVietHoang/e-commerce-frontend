import React, { useEffect, useState, useCallback } from 'react';
import {
  Avatar, Button, Card, Form, Input, Tabs, Tag, Typography,
  message, Spin, Space, Upload, Progress, List, Timeline, Empty
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined, PhoneOutlined,
  SaveOutlined, LogoutOutlined, CameraOutlined, LoadingOutlined,
  TrophyOutlined, StarOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import loyaltyService from '../../services/loyaltyService';

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
              key: 'loyalty',
              label: <span><TrophyOutlined /> Điểm thưởng</span>,
              children: <LoyaltyTab />,
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

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3: Điểm Thưởng Loyalty
// ─────────────────────────────────────────────────────────────────────────────
const RANK_CONFIG = {
  BRONZE:   { color: '#cd7f32', label: 'Đồng',    icon: '🥉', next: 500,   nextLabel: 'Bạc' },
  SILVER:   { color: '#a0a0a0', label: 'Bạc',     icon: '🥈', next: 2000,  nextLabel: 'Vàng' },
  GOLD:     { color: '#ffd700', label: 'Vàng',    icon: '🥇', next: 5000,  nextLabel: 'Bạch Kim' },
  PLATINUM: { color: '#e5e4e2', label: 'Bạch Kim',icon: '💎', next: null,  nextLabel: null },
};

const LoyaltyTab = () => {
  const [points, setPoints]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loyaltyService.getMyPoints().catch(() => null),
      loyaltyService.getPointHistory().catch(() => []),
    ]).then(([pts, hist]) => {
      setPoints(pts);
      setHistory(Array.isArray(hist) ? hist : (hist?.content || []));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  const rank = RANK_CONFIG[points?.membershipRank] || RANK_CONFIG.BRONZE;
  const currentPts = points?.totalPoints || 0;
  const progressPercent = rank.next
    ? Math.min(100, Math.round((currentPts / rank.next) * 100))
    : 100;

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Rank Card */}
      <Card
        style={{
          marginBottom: 20, borderRadius: 16, overflow: 'hidden',
          background: `linear-gradient(135deg, ${rank.color}22 0%, #ffffff 100%)`,
          border: `2px solid ${rank.color}44`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 48 }}>{rank.icon}</div>
          <div>
            <Tag color={rank.color} style={{ fontWeight: 700, fontSize: 14, border: `1px solid ${rank.color}` }}>
              Hạng {rank.label}
            </Tag>
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 36, fontWeight: 900, color: rank.color }}>{currentPts.toLocaleString()}</Text>
              <Text type="secondary" style={{ marginLeft: 6 }}>điểm</Text>
            </div>
          </div>
        </div>

        {rank.next && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Hạng {rank.label}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>Hạng {rank.nextLabel} ({rank.next.toLocaleString()} điểm)</Text>
            </div>
            <Progress
              percent={progressPercent}
              strokeColor={{ from: rank.color, to: '#1677ff' }}
              showInfo={false}
              strokeWidth={10}
              style={{ borderRadius: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4, textAlign: 'right' }}>
              Còn {(rank.next - currentPts).toLocaleString()} điểm để lên hạng {rank.nextLabel}
            </Text>
          </>
        )}
        {!rank.next && (
          <Tag color="gold" style={{ fontWeight: 600 }}>🎉 Bạn đã đạt hạng cao nhất!</Tag>
        )}
      </Card>

      {/* Lịch sử điểm */}
      <Title level={5} style={{ marginBottom: 12 }}><HistoryOutlined /> Lịch sử tích điểm</Title>
      {history.length === 0 ? (
        <Empty description="Chưa có lịch sử điểm. Hãy mua sắm để tích lũy điểm!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Timeline
          items={history.slice(0, 10).map((h) => ({
            color: h.points > 0 ? 'green' : 'red',
            children: (
              <div>
                <Text strong style={{ color: h.points > 0 ? '#52c41a' : '#f5222d' }}>
                  {h.points > 0 ? '+' : ''}{h.points} điểm
                </Text>
                <Text style={{ marginLeft: 8, fontSize: 13 }}>{h.note || h.description}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                  {h.createdAt ? new Date(h.createdAt).toLocaleString('vi-VN') : ''}
                </Text>
              </div>
            ),
          }))}
        />
      )}
    </div>
  );
};

export default ProfilePage;


import React, { useEffect, useState, useCallback } from 'react';
import { Badge, Tooltip, Dropdown, List, Button, Typography, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import notificationService from '../../services/notificationService';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

const NotificationDropdown = () => {
  const { user, isAuthenticated } = useAuth();
  const { subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      const list = Array.isArray(data) ? data : (data?.content || []);
      setNotifications(list);
      setUnread(list.filter(n => !n.isRead).length);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  // Real-time: nhận thông báo mới qua WebSocket
  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;
    const unsubscribe = subscribe(
      `/user/${user.userId}/queue/notifications`,
      (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnread((prev) => prev + 1);
      }
    );
    return unsubscribe;
  }, [isAuthenticated, user?.userId, subscribe]);

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* ignore */ }
  };

  const handleMarkOne = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const dropdownContent = (
    <div style={{
      width: 340, maxHeight: 440, overflowY: 'auto',
      background: '#fff', borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text strong style={{ fontSize: 15 }}>🔔 Thông báo</Text>
        {unread > 0 && (
          <Button size="small" type="link" icon={<CheckOutlined />} onClick={handleMarkAll}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : notifications.length === 0 ? (
        <Empty description="Không có thông báo" style={{ padding: 32 }} />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              onClick={() => !item.isRead && handleMarkOne(item.id)}
              style={{
                padding: '10px 16px', cursor: 'pointer',
                background: item.isRead ? '#fff' : '#f0f7ff',
                transition: 'background 0.2s',
              }}
            >
              <List.Item.Meta
                title={
                  <Text style={{ fontSize: 13, fontWeight: item.isRead ? 400 : 600 }}>
                    {item.message || item.content}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                  </Text>
                }
              />
              {!item.isRead && (
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#1677ff', flexShrink: 0,
                }} />
              )}
            </List.Item>
          )}
        />
      )}
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <Dropdown
      open={open}
      onOpenChange={(val) => { setOpen(val); if (val) fetchNotifications(); }}
      dropdownRender={() => dropdownContent}
      placement="bottomRight"
      trigger={['click']}
    >
      <Tooltip title="Thông báo">
        <Badge count={unread} size="small" offset={[-4, 4]}>
          <BellOutlined
            style={{ fontSize: 20, color: '#fff', cursor: 'pointer', padding: '0 8px' }}
          />
        </Badge>
      </Tooltip>
    </Dropdown>
  );
};

export default NotificationDropdown;

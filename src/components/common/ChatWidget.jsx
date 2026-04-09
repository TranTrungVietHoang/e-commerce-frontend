import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Avatar, Badge, Button, Input, List, Typography, Spin, Empty, Tooltip
} from 'antd';
import {
  MessageOutlined, CloseOutlined, SendOutlined,
  UserOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import chatService from '../../services/chatService';

const { Text } = Typography;

const ChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const { subscribe } = useWebSocket();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null); // { userId, fullName, avatarUrl }
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const messagesEndRef = useRef(null);

  // Cuộn xuống cuối mỗi khi messages thay đổi
  useEffect(() => {
    if (open && activeConv) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, activeConv]);

  // Load danh sách cuộc trò chuyện
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await chatService.getConversations();
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
      setUnreadTotal(list.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => {
    if (open) loadConversations();
  }, [open, loadConversations]);

  // Load lịch sử chat khi chọn cuộc trò chuyện
  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMessages([]);
    setLoading(true);
    try {
      const data = await chatService.getHistory(conv.userId);
      const list = Array.isArray(data) ? data : (data?.content || []);
      setMessages(list.reverse());
      await chatService.markAllRead(conv.userId);
      setConversations((prev) =>
        prev.map((c) => c.userId === conv.userId ? { ...c, unreadCount: 0 } : c)
      );
      setUnreadTotal((prev) => Math.max(0, prev - (conv.unreadCount || 0)));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  // Real-time: nhận tin nhắn mới qua WebSocket
  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;
    const unsubscribe = subscribe(
      `/user/${user.userId}/queue/messages`,
      (newMsg) => {
        if (activeConv && newMsg.senderId === activeConv.userId) {
          // Đang mở đúng conversation → thêm vào cuối
          setMessages((prev) => [...prev, newMsg]);
        } else {
          // Conversation khác → tăng unread count
          setUnreadTotal((prev) => prev + 1);
          setConversations((prev) =>
            prev.map((c) =>
              c.userId === newMsg.senderId
                ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: newMsg.message }
                : c
            )
          );
        }
      }
    );
    return unsubscribe;
  }, [isAuthenticated, user?.userId, subscribe, activeConv]);

  const sendMessage = async () => {
    const msg = inputVal.trim();
    if (!msg || !activeConv) return;
    setSending(true);
    try {
      const sent = await chatService.sendMessage(activeConv.userId, msg);
      setMessages((prev) => [...prev, sent]);
      setInputVal('');
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  if (!isAuthenticated) return null;

  // ── Styles ────────────────────────────────────────────────────────────────
  const baseWidgetStyle = {
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
  };
  const panelStyle = {
    position: 'fixed', bottom: 88, right: 24, zIndex: 9999,
    width: 340, height: 480, borderRadius: 16,
    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
    background: '#fff', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', border: '1px solid #e8e8e8',
    animation: 'slideUp 0.25s ease',
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Floating Button */}
      <div style={baseWidgetStyle}>
        <Badge count={unreadTotal} size="small">
          <button
            onClick={() => { setOpen((o) => !o); if (!open) setActiveConv(null); }}
            style={{
              width: 56, height: 56, borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg, #1677ff, #4096ff)',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(22,119,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {open
              ? <CloseOutlined style={{ color: '#fff', fontSize: 20 }} />
              : <MessageOutlined style={{ color: '#fff', fontSize: 22 }} />
            }
          </button>
        </Badge>
      </div>

      {/* Chat Panel */}
      {open && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1677ff, #4096ff)',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {activeConv && (
              <ArrowLeftOutlined
                style={{ color: '#fff', fontSize: 16, cursor: 'pointer' }}
                onClick={() => setActiveConv(null)}
              />
            )}
            <Avatar
              size={32}
              src={activeConv?.avatarUrl || null}
              icon={<UserOutlined />}
              style={{ background: 'rgba(255,255,255,0.2)' }}
            />
            <div style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                {activeConv ? activeConv.fullName : '💬 Tin nhắn'}
              </Text>
              {!activeConv && (
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, display: 'block' }}>
                  Chọn cuộc trò chuyện
                </Text>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {loading ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin /></div>
            ) : !activeConv ? (
              // Danh sách conversation
              conversations.length === 0 ? (
                <Empty description="Chưa có tin nhắn nào" style={{ marginTop: 60 }} />
              ) : (
                <List
                  dataSource={conversations}
                  renderItem={(conv) => (
                    <List.Item
                      onClick={() => openConversation(conv)}
                      style={{
                        cursor: 'pointer', padding: '10px 8px', borderRadius: 10,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge count={conv.unreadCount} size="small">
                            <Avatar
                              src={conv.avatarUrl || null}
                              icon={<UserOutlined />}
                              style={{ background: '#1677ff' }}
                            />
                          </Badge>
                        }
                        title={<Text strong style={{ fontSize: 13 }}>{conv.fullName}</Text>}
                        description={
                          <Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                            ellipsis={{ tooltip: conv.lastMessage }}
                          >
                            {conv.lastMessage || 'Bắt đầu trò chuyện...'}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            ) : (
              // Màn hình tin nhắn
              <>
                {messages.length === 0 && (
                  <Empty description="Hãy gửi tin nhắn đầu tiên!" style={{ marginTop: 40 }} />
                )}
                {messages.map((msg, idx) => {
                  const isMine = msg.senderId === user.userId;
                  return (
                    <div
                      key={msg.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                        marginBottom: 8,
                      }}
                    >
                      <Tooltip
                        title={msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString('vi-VN') : ''}
                        placement={isMine ? 'left' : 'right'}
                      >
                        <div style={{
                          maxWidth: '75%', padding: '8px 12px',
                          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMine
                            ? 'linear-gradient(135deg, #1677ff, #4096ff)'
                            : '#f0f0f0',
                          color: isMine ? '#fff' : '#333',
                          fontSize: 13, lineHeight: 1.5,
                        }}>
                          {msg.message || msg.content}
                        </div>
                      </Tooltip>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input (chỉ khi đang mở conversation) */}
          {activeConv && (
            <div style={{
              padding: '10px 12px', borderTop: '1px solid #f0f0f0',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onPressEnter={sendMessage}
                placeholder="Nhập tin nhắn..."
                style={{ borderRadius: 20, fontSize: 13 }}
                maxLength={500}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                shape="circle"
                loading={sending}
                onClick={sendMessage}
                disabled={!inputVal.trim()}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

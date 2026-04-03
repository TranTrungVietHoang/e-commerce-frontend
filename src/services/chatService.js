import api from './api';

const chatService = {
  sendMessage: (receiverId, message) =>
    api.post('/chats', { receiverId, message }),
  getConversations: () => api.get('/chats/conversations'),
  getHistory: (userId, page = 0, size = 30) =>
    api.get(`/chats/history/${userId}?page=${page}&size=${size}`),
  markAllRead: (senderId) => api.patch(`/chats/read/${senderId}`),
};

export default chatService;

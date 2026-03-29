import api from './api';

const userService = {
  getProfile: () => api.get('/users/me'),

  updateProfile: (data) => api.put('/users/me', data),

  changePassword: (data) => api.put('/users/me/password', data),

  // Upload ảnh đại diện lên Cloudinary qua BE
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default userService;

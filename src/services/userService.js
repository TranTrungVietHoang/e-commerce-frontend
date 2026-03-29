import api from './api';

const userService = {
  getProfile: () => api.get('/users/me'),

  updateProfile: (data) => api.put('/users/me', data),

  changePassword: (data) => api.put('/users/me/password', data),
};

export default userService;

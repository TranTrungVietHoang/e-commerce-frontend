import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),

  login: (data) => api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),

  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export default authService;

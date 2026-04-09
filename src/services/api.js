import axios from 'axios';
import storageUtils from '../utils/storageUtils';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
});

// ─── Request interceptor: tự động gắn Bearer token ───────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = storageUtils.getItem('accessToken');
    // Chỉ gửi token nếu nó tồn tại, không phải là chuỗi "null"/"undefined" và có định dạng JWT (chứa dấu chấm)
    if (token && token !== 'undefined' && token !== 'null' && token.includes('.')) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Sending Token:', token.substring(0, 10) + '...');
    } else {
      console.warn('No valid token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: unwrap ApiResponse, tự động refresh token ──────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Unwrap ApiResponse wrapper { code, message, result }
    if (response.data && response.data.code !== undefined) {
      if (response.data.code === 200 || response.data.code === 201) {
        return response.data.result;
      }
      return Promise.reject(response.data);
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu bị 401 và chưa thử refresh (hoặc không thể refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Xóa thông tin cũ ngay lập tứ để không bị loop
      storageUtils.removeItem('accessToken');
      storageUtils.removeItem('refreshToken');
      storageUtils.removeItem('authUser');
      
      // Thông báo cho AuthContext (để cập nhật giao diện)
      window.dispatchEvent(new Event('auth:logout'));
      
      return Promise.reject({ 
        code: 401, 
        message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' 
      });
    }

    const errorData = error.response?.data || { message: 'Lỗi kết nối máy chủ' };
    return Promise.reject(errorData);
  }
);

export default api;

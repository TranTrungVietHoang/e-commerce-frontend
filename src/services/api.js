import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// Request interceptor: Gắn Bearer token vào header nếu có trong localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: Tự động lấy "result" từ ApiResponse và xử lý lỗi
api.interceptors.response.use(
  (response) => {
    // Nếu kết quả trả về đúng định dạng ApiResponse
    if (response.data && response.data.code !== undefined) {
      if (response.data.code === 200 || response.data.code === 201) {
        return response.data.result;
      }
      return Promise.reject(response.data);
    }
    return response.data;
  },
  (error) => {
    const errorData = error.response?.data || { message: 'Lỗi kết nối máy chủ' };
    return Promise.reject(errorData);
  }
);

export default api;

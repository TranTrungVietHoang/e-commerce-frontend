import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
});

// ─── Request interceptor: tự động gắn Bearer token ───────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Nếu bị 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Không có refresh token → bắn event để App xử lý, không hard reload
        localStorage.clear();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang refresh → đưa vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );
        const newAccessToken = res.data?.result?.accessToken || res.data?.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const errorData = error.response?.data || { message: 'Lỗi kết nối máy chủ' };
    return Promise.reject(errorData);
  }
);

export default api;

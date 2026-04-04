/**
 * Bộ tiện ích lưu trữ an toàn (Safe Storage Utilities)
 * Giúp tránh sập ứng dụng (Crash) khi trình duyệt (như Edge) chặn quyền truy cập localStorage.
 */
const storageUtils = {
  /** Lấy dữ liệu từ localStorage an toàn */
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[Storage] Không thể đọc key "${key}":`, e.message);
      return null;
    }
  },

  /** Lưu dữ liệu vào localStorage an toàn */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Storage] Không thể lưu key "${key}":`, e.message);
    }
  },

  /** Xóa dữ liệu khỏi localStorage an toàn */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Không thể xóa key "${key}":`, e.message);
    }
  },

  /** Xóa toàn bộ localStorage an toàn */
  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('[Storage] Không thể clear localStorage:', e.message);
    }
  }
};

export default storageUtils;

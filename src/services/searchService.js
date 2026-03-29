import api from './api';

const searchService = {
  /**
   * Tìm kiếm đa tiêu chí
   * @param {Object} params – { keyword, categoryId, minPrice, maxPrice, minRating, sort, page, size }
   */
  search: (params) => api.get('/search', { params }),

  /**
   * Autocomplete – gợi ý tìm kiếm
   * @param {string} q – từ khoá (tối thiểu 2 ký tự)
   */
  getSuggestions: (q) => api.get('/search/suggestions', { params: { q } }),
};

export default searchService;

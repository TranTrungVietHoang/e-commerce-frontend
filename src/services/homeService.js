import api from './api';

const homeService = {
  getHomeData: () => api.get('/home'),
};

export default homeService;

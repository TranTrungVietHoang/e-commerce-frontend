import api from './api';

const loyaltyService = {
  getMyPoints: () => api.get('/points/me'),
  getPointHistory: () => api.get('/points/history'),
};

export default loyaltyService;

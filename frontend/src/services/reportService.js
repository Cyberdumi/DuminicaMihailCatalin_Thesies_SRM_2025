import api from './api';

const reportService = {
  getSummary: async () => {
    const response = await api.get('/api/reports/summary');
    return response.data;
  },
  
  getOffersReport: async (filters = {}) => {
    const response = await api.get('/api/reports/offers', { params: filters });
    return response.data;
  },

  getSupplierPerformance: async () => {
    const response = await api.get('/api/reports/supplier-performance');
    return response.data;
  },

  getCategorySpend: async () => {
    const response = await api.get('/api/reports/category-spend');
    return response.data;
  }
};

export default reportService;
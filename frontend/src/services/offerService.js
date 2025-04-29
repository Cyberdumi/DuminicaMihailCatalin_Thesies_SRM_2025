import api from './api';

const offerService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/offers', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },
  
  create: async (offerData) => {
    const response = await api.post('/offers', offerData);
    return response.data;
  },
  
  update: async (id, offerData) => {
    const response = await api.put(`/offers/${id}`, offerData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/offers/${id}`);
    return true;
  }
};

export default offerService;
import api from './api';

const supplierService = {
  getAll: async () => {
    const response = await api.get('/suppliers');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },
  
  create: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },
  
  update: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/suppliers/${id}`);
    return true;
  }
};

export default supplierService;
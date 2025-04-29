import api from './api';

const contactService = {
  getAll: async (supplierId = null) => {
    const params = supplierId ? { supplierId } : {};
    const response = await api.get('/contacts', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
  
  create: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },
  
  update: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/contacts/${id}`);
    return true;
  }
};

export default contactService;
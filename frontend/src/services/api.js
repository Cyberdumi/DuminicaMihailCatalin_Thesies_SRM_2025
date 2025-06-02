import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});


const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}


api.interceptors.response.use(
  response => response,
  error => {
  
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
   
      console.error('Authentication error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);
export const adminApi = {
  getUsers: async () => {
    return await api.get('/api/admin/users');
  },
  
  createUser: async (userData) => {
    return await api.post('/api/admin/users', userData);
  },
  
  updateUser: async (id, userData) => {
    return await api.put(`/api/admin/users/${id}`, userData);
  },
  
  toggleUserStatus: async (id, isActive) => {
    return await api.put(`/api/admin/users/${id}`, { isActive });
  }
};


export default api;
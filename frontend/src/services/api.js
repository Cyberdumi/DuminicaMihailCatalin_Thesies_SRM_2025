import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});


api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

export default api;
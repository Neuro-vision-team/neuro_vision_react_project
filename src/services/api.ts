import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nv_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nv_access_token');
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const adminAPI = {
  login: (data: any) => api.post('/auth/login', data),
  getKPIs: () => api.get('/admin/kpis'),
  listUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  listMerchants: (params?: any) => api.get('/admin/merchants', { params }),
  approveMerchant: (id: string, status: string) => api.patch(`/admin/merchants/${id}/status`, { status }),
  setFeatured: (id: string, data: any) => api.patch(`/admin/merchants/${id}/featured`, data),
  listOrders: (params?: any) => api.get('/admin/orders', { params }),
  getConfig: () => api.get('/admin/config'),
  updateConfig: (key: string, value: string) => api.post('/admin/config', { key, value }),
};

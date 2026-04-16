import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        await SecureStore.setItemAsync('accessToken', data.data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data: any) => api.patch('/auth/me', data),
};

// Offers
export const offersAPI = {
  getNearby: (params: any) => api.get('/offers/nearby', { params }),
  getRecommended: (params: any) => api.get('/offers/recommended', { params }),
  getById: (id: string) => api.get(`/offers/${id}`),
  create: (data: FormData) => api.post('/offers', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: any) => api.patch(`/offers/${id}`, data),
  getMerchantOffers: (params?: any) => api.get('/offers/merchant/my', { params }),
};

// Orders
export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getUserOrders: (params?: any) => api.get('/orders/my', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
  getMerchantOrders: (params?: any) => api.get('/orders/merchant/all', { params }),
  complete: (qrCode: string) => api.post('/orders/merchant/complete', { qrCode }),
  markReady: (id: string) => api.post(`/orders/${id}/ready`),
};

// Merchants
export const merchantsAPI = {
  create: (data: FormData) => api.post('/merchants', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getProfile: () => api.get('/merchants/me'),
  update: (data: FormData) => api.patch('/merchants/me', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPublic: (id: string) => api.get(`/merchants/${id}`),
  getAnalytics: () => api.get('/merchants/me/analytics'),
};

// Reviews
export const reviewsAPI = {
  create: (data: any) => api.post('/reviews', data),
  getMerchantReviews: (merchantId: string, params?: any) =>
    api.get(`/reviews/merchant/${merchantId}`, { params }),
};

// Notifications
export const notificationsAPI = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.post('/notifications/mark-read'),
};

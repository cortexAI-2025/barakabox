import axios, { AxiosError } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('barakabox_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('barakabox_token')
      localStorage.removeItem('barakabox_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: Record<string, unknown>) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
}

// Offers endpoints
export const offersApi = {
  getNearby: (params?: Record<string, unknown>) =>
    api.get('/offers/nearby', { params }),
  getById: (id: string) => api.get(`/offers/${id}`),
  search: (query: string, params?: Record<string, unknown>) =>
    api.get('/offers/search', { params: { q: query, ...params } }),
}

// Merchant endpoints
export const merchantApi = {
  createOffer: (data: Record<string, unknown>) =>
    api.post('/merchant/offers', data),
  updateOffer: (id: string, data: Record<string, unknown>) =>
    api.put(`/merchant/offers/${id}`, data),
  deleteOffer: (id: string) => api.delete(`/merchant/offers/${id}`),
  getMyOffers: () => api.get('/merchant/offers'),
  getOrders: (status?: string) =>
    api.get('/merchant/orders', { params: { status } }),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/merchant/orders/${id}/status`, { status }),
  getDashboard: () => api.get('/merchant/dashboard'),
}

// Customer endpoints
export const customerApi = {
  getOrders: (status?: string) =>
    api.get('/orders', { params: { status } }),
  createOrder: (data: Record<string, unknown>) =>
    api.post('/orders', data),
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
  leaveReview: (orderId: string, data: Record<string, unknown>) =>
    api.post(`/orders/${orderId}/review`, data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    api.put('/profile', data),
}

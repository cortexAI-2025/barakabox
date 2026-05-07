export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN'
  avatar?: string
  referralCode?: string
  points?: number
  createdAt: string
}

export interface Merchant {
  id: string
  businessName: string
  category: MerchantCategory
  description?: string
  address: string
  city: string
  phone: string
  rating: number
  reviewsCount: number
  logo?: string
  coverImage?: string
}

export type MerchantCategory =
  | 'RESTAURANT'
  | 'BAKERY'
  | 'GROCERY'
  | 'CAFE'
  | 'CATERER'
  | 'OTHER'

export const CATEGORY_LABELS: Record<MerchantCategory, string> = {
  RESTAURANT: 'Restaurant',
  BAKERY: 'Boulangerie',
  GROCERY: 'Épicerie',
  CAFE: 'Café',
  CATERER: 'Traiteur',
  OTHER: 'Autre',
}

export const CATEGORY_EMOJIS: Record<MerchantCategory, string> = {
  RESTAURANT: '🍽️',
  BAKERY: '🥖',
  GROCERY: '🛒',
  CAFE: '☕',
  CATERER: '🍱',
  OTHER: '🏪',
}

export interface Offer {
  id: string
  merchantId: string
  merchant?: Merchant
  title: string
  description?: string
  imageUrl?: string
  originalPrice: number
  currentPrice: number
  minPrice?: number
  totalQuantity: number
  remainingQuantity: number
  pickupStart: string
  pickupEnd: string
  tags: string[]
  dynamicPricing: boolean
  status: 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'EXPIRED'
  distance?: number
  createdAt: string
}

export interface Order {
  id: string
  offerId: string
  offer?: Offer
  customerId: string
  customer?: User
  quantity: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'READY' | 'COMPLETED' | 'CANCELLED'
  paymentMethod: 'CASH' | 'CARD' | 'WALLET'
  qrCode?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  orderId: string
  merchantId: string
  customerId: string
  customer?: User
  rating: number
  comment?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
  merchant?: Merchant
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

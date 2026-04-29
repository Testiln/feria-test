// User types
export interface User {
  id: string
  full_name: string
  document_id: string
  position: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export interface UserRegistration {
  full_name: string
  document_id: string
  position: string
  email: string
  phone: string
}

// Product types
export interface Product {
  id: string
  code: string
  name: string
  ecommerce_url: string
  image_url: string
  stock: number
  reserved_stock: number
  price: number
  created_at: string
  updated_at: string
}

export interface ProductCreateInput {
  code: string
  name: string
  ecommerce_url: string
  image_url: string
  stock: number
}

// Order types
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  approval_document_url: string
  invoice_url: string | null
  total_items: number
  notes: string | null
  created_at: string
  updated_at: string
  approved_at: string | null
  rejected_at: string | null
}

export interface OrderDetail extends Order {
  user?: User
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface OrderCreateInput {
  items: {
    product_id: string
    quantity: number
  }[]
  approval_document_url: string
}

// Cart types
export interface CartItem {
  product_id: string
  quantity: number
  product?: Product
}

export interface Cart {
  items: CartItem[]
  total_items: number
}

// Configuration types
export interface Configuration {
  id: string
  key: string
  value: string
  description: string
  created_at: string
  updated_at: string
}

// Dashboard metrics
export interface DashboardMetrics {
  total_requests: number
  approved_percentage: number
  rejected_percentage: number
  products_sold: number
  products_available: number
  pending_orders: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  status: number
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
}

// Report types
export interface OrderReport {
  id: string
  user_full_name: string
  user_email: string
  user_document_id: string
  status: OrderStatus
  total_items: number
  products: string
  created_at: string
  approved_at: string | null
  rejected_at: string | null
}

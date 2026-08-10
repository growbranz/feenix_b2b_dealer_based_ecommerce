// Database ENUM types
export type UserRole = 'ADMIN' | 'DEALER'
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
export type EnquiryStatus = 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
export type EnquiryPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED'
export type PaymentStatus =
  | 'PENDING'
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'

export type InventoryMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'RESERVATION'
  | 'RELEASE'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'DAMAGE'
  | 'LOST'

export type InventoryTransferStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED'

export type InventoryAlertLevel = 'CRITICAL' | 'LOW' | 'RECOMMENDED'

export type InventoryReservationStatus = 'RESERVED' | 'DEDUCTED' | 'RELEASED' | 'RETURNED'

// Database table interfaces
export interface Profile {
  id: string
  role: UserRole
  name: string
  business_name: string | null
  email: string
  phone: string | null
  gst_number: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  pincode: string | null
  business_description: string | null
  profile_image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  status: ProductStatus
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  category_id: string
  name: string
  slug: string
  logo: string | null
  status: ProductStatus
  created_at: string
}

export interface Model {
  id: string
  brand_id: string
  name: string
  slug: string
  status: ProductStatus
  created_at: string
}

export interface Product {
  id: string
  dealer_id: string
  category_id: string
  brand_id: string
  model_id: string
  title: string
  slug: string
  sku: string | null
  description: string | null
  price: number
  bulk_price: number | null
  stock: number
  minimum_order: number
  condition: string | null
  quality: string | null
  warranty: string | null
  status: ProductStatus
  featured: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
}

export interface Enquiry {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  remarks: string | null
  status: EnquiryStatus
  priority: EnquiryPriority
  assigned_by: string | null
  order_id: string | null
  created_at: string
  updated_at: string
}

export interface EnquiryStatusHistory {
  id: string
  enquiry_id: string
  status: EnquiryStatus
  actor_id: string | null
  note: string | null
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  price: number
  subtotal: number
  tax: number
  discount: number
  shipping_charges: number
  total: number
  status: OrderStatus
  payment_status: PaymentStatus
  courier: string | null
  tracking_number: string | null
  expected_delivery: string | null
  created_at: string
  updated_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  subtotal: number
  tax: number
  discount: number
  total: number
  created_at: string
  updated_at: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  actor_id: string | null
  note: string | null
  created_at: string
}

export interface OrderDocumentRow {
  id: string
  order_id: string
  type: 'INVOICE' | 'DISPATCH' | 'OTHER'
  name: string
  file_url: string | null
  uploaded_by: string | null
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  dealer_id: string | null
  customer_id: string | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  amount: number
  gst: number
  discount: number
  shipping: number
  currency: string
  status: PaymentStatus
  payment_method: string | null
  invoice_id: string | null
  notes: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  order_id: string
  payment_id: string | null
  dealer_id: string | null
  customer_id: string | null
  product_id: string | null
  title: string | null
  quantity: number
  price: number
  hsn: string | null
  gst_rate: number
  gst_amount: number
  discount: number
  shipping: number
  subtotal: number
  total: number
  line_items: any
  status: string
  created_at: string
  updated_at: string
}

export interface PaymentAuditLog {
  id: string
  payment_id: string | null
  order_id: string | null
  action: string
  actor_id: string | null
  metadata: any
  created_at: string
}

export interface Inventory {
  id: string
  product_id: string
  dealer_id: string | null
  warehouse_id: string | null
  available_stock: number
  reserved_stock: number
  low_stock_limit: number
  critical_stock_limit: number
  recommended_reorder_level: number
  updated_at: string
}

export interface InventoryLedger {
  id: string
  product_id: string
  dealer_id: string | null
  warehouse_id: string | null
  order_id: string | null
  user_id: string | null
  previous_quantity: number
  updated_quantity: number
  previous_reserved: number
  updated_reserved: number
  movement_type: InventoryMovementType
  reason: string | null
  created_at: string
}

export interface InventoryReservation {
  id: string
  order_id: string
  product_id: string
  dealer_id: string | null
  warehouse_id: string | null
  quantity: number
  status: InventoryReservationStatus
  created_at: string
  updated_at: string
}

export interface InventoryTransfer {
  id: string
  product_id: string
  from_dealer_id: string | null
  from_warehouse_id: string | null
  to_dealer_id: string | null
  to_warehouse_id: string | null
  quantity: number
  status: InventoryTransferStatus
  requested_by: string
  approved_by: string | null
  reason: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface Warehouse {
  id: string
  name: string
  location: string | null
  is_active: boolean
  created_at: string
}

export interface LowStockAlert {
  id: string
  product_id: string
  dealer_id: string | null
  warehouse_id: string | null
  alert_level: InventoryAlertLevel
  current_stock: number
  threshold: number
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  message_type: string
  is_read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string | null
  is_read: boolean
  created_at: string
}

export interface Banner {
  id: string
  title: string
  image: string
  link: string | null
  display_order: number
  status: ProductStatus
}

export interface FeaturedProduct {
  id: string
  product_id: string
  display_order: number
}

export interface Setting {
  id: string
  site_name: string
  email: string | null
  phone: string | null
  address: string | null
  whatsapp: string | null
  logo: string | null
  favicon: string | null
}

// Database type for Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      brands: {
        Row: Brand
        Insert: Omit<Brand, 'id' | 'created_at'>
        Update: Partial<Omit<Brand, 'id' | 'created_at'>>
      }
      models: {
        Row: Model
        Insert: Omit<Model, 'id' | 'created_at'>
        Update: Partial<Omit<Model, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id'>
        Update: Partial<ProductImage>
      }
      enquiries: {
        Row: Enquiry
        Insert: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Enquiry, 'id' | 'created_at'>>
      }
      enquiry_status_history: {
        Row: EnquiryStatusHistory
        Insert: Omit<EnquiryStatusHistory, 'id' | 'created_at'>
        Update: Partial<Omit<EnquiryStatusHistory, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at'>>
      }
      order_items: {
        Row: OrderItemRow
        Insert: Omit<OrderItemRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OrderItemRow, 'id' | 'created_at'>>
      }
      order_status_history: {
        Row: OrderStatusHistory
        Insert: Omit<OrderStatusHistory, 'id' | 'created_at'>
        Update: Partial<Omit<OrderStatusHistory, 'id' | 'created_at'>>
      }
      order_documents: {
        Row: OrderDocumentRow
        Insert: Omit<OrderDocumentRow, 'id' | 'created_at'>
        Update: Partial<Omit<OrderDocumentRow, 'id' | 'created_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'paid_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Invoice, 'id' | 'created_at'>>
      }
      payment_audit_logs: {
        Row: PaymentAuditLog
        Insert: Omit<PaymentAuditLog, 'id' | 'created_at'>
        Update: Partial<Omit<PaymentAuditLog, 'id' | 'created_at'>>
      }
      inventory: {
        Row: Inventory
        Insert: Omit<Inventory, 'id' | 'updated_at'>
        Update: Partial<Omit<Inventory, 'id' | 'updated_at'>>
      }
      inventory_ledger: {
        Row: InventoryLedger
        Insert: Omit<InventoryLedger, 'id' | 'created_at'>
        Update: Partial<Omit<InventoryLedger, 'id' | 'created_at'>>
      }
      inventory_reservations: {
        Row: InventoryReservation
        Insert: Omit<InventoryReservation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InventoryReservation, 'id' | 'created_at'>>
      }
      inventory_transfers: {
        Row: InventoryTransfer
        Insert: Omit<InventoryTransfer, 'id' | 'created_at' | 'updated_at' | 'completed_at'>
        Update: Partial<Omit<InventoryTransfer, 'id' | 'created_at'>>
      }
      warehouses: {
        Row: Warehouse
        Insert: Omit<Warehouse, 'id' | 'created_at'>
        Update: Partial<Omit<Warehouse, 'id' | 'created_at'>>
      }
      low_stock_alerts: {
        Row: LowStockAlert
        Insert: Omit<LowStockAlert, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LowStockAlert, 'id' | 'created_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
      banners: {
        Row: Banner
        Insert: Omit<Banner, 'id'>
        Update: Partial<Banner>
      }
      featured_products: {
        Row: FeaturedProduct
        Insert: Omit<FeaturedProduct, 'id'>
        Update: Partial<FeaturedProduct>
      }
      settings: {
        Row: Setting
        Insert: Omit<Setting, 'id'>
        Update: Partial<Setting>
      }
    }
  }
}

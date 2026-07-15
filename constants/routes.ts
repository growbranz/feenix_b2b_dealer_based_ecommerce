export const ROUTES = {
  // Public routes
  HOME: '/',
  
  // Auth routes
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_DEALERS: '/admin/dealers',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ENQUIRIES: '/admin/enquiries',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Dealer routes
  DEALER_DASHBOARD: '/dealer',
  DEALER_PRODUCTS: '/dealer/products',
  DEALER_INVENTORY: '/dealer/inventory',
  DEALER_ORDERS: '/dealer/orders',
  DEALER_ENQUIRIES: '/dealer/enquiries',
  DEALER_PROFILE: '/dealer/profile',
  DEALER_SETTINGS: '/dealer/settings',
} as const

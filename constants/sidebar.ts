import { ROUTES } from './routes'

export interface SidebarItem {
  label: string
  href: string
  icon?: string
  children?: SidebarItem[]
}

export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.ADMIN_DASHBOARD,
  },
  {
    label: 'Dealers',
    href: ROUTES.ADMIN_DEALERS,
  },
  {
    label: 'Products',
    href: ROUTES.ADMIN_PRODUCTS,
  },
  {
    label: 'Orders',
    href: ROUTES.ADMIN_ORDERS,
  },
  {
    label: 'Enquiries',
    href: ROUTES.ADMIN_ENQUIRIES,
  },
  {
    label: 'Reports',
    href: ROUTES.ADMIN_REPORTS,
  },
  {
    label: 'Settings',
    href: ROUTES.ADMIN_SETTINGS,
  },
]

export const DEALER_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.DEALER_DASHBOARD,
  },
  {
    label: 'Products',
    href: ROUTES.DEALER_PRODUCTS,
  },
  {
    label: 'Inventory',
    href: ROUTES.DEALER_INVENTORY,
  },
  {
    label: 'Orders',
    href: ROUTES.DEALER_ORDERS,
  },
  {
    label: 'Enquiries',
    href: ROUTES.DEALER_ENQUIRIES,
  },
  {
    label: 'Profile',
    href: ROUTES.DEALER_PROFILE,
  },
  {
    label: 'Settings',
    href: ROUTES.DEALER_SETTINGS,
  },
]

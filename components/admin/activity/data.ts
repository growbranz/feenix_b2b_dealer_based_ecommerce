export type LogType = "ADMIN_LOGIN" | "DEALER_ACTION" | "PRODUCT_APPROVAL" | "CMS_CHANGE" | "BANNER_CHANGE"

export interface ActivityLog {
  id: string
  type: LogType
  action: string
  actor: string
  target: string
  timestamp: string
}

export const mockLogs: ActivityLog[] = [
  { id: "1", type: "ADMIN_LOGIN", action: "Logged in", actor: "Admin", target: "Admin Panel", timestamp: "2026-07-22T10:00:00Z" },
  { id: "2", type: "DEALER_ACTION", action: "Approved dealer", actor: "Admin", target: "MobileSpares Inc.", timestamp: "2026-07-22T09:45:00Z" },
  { id: "3", type: "PRODUCT_APPROVAL", action: "Rejected product", actor: "Admin", target: "Xiaomi 13 Rear Camera", timestamp: "2026-07-22T09:30:00Z" },
  { id: "4", type: "CMS_CHANGE", action: "Updated hero", actor: "Admin", target: "Homepage", timestamp: "2026-07-21T17:20:00Z" },
  { id: "5", type: "BANNER_CHANGE", action: "Added banner", actor: "Admin", target: "Summer Sale", timestamp: "2026-07-21T16:00:00Z" },
  { id: "6", type: "PRODUCT_APPROVAL", action: "Approved product", actor: "Admin", target: "Samsung S23 Ultra Battery", timestamp: "2026-07-21T14:10:00Z" },
  { id: "7", type: "DEALER_ACTION", action: "Suspended dealer", actor: "Admin", target: "DisplayMax", timestamp: "2026-07-20T11:00:00Z" },
]

export const logTypeOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "ADMIN_LOGIN", label: "Admin Login" },
  { value: "DEALER_ACTION", label: "Dealer Action" },
  { value: "PRODUCT_APPROVAL", label: "Product Approval" },
  { value: "CMS_CHANGE", label: "CMS Change" },
  { value: "BANNER_CHANGE", label: "Banner Change" },
]

export const logTypeColors: Record<LogType, string> = {
  ADMIN_LOGIN: "bg-blue-100 text-blue-700",
  DEALER_ACTION: "bg-violet-100 text-violet-700",
  PRODUCT_APPROVAL: "bg-amber-100 text-amber-700",
  CMS_CHANGE: "bg-emerald-100 text-emerald-700",
  BANNER_CHANGE: "bg-rose-100 text-rose-700",
}

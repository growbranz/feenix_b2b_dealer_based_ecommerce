export type AdminRole = "super_admin" | "admin" | "moderator" | "support"

export type AdminPermission =
  | "dashboard:view"
  | "dealers:manage"
  | "categories:manage"
  | "brands:manage"
  | "models:manage"
  | "products:manage"
  | "cms:manage"
  | "banners:manage"
  | "featured:manage"
  | "settings:manage"
  | "activity:view"
  | "dealers:view"
  | "users:manage"

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    "dashboard:view",
    "dealers:manage",
    "categories:manage",
    "brands:manage",
    "models:manage",
    "products:manage",
    "cms:manage",
    "banners:manage",
    "featured:manage",
    "settings:manage",
    "activity:view",
    "users:manage",
  ],
  admin: [
    "dashboard:view",
    "dealers:manage",
    "categories:manage",
    "brands:manage",
    "models:manage",
    "products:manage",
    "cms:manage",
    "banners:manage",
    "featured:manage",
    "activity:view",
  ],
  moderator: ["dashboard:view", "products:manage", "dealers:view", "activity:view"],
  support: ["dashboard:view", "activity:view"],
}

export function hasPermission(role: string, permission: AdminPermission): boolean {
  const perms = rolePermissions[role as AdminRole] || []
  return perms.includes(permission)
}

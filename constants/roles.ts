export const ROLES = {
  ADMIN: 'ADMIN',
  DEALER: 'DEALER',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrator',
  DEALER: 'Dealer',
}

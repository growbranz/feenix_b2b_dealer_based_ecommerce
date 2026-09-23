// Mock data removed - now using real data from lib/admin/products-service.ts
// formatCurrency function retained for UI formatting

export const mockProducts: { id: string; title: string }[] = []

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
}

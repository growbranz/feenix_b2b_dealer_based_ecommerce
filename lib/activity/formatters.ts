/**
 * Activity Log Formatters
 * Converts database activity values into human-readable labels for UI display
 */

// Special mappings for activity types that need custom labels
const activityTypeMappings: Record<string, string> = {
  LEGACY: "System Activity",
  AUTHENTICATION: "Authentication",
  DEALER_ACTION: "Dealer",
  PRODUCT_ACTION: "Product",
  CATEGORY_ACTION: "Category",
  BRAND_ACTION: "Brand",
  MODEL_ACTION: "Model",
  ENQUIRY_ACTION: "Enquiry",
  ORDER_ACTION: "Order",
  PAYMENT_ACTION: "Payment",
  INVENTORY_ACTION: "Inventory",
  BANNER_ACTION: "Banner",
  CMS_ACTION: "Website Content",
  FEATURED_ACTION: "Featured Product",
  SETTINGS_ACTION: "Settings",
  WEBSITE_ACTION: "Website",
}

// Special mappings for specific actions that need custom labels
const actionMappings: Record<string, string> = {
  // Common patterns with better labels
  "notification_created": "Notification Created",
  "notification_updated": "Notification Updated",
  "notification_deleted": "Notification Deleted",
  
  "dealer_approved": "Dealer Approved",
  "dealer_rejected": "Dealer Rejected",
  "dealer_created": "Dealer Created",
  "dealer_updated": "Dealer Updated",
  "dealer_deleted": "Dealer Deleted",
  
  "product_created": "Product Created",
  "product_updated": "Product Updated",
  "product_deleted": "Product Deleted",
  "product_status_updated": "Product Status Updated",
  
  "order_created": "Order Created",
  "order_updated": "Order Updated",
  "order_cancelled": "Order Cancelled",
  "order_completed": "Order Completed",
  
  "payment_refunded": "Payment Refunded",
  "payment_processed": "Payment Processed",
  "payment_failed": "Payment Failed",
  
  "inventory_adjusted": "Inventory Adjusted",
  "inventory_updated": "Inventory Updated",
  
  "banner_created": "Banner Created",
  "banner_updated": "Banner Updated",
  "banner_deleted": "Banner Deleted",
  
  "cms_updated": "Website Content Updated",
  "cms_created": "Website Content Created",
  "cms_deleted": "Website Content Deleted",
  
  "settings_updated": "Settings Updated",
  "settings_created": "Settings Created",
  
  "marketplace_stat_created": "Stat Created",
  "marketplace_stat_updated": "Stat Updated",
  "marketplace_stat_deleted": "Stat Deleted",
  "marketplace_stat_reordered": "Stats Reordered",
  "marketplace_stat_status_changed": "Stat Status Changed",
}

/**
 * Format activity type for display
 * Converts technical database types to human-readable labels
 */
export function formatActivityType(type: string): string {
  if (!type) return "Unknown"
  
  // Check for exact match in mappings
  const upperType = type.toUpperCase()
  if (activityTypeMappings[upperType]) {
    return activityTypeMappings[upperType]
  }
  
  // Auto-format: convert underscores/hyphens to spaces and capitalize
  return snakeCaseToTitleCase(type)
}

/**
 * Format activity action for display
 * Converts technical database actions to human-readable labels
 */
export function formatActivityAction(action: string): string {
  if (!action) return "Unknown Action"
  
  // Check for exact match in mappings
  const lowerAction = action.toLowerCase()
  if (actionMappings[lowerAction]) {
    return actionMappings[lowerAction]
  }
  
  // Auto-format: convert underscores/hyphens to spaces and capitalize
  return snakeCaseToTitleCase(action)
}

/**
 * Helper function to convert snake_case or kebab-case to Title Case
 * Example: "notification_created" → "Notification Created"
 * Example: "seller-order-assigned" → "Seller Order Assigned"
 */
function snakeCaseToTitleCase(text: string): string {
  return text
    .replace(/[-_]/g, ' ')           // Replace underscores and hyphens with spaces
    .split(' ')                      // Split into words
    .map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter
    )
    .join(' ')                       // Join back with spaces
}

/**
 * Format target name for display
 * Handles null/undefined values and technical prefixes
 */
export function formatTargetName(targetName: string | null | undefined): string {
  if (!targetName) return "—"
  
  // Remove technical prefixes if present
  const cleanName = targetName
    .replace(/^[-_]/, '')           // Remove leading dash/underscore
    .replace(/^[a-z]+_/, '')        // Remove common prefixes like "notification_"
  
  return cleanName || targetName     // Return cleaned name or original if cleaning removed everything
}

/**
 * Format actor name for display
 * Handles system actors and null values
 */
export function formatActorName(actorName: string | null | undefined): string {
  if (!actorName) return "System"
  
  // Check if it's a system actor
  if (actorName.toLowerCase() === 'system' || actorName.toLowerCase() === 'admin') {
    return "System"
  }
  
  return actorName
}

/**
 * Get CSS class for activity type badge
 */
export function getActivityTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    LEGACY: "bg-slate-100 text-slate-700 border-slate-200",
    AUTHENTICATION: "bg-blue-100 text-blue-700 border-blue-200",
    DEALER_ACTION: "bg-violet-100 text-violet-700 border-violet-200",
    PRODUCT_ACTION: "bg-amber-100 text-amber-700 border-amber-200",
    CATEGORY_ACTION: "bg-emerald-100 text-emerald-700 border-emerald-200",
    BRAND_ACTION: "bg-teal-100 text-teal-700 border-teal-200",
    MODEL_ACTION: "bg-cyan-100 text-cyan-700 border-cyan-200",
    ENQUIRY_ACTION: "bg-orange-100 text-orange-700 border-orange-200",
    ORDER_ACTION: "bg-rose-100 text-rose-700 border-rose-200",
    PAYMENT_ACTION: "bg-green-100 text-green-700 border-green-200",
    INVENTORY_ACTION: "bg-slate-100 text-slate-700 border-slate-200",
    BANNER_ACTION: "bg-pink-100 text-pink-700 border-pink-200",
    CMS_ACTION: "bg-indigo-100 text-indigo-700 border-indigo-200",
    FEATURED_ACTION: "bg-yellow-100 text-yellow-700 border-yellow-200",
    SETTINGS_ACTION: "bg-gray-100 text-gray-700 border-gray-200",
  }
  
  const upperType = type?.toUpperCase() || ""
  return colorMap[upperType] || "bg-slate-100 text-slate-700 border-slate-200"
}

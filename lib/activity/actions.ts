"use server"

import { requireAdmin } from "@/lib/auth/auth.helpers"
import { getActivityLogs, getActivityLogTypes } from "./service"
import type { ActivityType } from "./service"

export async function getActivityLogsAction(options: {
  search?: string
  type?: string
  page?: number
  limit?: number
}) {
  try {
    const { user } = await requireAdmin()
    return getActivityLogs({
      ...options,
      type: options.type as ActivityType | "all" | undefined,
    })
  } catch (error) {
    console.error("Activity logs action error:", error)
    // Return safe fallback
    return {
      data: [],
      count: 0,
      page: options.page || 1,
      limit: options.limit || 20,
      totalPages: 1,
    }
  }
}

export async function getActivityLogTypesAction() {
  try {
    const { user } = await requireAdmin()
    return getActivityLogTypes()
  } catch (error) {
    console.error("Activity log types action error:", error)
    return []
  }
}

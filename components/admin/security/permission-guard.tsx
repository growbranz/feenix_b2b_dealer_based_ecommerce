"use client"

import * as React from "react"
import { hasPermission, AdminPermission } from "@/lib/auth/admin-permissions"
import type { Profile } from "@/types"

interface PermissionGuardProps {
  profile: Profile | null
  permission: AdminPermission
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ profile, permission, fallback = null, children }: PermissionGuardProps) {
  if (!profile || !hasPermission(profile.role, permission)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}

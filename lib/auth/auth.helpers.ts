import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'
import { redirect } from 'next/navigation'

/**
 * Get current user from server side
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

/**
 * Get current session from server side
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return null
    }

    return session
  } catch (error) {
    return null
  }
}

/**
 * Get current user profile from database
 */
export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return null
    }

    return data
  } catch (error) {
    return null
  }
}

/**
 * Get current user profile with role from server side
 */
export async function getCurrentUserProfile(): Promise<{ user: User | null; profile: Profile | null } | null> {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { user: null, profile: null }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return { user, profile: null }
    }

    return { user, profile }
  } catch (error) {
    return { user: null, profile: null }
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

/**
 * Require admin role - redirect if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  const profile = await getCurrentProfile(user.id)

  if (!profile || profile.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return { user, profile }
}

/**
 * Require dealer role - redirect if not dealer
 */
export async function requireDealer() {
  const user = await requireAuth()
  const profile = await getCurrentProfile(user.id)

  if (!profile || profile.role !== 'DEALER') {
    redirect('/unauthorized')
  }

  return { user, profile }
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) {
    return false
  }

  const profile = await getCurrentProfile(user.id)
  if (!profile) {
    return false
  }

  return profile.role === role
}

/**
 * Get redirect path based on user role
 */
export async function getRoleRedirectPath(): Promise<string> {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile || !userProfile.user || !userProfile.profile) {
    return '/auth/login'
  }

  switch (userProfile.profile.role) {
    case 'ADMIN':
      return '/admin'
    case 'DEALER':
      return '/dealer'
    default:
      return '/auth/login'
  }
}

/**
 * Client-side helper to get current user
 */
export async function getCurrentUserClient(): Promise<User | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

/**
 * Client-side helper to get current profile
 */
export async function getCurrentProfileClient(): Promise<Profile | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return null
    }

    return data
  } catch (error) {
    return null
  }
}

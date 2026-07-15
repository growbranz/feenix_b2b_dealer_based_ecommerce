'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { LoginCredentials, AuthResponse } from '@/lib/auth/auth.types'

/**
 * Server action for login
 */
export async function loginAction(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        success: false,
        error: getErrorMessage(error.message),
      }
    }

    // Fetch user profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    return {
      success: true,
      message: 'Login successful',
      data: profile,
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during login',
    }
  }
}

/**
 * Server action for logout
 */
export async function logoutAction(): Promise<AuthResponse> {
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: getErrorMessage(error.message),
      }
    }

    return {
      success: true,
      message: 'Logout successful',
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during logout',
    }
  }
}

/**
 * Server action for password reset
 */
export async function resetPasswordAction(email: string): Promise<AuthResponse> {
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: getErrorMessage(error.message),
      }
    }

    return {
      success: true,
      message: 'Password reset email sent',
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred while sending reset email',
    }
  }
}

/**
 * Server action for updating password
 */
export async function updatePasswordAction(password: string): Promise<AuthResponse> {
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return {
        success: false,
        error: getErrorMessage(error.message),
      }
    }

    return {
      success: true,
      message: 'Password updated successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred while updating password',
    }
  }
}

/**
 * Server action to get current user
 */
export async function getCurrentUserAction() {
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
 * Server action to get current profile
 */
export async function getCurrentProfileAction(userId: string) {
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
 * Convert Supabase error messages to user-friendly messages
 */
function getErrorMessage(message: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'User already registered': 'An account with this email already exists',
    'Password should be at least 6 characters': 'Password must be at least 6 characters',
    'Invalid email': 'Please enter a valid email address',
    'Session expired': 'Your session has expired. Please login again',
    'Network request failed': 'Network error. Please check your connection',
  }

  return errorMessages[message] || message
}

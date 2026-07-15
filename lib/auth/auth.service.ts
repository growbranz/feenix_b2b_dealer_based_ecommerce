import { createClient } from '@/lib/supabase/client'
import type { LoginCredentials, AuthResponse } from './auth.types'

export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        }
      }

      return {
        success: true,
        message: 'Login successful',
        data: data.user,
      }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during login',
      }
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
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
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
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
  },

  /**
   * Update user password
   */
  async updatePassword(password: string): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
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
  },

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        }
      }

      return {
        success: true,
        data: data.session,
      }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred while refreshing session',
      }
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
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
  },

  /**
   * Convert Supabase error messages to user-friendly messages
   */
  getErrorMessage(message: string): string {
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
  },
}

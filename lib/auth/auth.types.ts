import type { User, Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

export interface AuthUser extends User {
  role?: UserRole
}

export interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  error?: string
  message?: string
  data?: any
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResponse>
  updatePassword: (password: string) => Promise<AuthResponse>
}

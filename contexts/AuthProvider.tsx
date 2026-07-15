'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import type { AuthContextType, LoginCredentials, AuthResponse } from '@/lib/auth/auth.types'
import { authService } from '@/lib/auth/auth.service'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const supabase = createClient()
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        // Get user profile if user exists
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!error && data) {
            setProfile(data)
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = createClient().auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!error && data) {
            setProfile(data)
          } else {
            setProfile(null)
          }
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setError(null)
    const response = await authService.login(credentials)
    
    if (!response.success) {
      setError(response.error || 'Login failed')
    }
    
    return response
  }

  const logout = async () => {
    setError(null)
    await authService.logout()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const refresh = async () => {
    setError(null)
    const response = await authService.refreshSession()
    
    if (!response.success) {
      setError(response.error || 'Session refresh failed')
    }
  }

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    setError(null)
    return await authService.resetPassword(email)
  }

  const updatePassword = async (password: string): Promise<AuthResponse> => {
    setError(null)
    return await authService.updatePassword(password)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    login,
    logout,
    refresh,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

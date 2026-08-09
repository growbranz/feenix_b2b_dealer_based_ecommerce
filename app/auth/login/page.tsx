'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthProvider'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.validation'
import { FloatingInput } from '@/components/auth/floating-input'
import { SocialLogin } from '@/components/auth/social-login'
import { AuthSplitLayout } from '@/components/auth/auth-hero'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    // Validate form
    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      setIsSubmitting(false)
      return
    }

    // Attempt login
    const response = await login(formData)
    
    if (response.success) {
      // Redirect based on role
      if (response.data?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dealer')
      }
    } else {
      setErrors({ email: response.error })
    }

    setIsSubmitting(false)
  }

  return (
    <AuthSplitLayout>
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-100 p-8 sm:p-10 shadow-[0_24px_64px_-24px_rgba(30,41,59,0.12)]">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to continue to your dealer dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FloatingInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSubmitting || loading}
              autoComplete="email"
            />
            <FloatingInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isSubmitting || loading}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-600">
                  Remember me
                </label>
              </div>
              <a
                href="/auth/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full h-12 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all border-0"
            >
              {isSubmitting || loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-8">
            <SocialLogin />
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="font-semibold text-blue-600 hover:underline">Create an account</a>
          </p>
        </div>
      </motion.div>
    </AuthSplitLayout>
  )
}

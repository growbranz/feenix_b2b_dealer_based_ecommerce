'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { FloatingInput } from '@/components/auth/floating-input'
import { PasswordStrength } from '@/components/auth/password-strength'
import { SocialLogin } from '@/components/auth/social-login'
import { AuthSplitLayout } from '@/components/auth/auth-hero'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  businessName: z.string().min(2, 'Business name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  terms: z.boolean().refine((val) => val === true, { message: 'You must accept the terms' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setSubmitError(null)

    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            business_name: formData.businessName,
            phone: formData.phone,
          },
        },
      })

      if (error) {
        setSubmitError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <AuthSplitLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto text-center"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">Account created</h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            Please check your email to confirm your account. Once confirmed, you can sign in to your dealer dashboard.
          </p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full h-12 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all"
          >
            Continue to Login
          </Button>
        </motion.div>
      </AuthSplitLayout>
    )
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
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create your dealer account</h1>
            <p className="text-slate-500">Join Feenix Repair and start trading genuine parts today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FloatingInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                disabled={isSubmitting}
                autoComplete="name"
              />
              <FloatingInput
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                error={errors.businessName}
                disabled={isSubmitting}
                autoComplete="organization"
              />
            </div>
            <FloatingInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSubmitting}
              autoComplete="email"
            />
            <FloatingInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              disabled={isSubmitting}
              autoComplete="tel"
            />
            <FloatingInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <PasswordStrength password={formData.password} />
            <FloatingInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={isSubmitting}
              autoComplete="new-password"
            />

            <div className="flex items-start gap-3">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 leading-snug">
                I agree to the{" "}
                <a href="/terms" className="font-medium text-blue-600 hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="font-medium text-blue-600 hover:underline">Privacy Policy</a>.
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-red-500">{errors.terms}</p>
            )}

            {submitError && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all border-0"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-8">
            <SocialLogin />
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a href="/auth/login" className="font-semibold text-blue-600 hover:underline">Sign in</a>
          </p>
        </div>
      </motion.div>
    </AuthSplitLayout>
  )
}

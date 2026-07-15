import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if needed
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Define protected routes
  const protectedRoutes = ['/admin', '/dealer']
  const authRoutes = ['/auth/login', '/auth/forgot-password', '/auth/reset-password']
  const publicRoutes = ['/']

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Redirect authenticated users from auth routes to appropriate dashboard
  if (isAuthRoute && session) {
    // Fetch user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const profileData = profile as { role: string }
      // Redirect based on user role
      if (profileData.role === 'ADMIN' && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (profileData.role === 'DEALER' && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/dealer', req.url))
      }
    }
  }

  // Role-based access control
  if (session && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const profileData = profile as { role: string }
      // Admin routes - only ADMIN role allowed
      if (pathname.startsWith('/admin') && profileData.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Dealer routes - only DEALER role allowed
      if (pathname.startsWith('/dealer') && profileData.role !== 'DEALER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

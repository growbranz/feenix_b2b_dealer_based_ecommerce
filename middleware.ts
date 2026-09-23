import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware')
    return res
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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

  const { pathname } = req.nextUrl

  // Define protected routes
  const protectedRoutes = ['/admin', '/dealer']
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
  const publicRoutes = ['/']

  // Check if current path is protected or auth route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // Skip auth check for public routes to avoid Supabase connectivity issues
  if (isPublicRoute) {
    return res
  }

  // Refresh session if needed (only for protected/auth routes)
  let session = null
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    session = sessionData.session
  } catch (error) {
    // If Supabase is unreachable, continue without session
    console.error('Middleware auth session error:', error instanceof Error ? error.message : error)
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Redirect authenticated users from auth routes to appropriate dashboard
  if (isAuthRoute && session) {
    // Fetch user profile to determine role
    let profile = null
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
      profile = profileData
    } catch (error) {
      console.error('Middleware profile fetch error:', error instanceof Error ? error.message : error)
    }

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
    let profile = null
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
      profile = profileData
    } catch (error) {
      console.error('Middleware role check error:', error instanceof Error ? error.message : error)
    }

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

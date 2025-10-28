import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update session (refresh tokens if needed)
  const response = await updateSession(request)

  // Get pathname
  const pathname = request.nextUrl.pathname

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/settings',
    '/stores',
    '/funnels',
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Check if user is authenticated by looking for session cookie
    const supabaseToken = request.cookies.get('sb-127.0.0.1-auth-token')

    if (!supabaseToken) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

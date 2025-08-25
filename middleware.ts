import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/home')

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/home/:path*']
}

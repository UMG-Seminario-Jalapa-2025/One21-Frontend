import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

console.log('### src/middleware_impl.ts loaded (implementation) ###')

// Define which roles are required for which paths
const roleGuards = [
  {
    path: '/admin',
    roles: ['admin']
  },
  {
    path: '/roles',
    roles: ['app-admin']
  },
  {
    path: '/countries',
    roles: ['app-admin']
  },
  {
    path: '/job_position',
    roles: ['app-admin']
  },
  {
    path: '/employee_departaments',
    roles: ['app-admin']
  },
  {
    path: '/departments',
    roles: ['app-admin']
  },
  {
    path: '/municipalities',
    roles: ['app-admin']
  }
]

export function middleware(request: NextRequest) {
  console.log('*******************************************')
  console.log('****** EL MIDDLEWARE SE ESTÁ EJECUTANDO ******')
  console.log('*******************************************')

  const token = request.cookies.get('one21_token')?.value
  const rawPathname = request.nextUrl.pathname
  const basePathEnv = process.env.BASEPATH || ''
  let pathname = rawPathname

  if (basePathEnv) {
    const normalizedBase = basePathEnv.startsWith('/') ? basePathEnv : `/${basePathEnv}`
    if (pathname.startsWith(normalizedBase)) {
      pathname = pathname.slice(normalizedBase.length) || '/'
    }
  }

  if (!token && pathname !== '/login') {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.headers.set('x-one21-middleware', 'redirect-to-login')
    return res
  }

  if (token) {
    if (pathname === '/login') {
      const res = NextResponse.redirect(new URL('/inicio', request.url))
      res.headers.set('x-one21-middleware', 'redirect-to-inicio')
      return res
    }

    const rolesCookie = request.cookies.get('one21_roles')?.value
    const userRoles = rolesCookie ? JSON.parse(rolesCookie) : []

    const protectedRoute = roleGuards.find(guard => pathname.startsWith(guard.path))

    if (protectedRoute) {
      const hasRequiredRole = protectedRoute.roles.some(requiredRole => userRoles.includes(requiredRole))

      if (!hasRequiredRole) {
        console.log(`🚫 Acceso denegado a ${pathname} para roles: ${userRoles.join(', ')}`)
        const res = NextResponse.redirect(new URL('/inicio', request.url))
        res.headers.set('x-one21-middleware', 'forbidden-role')
        return res
      }
    }
  }

  const res = NextResponse.next()
  res.headers.set('x-one21-middleware', 'active')

  try {
    if (process.env.NODE_ENV !== 'production') {
      res.cookies.set('one21_middleware', '1', { path: '/' })
    }
  } catch (e) {
    console.warn('No se pudo setear cookie de depuración en middleware:', e)
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

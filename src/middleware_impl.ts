import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const roleGuards = [
  { path: '/inicio', roles: ['app-admin','default-roles-master', 'uma_authorization', 'client', 'employee'] },
  { path: '/Empleados', roles: ['app-admin'] },
  { path: '/personas', roles: ['app-admin'] },
  { path: '/ticket/crear', roles: ['app-admin','client','employee','uma_authorization'] },
  { path: '/ticket/ver-todos', roles: ['app-admin'] },
  { path: '/ticket/ver-cliente', roles: ['client','app-admin','uma_authorization'] },
  { path: '/ticket/asignar', roles: ['app-admin'] },
  { path: '/kanban', roles: ['employee'] },
  { path: '/prioridades', roles: ['app-admin'] },
  { path: '/categorias', roles: ['app-admin'] },
  { path: '/status', roles: ['app-admin'] },
  { path: '/countries', roles: ['app-admin'] },
  { path: '/roles', roles: ['app-admin'] },
  { path: '/job_position', roles: ['app-admin'] },
  { path: '/employee_departaments', roles: ['app-admin'] },
  { path: '/departments', roles: ['app-admin'] },
  { path: '/municipalities', roles: ['app-admin'] }
]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('one21_token')?.value
  const rawPath = request.nextUrl.pathname
  const basePath = process.env.BASEPATH || ""
  let pathname = rawPath

  if (basePath) {
    const normalizedBase = basePath.startsWith("/") ? basePath : `/${basePath}`
    
    if (pathname.startsWith(normalizedBase)) {
      pathname = pathname.replace(normalizedBase, "") || "/"
    }
  }

  const STATIC_PREFIXES = [
    "/_next",
    "/favicon.ico",
    "/assets",
    "/public",
    "/images",
    "/fonts"
  ]

  const fullPath = rawPath

  if (STATIC_PREFIXES.some(prefix => fullPath.startsWith(`${basePath}${prefix}`))) {
    return NextResponse.next()
  }

  if (fullPath.startsWith(`${basePath}/api`)) {
    return NextResponse.next()
  }

  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL(`${basePath}/login`, request.url))
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL(`${basePath}/inicio`, request.url))
  }

  if (token) {
    const rolesCookie = request.cookies.get("one21_roles")?.value
    const userRoles = rolesCookie ? JSON.parse(rolesCookie) : []
    const routeProtected = roleGuards.find(r => pathname.startsWith(r.path))

    if (routeProtected) {
      const ok = routeProtected.roles.some(role => userRoles.includes(role))

      if (!ok) {
        return NextResponse.redirect(new URL(`${basePath}/inicio`, request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

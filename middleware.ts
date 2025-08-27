import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirige SIEMPRE (sin importar cookies)
  if (pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|images|api|static).*)'],
  runtime: 'nodejs'
}

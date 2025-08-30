import { NextResponse } from 'next/server'

import { serialize } from 'cookie'

export async function POST() {
  const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'one21_token'

  const response = NextResponse.json({ message: 'Sesión cerrada' })

  response.headers.set(
    'Set-Cookie',
    serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: false,     
      maxAge: 0,
      path: '/',
      sameSite: 'lax'
    })
  )

  return response
}

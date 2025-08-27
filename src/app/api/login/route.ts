import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { serialize } from 'cookie'


export async function POST(req: NextRequest) {

  console.log('ENTRE')
  const body = await req.json()

  const { username, password } = body

  try {
    const res = await fetch(`${process.env.AUTH_API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AUTH_STATIC_BEARER}`
      },
      body: JSON.stringify({
        username,
        password,
        tenant: process.env.AUTH_TENANT
      })
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ message: data?.message || 'Error de autenticación' }, { status: res.status })
    }

    const token = data?.access_token
    
    if (!token) {
      return NextResponse.json({ message: 'Token no recibido' }, { status: 401 })
    }

    const response = NextResponse.json({ message: 'Login exitoso' })

    response.headers.set(
      'Set-Cookie',
      serialize(
        process.env.AUTH_COOKIE_NAME || 'one21_token',
        token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE || '604800'),
          path: '/',
          sameSite: 'lax'
        }
      )
    )

    return response
  } catch (err) {
    console.log(err)

    return NextResponse.json({ message: err || 'Error interno del servidor' }, { status: 500 })
  }
}

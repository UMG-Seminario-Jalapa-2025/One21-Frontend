import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

import { serialize } from 'cookie'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { username, password } = body

  try {
    // ================= LOGIN =================
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
      return NextResponse.json(
        { message: data?.message || 'Error de autenticación' },
        { status: res.status }
      )
    }

    const token: string | null = data?.access_token || null
    let roles: string[] = data?.roles || []
    const email: string = username

    if (!token) {
      return NextResponse.json({ message: 'Token no recibido' }, { status: 401 })
    }

    try {
      const verifyRes = await fetch(`${process.env.AUTH_API_BASE}/auth/verifyToken`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })


      if (verifyRes.ok) {
        const verifyData = await verifyRes.json()

        roles = verifyData?.realm_access?.roles || []

      }
    } catch (err) {
      console.error('❌ Error llamando a verifyToken:', err)
    }



    // ================= BUSCAR PARTNER POR EMAIL =================
    let partnerId: number | null = null

    try {
      const partnerRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE}partners/by-email/${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (partnerRes.ok) {
        const partnerData = await partnerRes.json()

        partnerId =
          Array.isArray(partnerData) && partnerData.length > 0
            ? partnerData[0].id
            : null

      } else {
        console.error('❌ Error buscando partner por email:', partnerRes.status)
      }
    } catch (err) {
      console.error('❌ Error obteniendo partner:', err)
    }

    // ================= RESPUESTA =================
    const response = NextResponse.json({ message: 'Login exitoso' })

    // TOKEN (httpOnly)
    response.headers.append(
      'Set-Cookie',
      serialize(process.env.AUTH_COOKIE_NAME || 'one21_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE || '604800'),
        path: '/',
        sameSite: 'lax'
      })
    )

    // ROLES (legibles desde frontend)
    response.headers.append(
      'Set-Cookie',
      serialize('one21_roles', JSON.stringify(roles), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE || '604800'),
        path: '/',
        sameSite: 'lax'
      })
    )

    // EMAIL (legible desde frontend)
    response.headers.append(
      'Set-Cookie',
      serialize('one21_email', email, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE || '604800'),
        path: '/',
        sameSite: 'lax'
      })
    )

    // PARTNER ID (legible desde frontend)
    response.headers.append(
      'Set-Cookie',
      serialize('one21_partner', partnerId ? String(partnerId) : '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE || '604800'),
        path: '/',
        sameSite: 'lax'
      })
    )

    return response
  } catch (err) {
    console.error('❌ Error en login:', err)

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

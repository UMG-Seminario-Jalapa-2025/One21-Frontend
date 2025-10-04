import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const baseUrlTemp = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const token = tokenCookie.value

    // 👉 Consumimos la API de backend
    const res = await fetch(`${baseUrlTemp}partners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    let data: any
    const contentType = res.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      data = await res.json()
    } else {
      data = { message: await res.text() }
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'partner',
          error: data?.error || 'partner_error',
          message: data?.detail || data?.message || 'Error al obtener partners'
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error en GET /api/personas:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

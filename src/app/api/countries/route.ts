import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Base URL del servicio de partners
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}partners/countries`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    console.log('Response status:', res) // Log del estado de la respuesta

    if (!res.ok) {
      return NextResponse.json({ step: 'countries_get', message: 'Error al obtener países' }, { status: res.status })
    }

    const data = await res.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error GET /api/countries:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}partners/countries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {

      return NextResponse.json({ step: 'country_create', message: data?.message || 'Error al crear país' }, { status: res.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('❌ Error POST /api/countries:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}departments`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_get', message: 'Error al obtener departamentos' },
        { status: res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error en /api/departments/obtener:', err)
    
    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

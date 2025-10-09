import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091/'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}/employees/departments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const errorText = await res.text()

      return NextResponse.json(
        { step: 'department_get', message: 'Error al obtener departamentos', backend: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error en /api/employee_departments/obtener:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

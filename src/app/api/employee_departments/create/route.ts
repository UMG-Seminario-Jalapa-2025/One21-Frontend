import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}/employees/departments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: body.code,
        name: body.name,
        isActive: body.isActive
      })
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('❌ Error en /api/employee_departments/create:', err)
    
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

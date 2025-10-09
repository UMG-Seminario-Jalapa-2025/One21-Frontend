import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token)
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${baseUrl}/employees/job-position`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    // Algunos controladores devuelven 204 sin cuerpo
    if (res.status === 204) {
      return NextResponse.json({ message: 'Puesto creado con éxito' }, { status: 204 })
    }

    let data = null

    try {
      data = await res.json()
    } catch {
      data = { message: 'Puesto creado con éxito' }
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('❌ Error POST /employee_positions/create:', err)

    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

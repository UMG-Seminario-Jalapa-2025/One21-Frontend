import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091/'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}employees/departments`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      return NextResponse.json(
        { step: 'departments_get', message: 'Error al obtener departamentos' },
        { status: res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log('Body recibido en POST /api/departamentos:', body)

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const payload = {
      code: body.code,
      name: body.name,
      isActive:
        body.isActive === true ||
        body.isActive === 1 ||
        body.is_active === true ||
        body.is_active === 1
          ? 1
          : 0,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt
    }

    const res = await fetch(`${baseUrl}empployees/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_create', message: data?.message || 'Error al crear departamento' },
        { status: res.status }
      )
    }

    const mapped = {
      id: data.id,
      code: data.code,
      name: data.name,
      isActive: !!data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return NextResponse.json(mapped, { status: 201 })
  } catch (err) {
    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

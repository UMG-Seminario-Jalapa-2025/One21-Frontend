import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091/'

// Helper function to parse response data
async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return await response.json()
  }

  return { message: await response.text() }
}

// Helper function to validate token from cookies
function getTokenFromCookies(req: NextRequest) {
  const token = req.cookies.get('one21_token')?.value

  if (!token) {
    return NextResponse.json(
      { step: 'auth', message: 'Token no encontrado. Por favor inicia sesión.' },
      { status: 401 }
    )
  }

  return token
}

export async function GET(req: NextRequest) {
  try {
    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const res = await fetch(`${baseUrl}employees/departments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    const data = await parseResponse(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'departments_get',
          error: data?.error || 'departments_error',
          message: data?.detail || data?.message || 'Error al obtener departamentos'
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Error en /api/empleados/departamentos:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const body = await req.json()

    console.log('Body recibido en POST /api/departamentos:', body)

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

    const res = await fetch(`${baseUrl}employees/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await parseResponse(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'department_create',
          error: data?.error || 'department_create_error',
          message: data?.detail || data?.message || 'Error al crear departamento'
        },
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
    console.error('Error en /api/empleados/departamentos POST:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

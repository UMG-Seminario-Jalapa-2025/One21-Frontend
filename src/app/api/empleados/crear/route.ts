import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const body = await req.json()

    const res = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const data = await parseResponse(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'employee_create',
          error: data?.error || 'employee_create_error',
          message: data?.detail || data?.message || 'Error al crear empleado'
        },
        { status: res.status }
      )
    }

    return NextResponse.json({ message: 'Empleado creado con éxito', data }, { status: 201 })
  } catch (err) {
    console.error('Error en /api/empleados/crear:', err)
    
    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

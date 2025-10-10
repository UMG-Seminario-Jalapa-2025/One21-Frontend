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
          step: 'department_get',
          error: data?.error || 'departments_error',
          message: data?.detail || data?.message || 'Error al obtener departamentos'
        },
        { status: res.status }
      )
    }

    console.log("👉 Backend devolvió:", data) // Debug

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Error en /api/empleados/departamentos/obtener:', err)
    
    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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

// Helper function to fetch employees
async function fetchEmployees(baseUrl: string, token: string) {
  return await fetch(`${baseUrl}/employees`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle employees error
function handleEmployeesError(employeesData: any, status: number) {
  return NextResponse.json(
    {
      step: 'employees',
      error: employeesData?.error || 'employees_error',
      message: employeesData?.detail || employeesData?.message || 'Error al obtener empleados'
    },
    { status }
  )
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    // Fetch employees
    const employeesRes = await fetchEmployees(baseUrl, token)
    const employeesData = await parseResponse(employeesRes)

    // Handle error response
    if (!employeesRes.ok) {
      return handleEmployeesError(employeesData, employeesRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Empleados obtenidos con éxito', data: employeesData },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/empleados/listar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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

// Helper function to fetch job positions
async function fetchJobPositions(baseUrl: string, token: string) {
  return await fetch(`${baseUrl}/employees/job-position`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle job positions error
function handleJobPositionsError(jobPositionsData: any, status: number) {
  return NextResponse.json(
    {
      step: 'job_positions',
      error: jobPositionsData?.error || 'job_positions_error',
      message: jobPositionsData?.detail || jobPositionsData?.message || 'Error al obtener puestos'
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

    // Fetch job positions
    const jobPositionsRes = await fetchJobPositions(baseUrl, token)
    const jobPositionsData = await parseResponse(jobPositionsRes)

    // Handle error response
    if (!jobPositionsRes.ok) {
      return handleJobPositionsError(jobPositionsData, jobPositionsRes.status)
    }

    // Success response
    return NextResponse.json(jobPositionsData, { status: 200 })
  } catch (err) {
    console.error('Error en /api/empleados/puestos:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

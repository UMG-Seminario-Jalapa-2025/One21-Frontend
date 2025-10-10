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

// Helper function to fetch bosses/employees
async function fetchBosses(baseUrl: string, token: string) {
  return await fetch(`${baseUrl}/employees`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle bosses error
function handleBossesError(bossesData: any, status: number) {
  return NextResponse.json(
    {
      step: 'bosses',
      error: bossesData?.error || 'bosses_error',
      message: bossesData?.detail || bossesData?.message || 'Error al obtener jefes'
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

    // Fetch bosses
    const bossesRes = await fetchBosses(baseUrl, token)
    const bossesData = await parseResponse(bossesRes)

    // Handle error response
    if (!bossesRes.ok) {
      return handleBossesError(bossesData, bossesRes.status)
    }

    // Success response
    return NextResponse.json(bossesData, { status: 200 })
  } catch (err) {
    console.error('Error en /api/empleados/jefes:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

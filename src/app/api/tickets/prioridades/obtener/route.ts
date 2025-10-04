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

// Helper function to fetch priorities
async function fetchPriorities(baseUrl: string, token: string) {
  return await fetch(`${baseUrl}ticket/priorities`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle priorities error
function handlePrioritiesError(prioritiesData: any, status: number) {
  return NextResponse.json(
    {
      step: 'priorities',
      error: prioritiesData?.error || 'priorities_error',
      message: prioritiesData?.detail || prioritiesData?.message || 'Error al obtener prioridades'
    },
    { status }
  )
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    // Fetch priorities
    const prioritiesRes = await fetchPriorities(baseUrl, token)
    const prioritiesData = await parseResponse(prioritiesRes)

    // Handle error response
    if (!prioritiesRes.ok) {
      return handlePrioritiesError(prioritiesData, prioritiesRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Prioridades obtenidas con éxito', data: prioritiesData },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/tickets/prioridades/obtener:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

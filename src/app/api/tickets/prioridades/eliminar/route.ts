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

// Helper function to get priority ID from query params
function getPriorityIdFromQuery(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const priorityId = searchParams.get('id')

  if (!priorityId) {
    return NextResponse.json(
      { step: 'validation', message: 'El ID de la prioridad es requerido' },
      { status: 400 }
    )
  }

  return priorityId
}

// Helper function to delete priority
async function deletePriority(baseUrl: string, token: string, priorityId: string) {
  return await fetch(`${baseUrl}priorities/${priorityId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle priority error
function handlePriorityError(priorityData: any, status: number) {
  return NextResponse.json(
    {
      step: 'priority',
      error: priorityData?.error || 'priority_error',
      message: priorityData?.detail || priorityData?.message || 'Error al eliminar prioridad'
    },
    { status }
  )
}

export async function DELETE(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    // Get priority ID from query params
    const priorityIdResult = getPriorityIdFromQuery(req)

    if (priorityIdResult instanceof NextResponse) {
      return priorityIdResult
    }

    const priorityId = priorityIdResult

    // Delete priority
    const priorityRes = await deletePriority(baseUrl, token, priorityId)
    const priorityResData = await parseResponse(priorityRes)

    // Handle error response
    if (!priorityRes.ok) {
      return handlePriorityError(priorityResData, priorityRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Prioridad eliminada con éxito', data: priorityResData },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/tickets/prioridades/eliminar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

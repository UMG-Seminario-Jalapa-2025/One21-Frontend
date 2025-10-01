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

// Helper function to validate priority data
function validatePriorityData(body: any) {
  if (!body.code || !body.code.trim()) {
    return NextResponse.json(
      { step: 'validation', message: 'El código es requerido' },
      { status: 400 }
    )
  }

  if (!body.name || !body.name.trim()) {
    return NextResponse.json(
      { step: 'validation', message: 'El nombre es requerido' },
      { status: 400 }
    )
  }

  if (body.level === undefined || body.level === null) {
    return NextResponse.json(
      { step: 'validation', message: 'El nivel es requerido' },
      { status: 400 }
    )
  }

  return null
}

// Helper function to prepare priority data
function preparePriorityData(body: any) {
  const now = new Date().toISOString()

  return {
    code: body.code.trim(),
    name: body.name.trim(),
    level: Number(body.level),
    slaHours: null,
    isActive: null,
    createdAt: now,
    updatedAt: now
  }
}

// Helper function to create priority
async function createPriority(baseUrl: string, token: string, priorityData: any) {
  return await fetch(`${baseUrl}ticket/priorities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(priorityData)
  })
}

// Helper function to handle priority error
function handlePriorityError(priorityData: any, status: number) {
  return NextResponse.json(
    {
      step: 'priority',
      error: priorityData?.error || 'priority_error',
      message: priorityData?.detail || priorityData?.message || 'Error al crear prioridad'
    },
    { status }
  )
}

export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    // Get request body
    const body = await req.json()

    // Validate priority data
    const validationError = validatePriorityData(body)

    if (validationError) {
      return validationError
    }

    // Prepare priority data
    const priorityData = preparePriorityData(body)

    // Create priority
    const priorityRes = await createPriority(baseUrl, token, priorityData)
    const priorityResData = await parseResponse(priorityRes)

    // Handle error response
    if (!priorityRes.ok) {
      return handlePriorityError(priorityResData, priorityRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Prioridad creada con éxito', data: priorityResData },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error en /api/tickets/prioridades/crear:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

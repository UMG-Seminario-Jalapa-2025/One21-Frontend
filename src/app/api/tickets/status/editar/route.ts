import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) return await response.json()

  return { message: await response.text() }
}

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

function validateStatusData(body: any) {
  if (!body.id) {
    return NextResponse.json({ step: 'validation', message: 'El ID es requerido' }, { status: 400 })
  }

  if (!body.code || !body.code.trim()) {
    return NextResponse.json({ step: 'validation', message: 'El código es requerido' }, { status: 400 })
  }

  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ step: 'validation', message: 'El nombre es requerido' }, { status: 400 })
  }

  if (body.isFinal === undefined || body.isFinal === null) {
    return NextResponse.json({ step: 'validation', message: 'El indicador isFinal es requerido' }, { status: 400 })
  }

  if (body.isActive === undefined || body.isActive === null) {
    return NextResponse.json({ step: 'validation', message: 'El estado isActive es requerido' }, { status: 400 })
  }

  return null
}

function prepareStatusData(body: any) {
  return {
    id: body.id,
    code: body.code.trim(),
    name: body.name.trim(),
    isFinal: Boolean(body.isFinal),
    isActive: Boolean(body.isActive),
    createdAt: body.createdAt,
    updatedAt: new Date().toISOString()
  }
}

async function updateStatus(baseUrl: string, token: string, statusData: any) {
  console.log('RL completa:', `${baseUrl}tickets/ticket/statuses`)
  console.log('Datos enviados:', statusData)

  return await fetch(`${baseUrl}tickets/ticket/statuses`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(statusData)
  })
}

function handleStatusError(data: any, status: number) {
  return NextResponse.json(
    {
      step: 'status',
      error: data?.error || 'status_error',
      message: data?.detail || data?.message || 'Error al editar estado'
    },
    { status }
  )
}

export async function PUT(req: NextRequest) {
  try {
    console.log('Iniciando edición de estado...')

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8081/'

    console.log('Base URL:', baseUrl)

    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) return tokenResult
    const token = tokenResult

    const body = await req.json()

    console.log('Body recibido:', body)

    const validationError = validateStatusData(body)

    if (validationError) return validationError

    const statusData = prepareStatusData(body)

    const res = await updateStatus(baseUrl, token, statusData)

    console.log('Status de respuesta:', res.status)

    const resData = await parseResponse(res)

    console.log('Datos de respuesta:', resData)

    if (!res.ok) return handleStatusError(resData, res.status)

    return NextResponse.json({ message: 'Estado editado con éxito', data: resData }, { status: 200 })
  } catch (err) {
    console.error('Error en /api/tickets/status/editar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor', error: String(err) },
      { status: 500 }
    )
  }
}

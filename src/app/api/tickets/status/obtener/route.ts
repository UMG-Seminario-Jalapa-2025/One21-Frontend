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

async function fetchStatuses(baseUrl: string, token: string) {
  console.log('URL completa:', `${baseUrl}statuses`)

  return await fetch(`${baseUrl}statuses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

function handleStatusesError(data: any, status: number) {
  return NextResponse.json(
    {
      step: 'statuses',
      error: data?.error || 'statuses_error',
      message: data?.detail || data?.message || 'Error al obtener estados'
    },
    { status }
  )
}

export async function GET(req: NextRequest) {
  try {
    console.log('Iniciando obtención de estados...')

    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/'

    console.log('Base URL:', baseUrl)

    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) return tokenResult
    const token = tokenResult

    const res = await fetchStatuses(baseUrl, token)

    console.log('Status de respuesta:', res.status)

    const data = await parseResponse(res)

    console.log(' Datos de respuesta:', data)

    if (!res.ok) return handleStatusesError(data, res.status)

    return NextResponse.json({ message: 'Estados obtenidos con éxito', data }, { status: 200 })
  } catch (err) {
    console.error('Error en /api/tickets/status/obtener:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor', error: String(err) },
      { status: 500 }
    )
  }
}

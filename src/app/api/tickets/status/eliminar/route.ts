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

function getStatusIdFromQuery(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const statusId = searchParams.get('id')

  if (!statusId) {
    return NextResponse.json({ step: 'validation', message: 'El ID del estado es requerido' }, { status: 400 })
  }

  return statusId
}

async function deleteStatus(baseUrl: string, token: string, statusId: string) {
  console.log('URL completa:', `${baseUrl}tickets/ticket/statuses/${statusId}`)

  return await fetch(`${baseUrl}tickets/ticket/statuses/${statusId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

function handleStatusError(data: any, status: number) {
  return NextResponse.json(
    {
      step: 'status',
      error: data?.error || 'status_error',
      message: data?.detail || data?.message || 'Error al eliminar estado'
    },
    { status }
  )
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('Iniciando eliminación de estado...')

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8081/'

    console.log('Base URL:', baseUrl)

    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) return tokenResult
    const token = tokenResult

    const statusIdResult = getStatusIdFromQuery(req)

    if (statusIdResult instanceof NextResponse) return statusIdResult
    const statusId = statusIdResult

    console.log(' ID del estado:', statusId)

    const res = await deleteStatus(baseUrl, token, statusId)

    console.log('Status de respuesta:', res.status)

    const resData = await parseResponse(res)

    console.log('Datos de respuesta:', resData)

    if (!res.ok) return handleStatusError(resData, res.status)

    return NextResponse.json({ message: 'Estado eliminado con éxito', data: resData }, { status: 200 })
  } catch (err) {
    console.error('Error en /api/tickets/status/eliminar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor', error: String(err) },
      { status: 500 }
    )
  }
}

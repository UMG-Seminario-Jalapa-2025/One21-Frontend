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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const res = await fetch(`${baseUrl}/job-position/${params.id}`, {
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
          step: 'job_position_get',
          error: data?.error || 'job_position_error',
          message: data?.detail || data?.message || 'Error al obtener puesto'
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Error GET /employee_positions/[id]:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const body = await req.json()

    const res = await fetch(`${baseUrl}/job-position`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await parseResponse(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'job_position_update',
          error: data?.error || 'job_position_update_error',
          message: data?.detail || data?.message || 'Error al actualizar puesto'
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Error PUT /employee_positions:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const res = await fetch(`${baseUrl}/job-position/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    // Si el backend no devuelve JSON (204 o vacío)
    if (res.status === 204 || res.status === 200) {
      return NextResponse.json({ message: 'Puesto eliminado con éxito' }, { status: 200 })
    }

    const data = await parseResponse(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'job_position_delete',
          error: data?.error || 'job_position_delete_error',
          message: data?.detail || data?.message || 'Error al eliminar puesto'
        },
        { status: res.status }
      )
    }

    return NextResponse.json({ message: 'Puesto eliminado con éxito' }, { status: 200 })
  } catch (err) {
    console.error('Error DELETE /employee_positions/[id]:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

// Evitar caché de Next en este handler
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

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

// ================= PUT /api/empleados/:id =================
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const payload = await req.json()

    const res = await fetch(`${baseUrl}/employees/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    if (res.status === 204) {
      return NextResponse.json({ ok: true, message: 'Empleado actualizado con éxito' }, { status: 200 })
    }

    const data = await parseResponse(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'employee_update',
          error: data?.error || 'employee_update_error',
          message: data?.detail || data?.message || 'Error al actualizar empleado'
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Error en PUT /api/empleados/[id]:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ================= PATCH /api/empleados/:id =================
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const payload = await req.json()

    const res = await fetch(`${baseUrl}/employees/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    if (res.status === 204) {
      return NextResponse.json({ ok: true, message: 'Estado actualizado con éxito' }, { status: 200 })
    }

    const data = await parseResponse(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'employee_status_update',
          error: data?.error || 'employee_status_error',
          message: data?.detail || data?.message || 'Error al cambiar estado del empleado'
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Error en PATCH /api/empleados/[id]:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

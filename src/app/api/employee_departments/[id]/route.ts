import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091').replace(/\/$/, '')

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

// ================== GET ==================
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    
    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const res = await fetch(`${baseUrl}/departments/${id}`, {
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
          step: 'department_get',
          error: data?.error || 'department_error',
          message: data?.detail || data?.message || 'Error al obtener departamento'
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Error GET /employee_departments/[id]:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ================== PUT ==================
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    
    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const body = await req.json()

    // Aseguramos que el payload tenga los nombres y formato que espera el backend
    const payload = {
      id: Number(id),
      code: body.code,
      name: body.name,
      isActive: body.isActive ?? body.is_active,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt
    }

    // Enviar al endpoint genérico sin ID
    const res = await fetch(`${baseUrl}/employees/departments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await parseResponse(res)

    if (!res.ok) {
      console.error('Error PUT backend:', data)

      return NextResponse.json(
        {
          step: 'department_update',
          error: data?.error || 'department_update_error',
          message: data?.detail || data?.message || 'Error al actualizar departamento'
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Error PUT /employee_departments/[id]:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ================== DELETE ==================
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    
    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    const res = await fetch(`${baseUrl}/employees/departments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    const data = await parseResponse(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          step: 'department_delete',
          error: data?.error || 'department_delete_error',
          message: data?.detail || data?.message || 'Error al eliminar departamento'
        },
        { status: res.status }
      )
    }

    return NextResponse.json({ message: 'Departamento eliminado con éxito' }, { status: 200 })
  } catch (err) {
    console.error('Error DELETE /employee_departments/[id]:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

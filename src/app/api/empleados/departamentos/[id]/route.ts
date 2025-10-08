import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091/'

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}employees/departments/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_get', message: data?.message || 'Error al obtener departamento' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error GET /api/departamentos/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const payload = {
      id: Number(id),
      code: body.code,
      name: body.name,
      isActive: body.isActive ?? body.is_active,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt
    }

    // GenericController espera PUT en /employees/departments (sin {id})
    const res = await fetch(`${baseUrl}employees/departments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_update', message: data?.message || 'Error al actualizar departamento' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error PUT /api/departamentos/[id]:', err)
    
    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}employees/departments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_delete', message: 'Error al eliminar departamento' },
        { status: res.status }
      )
    }

    return NextResponse.json({ message: 'Departamento eliminado con éxito' })
  } catch (err) {
    console.error('❌ Error DELETE /api/departamentos/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

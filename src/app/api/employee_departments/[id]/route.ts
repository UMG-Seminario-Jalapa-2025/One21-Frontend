import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091').replace(/\/$/, '')

// ================== GET ==================
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token)
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${baseUrl}/employees/departments/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_get', message: 'Error al obtener departamento', backend: data },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error GET /employee_departments/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

// ================== PUT ==================
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token)
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    // 🔹 Aseguramos que el payload tenga los nombres y formato que espera el backend
    const payload = {
      id: Number(id),
      code: body.code,
      name: body.name,
      isActive: body.isActive ?? body.is_active,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt
    }

    // 🔹 Enviar al endpoint genérico sin ID
    const res = await fetch(`${baseUrl}/employees/departments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('❌ Error PUT backend:', data)

      return NextResponse.json(
        { step: 'department_update', message: data?.message || 'Error al actualizar departamento', backend: data },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error PUT /employee_departments/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

// ================== DELETE ==================
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token)
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${baseUrl}/employees/departments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      const text = await res.text()

      return NextResponse.json({ step: 'department_delete', message: text }, { status: res.status })
    }

    return NextResponse.json({ message: 'Departamento eliminado con éxito' })
  } catch (err) {
    console.error('❌ Error DELETE /employee_departments/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

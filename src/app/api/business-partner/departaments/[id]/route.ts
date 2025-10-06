import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    const countryId = Number(body.country_id ?? body.countryId ?? body.country?.id ?? 0)

    // Manejar is_active correctamente
    const isActive = body.is_active !== undefined ? Boolean(body.is_active) : true

    const payload = {
      id: Number(params.id),
      name: body.name,
      is_active: isActive,
      isActive: isActive,
      country_id: countryId || undefined,
      countryId: countryId || undefined,
      country: countryId ? { id: countryId } : undefined
    }

    const res = await fetch(`${baseUrl}departments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })

    const text = await res.text()
    let data: any = {}

    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text }
    }

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_update', message: data?.message || data?.raw || 'Error al actualizar departamento' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error(' Error PUT /api/departments/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}departments/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const text = await res.text()
    let data: any = {}

    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text }
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || data?.raw || 'Error al obtener departamento' },
        { status: res.status }
      )
    }

    // NORMALIZAR isActive: null → true
    const normalizedData = {
      ...data,
      isActive: data.isActive === false || data.isActive === 0 ? false : true,

      // También normalizar is_active por si acaso
      is_active: data.is_active === false || data.is_active === 0 ? false : true
    }

    return NextResponse.json(normalizedData)
  } catch (err) {
    console.error('Error GET /api/departments/[id]:', err)

    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}departments/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    const text = await res.text()
    let data: any = {}

    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text }
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || data?.raw || 'Error al eliminar departamento' },
        { status: res.status }
      )
    }

    return NextResponse.json({ message: 'Departamento eliminado con éxito' })
  } catch (err) {
    console.error('Error DELETE /api/departments/[id]:', err)

    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

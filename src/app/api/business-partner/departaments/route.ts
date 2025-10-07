import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}departments`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_get', message: data?.message || 'Error al obtener departamentos' },
        { status: res.status }
      )
    }

    const normalizedData = Array.isArray(data)
      ? data.map(dept => ({
          ...dept,
          isActive: dept.isActive === false || dept.isActive === 0 ? false : true,
          is_active: dept.is_active === false || dept.is_active === 0 ? false : true
        }))
      : data

    return NextResponse.json(normalizedData)
  } catch (err) {
    console.error('Error en /api/departments/obtener:', err)
    
    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    const countryId = Number(body.country_id ?? body.countryId ?? body.country?.id ?? 0)

    if (!countryId) {
      return NextResponse.json({ step: 'validation', message: 'country_id es requerido' }, { status: 400 })
    }

    const isActive = body.is_active !== undefined ? Boolean(body.is_active) : true

    console.log('DEBUG POST - body.is_active:', body.is_active, '→ isActive:', isActive)

    const payload = {
      name: body.name,
      is_active: isActive,
      isActive: isActive,
      country_id: countryId,
      countryId: countryId,
      country: { id: countryId }
    }

    console.log('Payload enviado al backend:', payload)

    const res = await fetch(`${baseUrl}departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })

    console.log('Respuesta bruta del backend:', res)

    const text = await res.text()
    let data: any = {}

    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text }
    }

    console.log('Respuesta del backend externo:', data)

    if (!res.ok) {
      return NextResponse.json(
        { step: 'department_create', message: data?.message || data?.raw || 'Error al crear departamento' },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Error POST /api/departments:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: any) {
  try {
    const { id } = context.params
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${baseUrl}departments/${id}`, {
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

    return NextResponse.json({ message: 'Departamento eliminado' })
  } catch (err) {
    console.error('Error DELETE /api/departments/[id]:', err)

    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

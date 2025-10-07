import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090').replace(/\/+$/, '')

function normalizeMunicipality(m: any) {
  const deptId = Number(m?.department_id ?? m?.departments_id ?? m?.departments?.id ?? m?.department?.id ?? 0) || null

  const isActiveValue = m?.isActive ?? m?.is_active

  const isActive =
    isActiveValue === false || isActiveValue === 0 || isActiveValue === '0' || isActiveValue === 'false' ? false : true

  return {
    ...m,
    isActive,
    is_active: isActive,
    department_id: deptId,
    departments_id: deptId,
    departments: m?.departments ?? (deptId ? { id: deptId } : null)
  }
}

async function readJsonSafe(res: Response) {
  const text = await res.text()

  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { raw: text }
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${API_BASE}/partners/municipalities/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })

    console.log('Respuesta del backend:', res.status, res.statusText)

    const data = await readJsonSafe(res)

    if (!res.ok) {
      return NextResponse.json(
        { step: 'municipality_get', message: data?.message || data?.raw || 'Error al obtener municipio' },
        { status: res.status }
      )
    }

    return NextResponse.json(normalizeMunicipality(data))
  } catch (err) {
    console.error('Error GET /api/municipalities/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    let deptId = Number(body.departments_id ?? body.department_id ?? body.departments?.id ?? body.department?.id ?? 0)

    if (!deptId || deptId === 0) {
      console.log('departments_id no viene en body, obteniendo del registro actual...')

      const currentRes = await fetch(`${API_BASE}/partners/municipalities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      })

      if (currentRes.ok) {
        const currentData = await readJsonSafe(currentRes)

        deptId = Number(currentData?.department_id ?? currentData?.departments_id ?? currentData?.departments?.id ?? 0)
        console.log('departments_id obtenido del registro actual:', deptId)
      }
    }

    if (!deptId || deptId === 0) {
      console.error('departments_id no válido:', deptId)

      return NextResponse.json({ step: 'validation', message: 'El departamento es obligatorio' }, { status: 400 })
    }

    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : body.is_active !== undefined
          ? Boolean(body.is_active)
          : true

    const payload: any = {
      id: Number(id),
      name: body.name,
      isActive: isActive,
      departments: { id: deptId }
    }

    console.log('Payload enviado al backend:', JSON.stringify(payload, null, 2))

    const res = await fetch(`${API_BASE}/partners/municipalities`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await readJsonSafe(res)

    if (!res.ok) {
      console.error('Error del backend:', res.status, data)

      return NextResponse.json(
        { step: 'municipality_update', message: data?.message || data?.raw || 'Error al actualizar municipio' },
        { status: res.status }
      )
    }

    return NextResponse.json(normalizeMunicipality(data))
  } catch (err) {
    console.error('Error PUT /api/municipalities/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${API_BASE}/partners/municipalities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      const data = await readJsonSafe(res)

      return NextResponse.json(
        { step: 'municipality_delete', message: data?.message || data?.raw || 'Error al eliminar municipio' },
        { status: res.status }
      )
    }

    return NextResponse.json({ message: 'Municipio eliminado con éxito' })
  } catch (err) {
    console.error('Error DELETE /api/municipalities/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

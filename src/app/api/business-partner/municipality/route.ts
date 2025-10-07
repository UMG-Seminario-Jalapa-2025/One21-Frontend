import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090').replace(/\/+$/, '')

async function readJsonSafe(res: Response) {
  const text = await res.text()

  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { raw: text }
  }
}

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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })

    const deptId = Number(body.departments_id ?? body.department_id ?? body?.departments?.id ?? 0)

    if (!deptId) {
      return NextResponse.json({ step: 'validation', message: 'departments_id es requerido' }, { status: 400 })
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ step: 'validation', message: 'name es requerido' }, { status: 400 })
    }

    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : body.is_active !== undefined
          ? Boolean(body.is_active)
          : true

    console.log('🔍 DEBUG POST Municipio - body.is_active:', body.is_active, '→ isActive:', isActive)

    const payload = {
      name: body.name,
      isActive: isActive,
      departments: { id: deptId }
    }

    console.log('Payload enviado:', payload)

    const res = await fetch(`${API_BASE}/partners/municipalities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })

    const data = await readJsonSafe(res)

    console.log('Respuesta del backend:', data)

    if (!res.ok) {
      return NextResponse.json(
        { step: 'municipality_create', message: data?.message || data?.raw || 'Error al crear municipio' },
        { status: res.status }
      )
    }

    return NextResponse.json(normalizeMunicipality(data), { status: 201 })
  } catch (e) {
    console.error('Error POST /api/municipalities:', e)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

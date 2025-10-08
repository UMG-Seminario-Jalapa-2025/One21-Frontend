import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

// Evitar caché de Next en este handler
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// ================= PUT /api/empleados/:id =================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })

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

    if (res.status === 204) return NextResponse.json({ ok: true }, { status: 200 })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) return NextResponse.json(data, { status: res.status })

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error en PUT /api/empleados/[id]:', err)

    return NextResponse.json({ message: 'Error interno al actualizar empleado' }, { status: 500 })
  }
}

// ================= PATCH /api/empleados/:id =================
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const cookieStore = await cookies() // 👈 También aquí
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })

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

    if (res.status === 204) return NextResponse.json({ ok: true }, { status: 200 })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) return NextResponse.json(data, { status: res.status })

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error en PATCH /api/empleados/[id]:', err)

    return NextResponse.json({ message: 'Error interno al cambiar estado del empleado' }, { status: 500 })
  }
}

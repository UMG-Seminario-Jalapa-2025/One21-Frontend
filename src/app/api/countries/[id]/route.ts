import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}partners/countries/${params.id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    
    if (!res.ok) {
      return NextResponse.json({ step: 'country_get', message: data?.message || 'Error al obtener país' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error GET /api/countries/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}partners/countries`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...body, id: Number(params.id) })
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ step: 'country_update', message: data?.message || 'Error al actualizar país' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error PUT /api/countries/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    const res = await fetch(`${baseUrl}partners/countries/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      return NextResponse.json({ step: 'country_delete', message: 'Error al eliminar país' }, { status: res.status })
    }

    return NextResponse.json({ message: 'País eliminado con éxito' })
  } catch (err) {
    console.error('❌ Error DELETE /api/countries/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

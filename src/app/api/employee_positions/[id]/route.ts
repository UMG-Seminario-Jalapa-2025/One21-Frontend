import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091/'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token)
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${baseUrl}/employees/job-position/${params.id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('❌ Error GET /employee_positions/[id]:', err)

    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token)
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${baseUrl}/employees/job-position`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('❌ Error PUT /employee_positions:', err)

    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token)
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })

    const res = await fetch(`${baseUrl}/employees/job-position/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    // ✅ Si el backend no devuelve JSON (204 o vacío)
    if (res.status === 204 || res.status === 200) {
      return NextResponse.json({ message: 'Puesto eliminado con éxito' }, { status: 200 })
    }

    let data = null

    try {
      data = await res.json()
    } catch {
      data = { message: 'Eliminado correctamente' }
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('❌ Error DELETE /employee_positions/[id]:', err)
    
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}


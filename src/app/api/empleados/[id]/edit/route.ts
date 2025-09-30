import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'


type RouteContext = {
  params: {
    id: string
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

    const cookieStore = cookies()

    const tokenCookie = cookieStore.get(
      process.env.AUTH_COOKIE_NAME || 'one21_token'
    )

    if (!tokenCookie?.value) {
      return NextResponse.json(
        { message: 'Token no encontrado' },
        { status: 401 }
      )
    }

    const token = tokenCookie.value
    const body = await req.json()

    const res = await fetch(`${baseUrl}/employees/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const msg = await res.text()

      return NextResponse.json(
        { message: msg || 'Error al actualizar empleado' },
        { status: res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error en /api/empleados/[id]/edit:', err)

    return NextResponse.json(
      { message: 'Error interno al actualizar empleado' },
      { status: 500 }
    )
  }
}

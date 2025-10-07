import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function PATCH(req: Request, context: any) {
  try {
    const id = context?.params?.id as string

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const token = tokenCookie.value
    const body = await req.json()

    const res = await fetch(`${baseUrl}/employees/status/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const msg = await res.text()

      return NextResponse.json(
        { message: msg || 'Error al actualizar estado del empleado' },
        { status: res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error en /api/empleados/status/[id]:', err)

    return NextResponse.json(
      { message: 'Error interno al cambiar estado del empleado' },
      { status: 500 }
    )
  }
}

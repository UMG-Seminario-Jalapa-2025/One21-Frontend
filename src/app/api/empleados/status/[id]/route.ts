import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function PATCH(req: Request, context: any): Promise<NextResponse> {
  try {
    const { id } = context.params

    const EMPLOYEE_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const token = tokenCookie.value
    const { status } = await req.json()

    // REVISAR ESTE ENPOINT POR CAMBIOS
    const res = await fetch(`${EMPLOYEE_BASE_URL}/employees/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })

    if (!res.ok) {
      const msg = await res.text()

      console.error(`❌ Backend devolvió error: ${res.status} - ${msg}`)

      return NextResponse.json(
        { message: msg || 'Error al actualizar status' },
        { status: res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error en /api/empleados/status/[id]:', err)

    return NextResponse.json(
      { message: 'Error interno al actualizar status' },
      { status: 500 }
    )
  }
}

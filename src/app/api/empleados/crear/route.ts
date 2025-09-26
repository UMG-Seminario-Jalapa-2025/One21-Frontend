import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ✅ Obtener cookie de forma correcta (es asincrónica)
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ message: 'No autorizado, token no encontrado' }, { status: 401 })
    }

    // ✅ Verifica que la URL esté definida correctamente
    const EMPLOYEE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

    const res = await fetch(`${EMPLOYEE_BASE_URL}/employees/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || 'Error al crear empleado' },
        { status: res.status }
      )
    }

    return NextResponse.json(
      { message: 'Empleado creado con éxito', data },
      { status: 201 }
    )
  } catch (err) {
    console.error('❌ Error en /api/empleados/crear:', err)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

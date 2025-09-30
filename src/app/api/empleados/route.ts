import { NextResponse } from 'next/server'

export async function GET() {
  try {

    const EMPLOYEE_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091/'

    const res = await fetch(`${EMPLOYEE_BASE_URL}/employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const msg = await res.text()

      return NextResponse.json(
        { message: msg || 'Error al obtener empleados' },
        { status: res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json(data, { status: 200 })

  } catch (err) {
    console.error('❌ Error en /api/empleados:', err)

    return NextResponse.json(
      { message: 'Error interno al obtener empleados' },
      { status: 500 }
    )
  }
}

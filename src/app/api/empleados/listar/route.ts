import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const EMPLOYEE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

    const res = await fetch(`${EMPLOYEE_BASE_URL}/employees`)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ message: 'Error al obtener empleados' }, { status: res.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('❌ Error en /listar:', err)
    
    return NextResponse.json({ message: 'Error interno al obtener empleados' }, { status: 500 })
  }
}

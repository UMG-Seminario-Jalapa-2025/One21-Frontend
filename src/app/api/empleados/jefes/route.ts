import { NextResponse } from 'next/server'

export async function GET() {
  const EMPLOYEE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'

  try {
    const res = await fetch(`${EMPLOYEE_BASE_URL}/employees`)
    const data = await res.json()

    // Filtrar solo los empleados con un campo identificador si es necesario
    return NextResponse.json(data)
  } catch (err) {
    console.error('Error al obtener jefes:', err)
    
    return NextResponse.json({ message: 'Error al obtener jefes' }, { status: 500 })
  }
}

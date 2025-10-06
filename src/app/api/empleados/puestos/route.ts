import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE}/job-position`)
    const data = await res.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener puestos:', error)

    return NextResponse.json({ message: 'Error al obtener puestos' }, { status: 500 })
  }
}

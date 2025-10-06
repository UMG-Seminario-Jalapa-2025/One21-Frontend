import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE}departments`)
    const data = await res.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener departamentos:', error)

    return NextResponse.json({ message: 'Error al obtener departamentos' }, { status: 500 })
  }
}

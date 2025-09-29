import { NextResponse } from 'next/server'

export async function GET() {
  const EMPLOYEE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091'
  const res = await fetch(`${EMPLOYEE_BASE_URL}/employees`)
  const data = await res.json()

  console.log('👀 empleadosData:', empleadosData)

  return NextResponse.json(data)
}

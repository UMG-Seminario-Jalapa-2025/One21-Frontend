import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const partner = cookieStore.get('one21_partner')?.value || null
    const email = cookieStore.get('one21_email')?.value || null

    return NextResponse.json({ partner, email })
  } catch (error) {
    console.error('Error leyendo cookies:', error)

    return NextResponse.json({ message: 'Error leyendo cookies' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()

    const email = cookieStore.get('one21_email')?.value || null
    const token = cookieStore.get('one21_token')?.value || null

    // Si no hay email → mensaje genérico
    if (!email) {
      return NextResponse.json({
        message: 'Bienvenido devuelta administrador'
      })
    }

    // ================= BUSCAR PARTNER POR EMAIL =================
    let partnerName: string | null = null

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE}partners/partners/by-email/${encodeURIComponent(email)}`

      const partnerRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })


      if (partnerRes.ok) {
        const data = await partnerRes.json()

        if (Array.isArray(data) && data.length > 0) {
          partnerName = data[0].name ?? null
        }
      }
    } catch (err) {
      console.error('❌ Error obteniendo partner:', err)
    }

    // Si no se encontró partner → mensaje genérico
    if (!partnerName) {
      return NextResponse.json({
        message: 'Bienvenido Devuelta Administrador'
      })
    }

    // Si sí existe → mensaje personalizado
    return NextResponse.json({
      message: `Bienvenido ${partnerName}`
    })
  } catch (error) {
    console.error('❌ Error leyendo cookies:', error)

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

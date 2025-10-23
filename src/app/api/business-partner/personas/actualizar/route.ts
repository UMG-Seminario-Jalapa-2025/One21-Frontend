import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { partnerId, ...updates } = body

    if (!partnerId) {
      return NextResponse.json(
        { step: 'validation', message: 'partnerId es requerido' },
        { status: 400 }
      )
    }

    // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    //   return NextResponse.json({ step: 'email', message: 'El email de contacto no es válido' }, { status: 400 })
    // }

    const baseUrlPather = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

    // ✅ Token desde cookies
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const token = tokenCookie.value

    // 1. Obtener partner actual
    const partnerResGet = await fetch(`${baseUrlPather}partners/partners/${partnerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!partnerResGet.ok) {
      return NextResponse.json(
        { step: 'partner_get', message: 'Error al obtener partner' },
        { status: partnerResGet.status }
      )
    }

    const currentPartner = await partnerResGet.json()

    // 2. Combinar datos actuales con lo que mande el frontend
    const updatedPartner = {
      ...currentPartner,
      ...updates
    }

    // 3. PUT para actualizar
    const partnerResPut = await fetch(`${baseUrlPather}partners/partners`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedPartner)
    })

    let partnerUpdateData: any
    const partnerUpdateContentType = partnerResPut.headers.get('content-type')

    if (partnerUpdateContentType && partnerUpdateContentType.includes('application/json')) {
      partnerUpdateData = await partnerResPut.json()
    } else {
      partnerUpdateData = { message: await partnerResPut.text() }
    }

    if (!partnerResPut.ok) {
      return NextResponse.json(
        {
          step: 'partner_update',
          error: partnerUpdateData?.error || 'partner_error',
          message: partnerUpdateData?.detail || partnerUpdateData?.message || 'Error al actualizar partner'
        },
        { status: partnerResPut.status }
      )
    }

    return NextResponse.json(
      { message: 'Partner actualizado con éxito', partner: partnerUpdateData },
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ Error en /api/personas/actualizar-rol:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

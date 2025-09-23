import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const baseUrlTemp = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const token = tokenCookie.value

    const partnerPayload = {
      code: '502',
      name: `${body.firstName} ${body.lastName}`,
      tax_id: body.taxId || 'String',
      email: body.email,
      isActive: true,
      isCustomer: true,
      isVendor: false,
      isEmployee: false,
      notes: body.notes || null,
      created_by: 1
    }

    const partnerRes = await fetch(`${baseUrlTemp}partners/partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(partnerPayload)
    })

    let partnerData: any
    const partnerContentType = partnerRes.headers.get('content-type')


    if (partnerContentType && partnerContentType.includes('application/json')) {
      partnerData = await partnerRes.json()
    } else {
      partnerData = { message: await partnerRes.text() }
    }

    if (!partnerRes.ok) {
      let statusCode = partnerRes.status

      if (partnerData?.detail?.includes('duplicate key')) {
        statusCode = 409
      }

      return NextResponse.json(
        { step: 'partner', error: partnerData?.error || 'partner_error', message: partnerData?.detail || partnerData?.message || 'Error al crear partner' },
        { status: statusCode }
      )
    }

    const partnerId = partnerData.id

    const addressPayload = {
      businessPartner: { id: partnerId },
      addressType: 'HOME',
      street: body.street || 'Principal',
      street2: body.number || null,
      neighborhood: body.neighborhood,
      postalCode: body.postalCode,
      isDefault: 1,
      isActive: 1
    }

    const addressRes = await fetch(`${baseUrlTemp}partners/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(addressPayload)
    })

    let addressData: any
    const addressContentType = addressRes.headers.get('content-type')

    if (addressContentType && addressContentType.includes('application/json')) {
      addressData = await addressRes.json()
    } else {
      addressData = { message: await addressRes.text() }
    }

    if (!addressRes.ok) {
      let statusCode = addressRes.status

      if (addressData?.detail?.includes('duplicate key')) {
        statusCode = 409
      }

      return NextResponse.json(
        { step: 'address', error: addressData?.error || 'address_error', message: addressData?.detail || addressData?.message || 'Error al crear dirección' },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { message: 'Persona creada con éxito', partner: partnerData, address: addressData },
      { status: 201 }
    )
  } catch (err) {
    console.error('❌ Error en /api/personas:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

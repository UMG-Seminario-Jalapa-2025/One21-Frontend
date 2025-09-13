import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'

    // Paso 1: Crear Partner
    const partnerPayload = {
      code: body.username,
      commercialName: `${body.firstName} ${body.lastName}`,
      type: { id: 1 },       // 🔥 Quemado
      category: { id: 1 },   // 🔥 Quemado
      email: body.email,
      phone: body.mobile,
      isActive: true
    }

    const partnerRes = await fetch(`${baseUrl}partners/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      return NextResponse.json(
        { step: 'partner', message: partnerData?.message || 'Error al crear partner' },
        { status: partnerRes.status }
      )
    }

    const partnerId = partnerData.id

    // Paso 2: Crear Address con el partnerId
    const addressPayload = {
      businessPartner: { id: partnerId },
      addressType: 'HOME', // 🔥 Quemado
      street: body.street,
      street2: body.number,
      neighborhood: body.neighborhood,
      postalCode: body.zone,
      city: { id: 1 },     // 🔥 Quemado
      state: { id: 1 },    // 🔥 Quemado
      country: { id: 1 },  // 🔥 Quemado
      isDefault: true,
      isActive: true
    }

    const addressRes = await fetch(`${baseUrl}partners/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      return NextResponse.json(
        { step: 'address', message: addressData?.message || 'Error al crear dirección' },
        { status: addressRes.status }
      )
    }

    return NextResponse.json(
      { message: 'Partner y dirección creados con éxito', partner: partnerData, address: addressData },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error en /api/pather:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

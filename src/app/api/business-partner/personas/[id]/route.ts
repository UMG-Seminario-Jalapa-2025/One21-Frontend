import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

// ================= GET =================
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    // Obtener dirección del partner
    const resAddress = await fetch(`${baseUrl}partners/addresses/by-partner/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    const dataAddress = await resAddress.json()

    if (!resAddress.ok) {

      return NextResponse.json(
        { step: 'partner_address_get', message: dataAddress?.message || 'Error al obtener dirección' },
        { status: resAddress.status }
      )
    }

    // Obtener contactos del partner
    const resContacts = await fetch(`${baseUrl}partners/contacts/by-partner/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    const dataContacts = await resContacts.json()

    if (!resContacts.ok) {

      return NextResponse.json(
        { step: 'contacts_get', message: dataContacts?.message || 'Error al obtener contactos' },
        { status: resContacts.status }
      )
    }

    // 🔹 4. Respuesta combinada
    return NextResponse.json({
      address: dataAddress,
      phone:  dataContacts, // Devolver contactos tal cual (raw)
    })
  } catch (err) {
    console.error('❌ Error GET /api/business-partner/personas/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}


// ================= PUT =================
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id } = await context.params
    const body = await req.json()

    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')?.value

    if (!token) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado' }, { status: 401 })
    }

    // 🔹 1. Actualizar el partner
    const partnerPayload = {
      id: body.businessPartner.id,
      code: body.businessPartner.code,
      name: body.businessPartner.name,
      taxId: body.businessPartner.taxId,
      email: body.businessPartner.email,
      isActive: body.businessPartner.isActive,
      isCustomer: body.businessPartner.isCustomer,
      isVendor: body.businessPartner.isVendor,
      isEmployee: body.businessPartner.isEmployee,
      notes: body.businessPartner.notes,
      createdBy: body.businessPartner.createdBy,
      updatedBy: body.businessPartner.updatedBy,
      createdAt: body.businessPartner.createdAt,
      updatedAt: body.businessPartner.updatedAt
    }

    const resPartner = await fetch(`${baseUrl}partners/partners`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(partnerPayload)
    })

    const dataPartner = await resPartner.json()

    if (!resPartner.ok) {

      return NextResponse.json(
        { step: 'partner_update', message: dataPartner?.message || 'Error al actualizar partner' },
        { status: resPartner.status }
      )
    }

    // 🔹 2. Actualizar el address
    const addressPayload = {
      id: body.id,
      addressType: body.addressType,
      street: body.street,
      street2: body.street2,
      neighborhood: body.neighborhood,
      postalCode: body.postalCode,
      isDefault: body.isDefault,
      isActive: body.isActive,
      municipality: body.municipality,
      businessPartner: { id: partnerPayload.id } // relación
    }

    const resAddress = await fetch(`${baseUrl}partners/addresses`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(addressPayload)
    })

    const dataAddress = await resAddress.json()

    if (!resAddress.ok) {

      return NextResponse.json(
        { step: 'address_update', message: dataAddress?.message || 'Error al actualizar dirección' },
        { status: resAddress.status }
      )
    }

    return NextResponse.json({
      partner: dataPartner,
      address: dataAddress
    })
  } catch (err) {
    console.error('❌ Error PUT /api/business-partner/personas/[id]:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno' }, { status: 500 })
  }
}

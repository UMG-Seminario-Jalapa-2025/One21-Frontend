import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// 🔹 Función para generar un UID único para el partner
function generatePartnerUID(nombres?: string, apellidos?: string): string {
  const prefix = 'PA' // prefijo fijo para Partner

  const initials =
    ((nombres?.substring(0, 2) || '') + (apellidos?.substring(0, 1) || '')).toUpperCase()

    const timestamp = Date.now().toString().slice(-5) // últimos 5 dígitos del timestamp
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `${prefix}-${timestamp}-${initials}${randomPart}`
}

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.correo)) {
      return NextResponse.json({ step: 'email', message: 'El email de contacto no es válido' }, { status: 400 })
    }

    // 🔹 Generar UID único para el partner
    const code = generatePartnerUID(body.nombres, body.apellidos)

    const partnerPayload = {
      code,
      name: `${body.nombres} ${body.apellidos}`,
      tax_id: body.dpi || 'String',
      email: body.correo,
      isActive: true,
      isCustomer: false,
      isVendor: false,
      isEmployee: false,
      notes: body.referencia || null,
      created_by: 1
    }

    // === Paso 1: Crear Partner ===
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
        {
          step: 'partner',
          error: partnerData?.error || 'partner_error',
          message: partnerData?.detail || partnerData?.message || 'Error al crear partner'
        },
        { status: statusCode }
      )
    }

    const partnerId = partnerData.id

    // === Paso 2: Crear Dirección ===
    const addressPayload = {
      businessPartner: { id: partnerId },
      addressType: 'HOME',
      street: body.calle || 'Principal',
      street2: body.numero || null,
      neighborhood: body.colonia,
      postalCode: body.zona,
      isDefault: 1,
      isActive: 1,
      municipality: { id: body.municipalityId }
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
        {
          step: 'address',
          error: addressData?.error || 'address_error',
          message: addressData?.detail || addressData?.message || 'Error al crear dirección'
        },
        { status: statusCode }
      )
    }

    // === Paso 3: Crear Contactos ===
    const phones = [
      ...(body.telefonoPrincipal ? [{ phone: body.telefonoPrincipal, is_active: true }] : []),
      ...(Array.isArray(body.phones) ? body.phones : [])
    ]

    const contactsCreated: any[] = []

    for (const phone of phones) {
      const now = new Date().toISOString().split('.')[0] + 'Z'

      const contactPayload = {
        firstName: body.nombres || '',
        lastName: body.apellidos || '',
        phone: phone.phone || '',
        isActive: phone.is_active ?? true,
        birthDate: now.split('T')[0], // fecha simple YYYY-MM-DD
        createdAt: now,
        updatedAt: now,
        businessPartner: { id: partnerId }
      }

      const contactRes = await fetch(`${baseUrlTemp}partners/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contactPayload)
      })

      const contactContentType = contactRes.headers.get('content-type')
      let contactData: any

      if (contactContentType && contactContentType.includes('application/json')) {
        contactData = await contactRes.json()
      } else {
        contactData = { message: await contactRes.text() }
      }

      if (!contactRes.ok) {
        console.error('❌ Error al crear contacto:', contactData)
        continue // no interrumpe todo el flujo, pero lo registra
      }

      contactsCreated.push(contactData)
    }

    // === Respuesta Final ===
    return NextResponse.json(
      {
        message: 'Persona creada con éxito',
        partner: partnerData,
        address: addressData,
        contacts: contactsCreated
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('❌ Error en /api/business-partner/pather:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

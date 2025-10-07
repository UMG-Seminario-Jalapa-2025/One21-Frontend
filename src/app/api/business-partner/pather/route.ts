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


    // Generar code → "on" + primeras 3 letras del nombre + apellido
    const code =
      'on' +
      (body.nombres?.substring(0, 3) || '').toLowerCase() +
      (body.apellidos || '')

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

    const partnerRes = await fetch(`${baseUrlTemp}partners`, {
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
      municipality: { id: body.municipalityId },
    }

    const addressRes = await fetch(`${baseUrlTemp}addresses`, {
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
        businessPartner: { id: partnerId },
      }

      const contactRes = await fetch(`${baseUrlTemp}contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contactPayload),
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
        contacts: contactsCreated,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('❌ Error en /api/business-partner/pather:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // === Configuración base ===
    const username = process.env.NEXT_PUBLIC_INGRESS_CLIENT_USERNAME
    const password = body.password || process.env.NEXT_PUBLIC_INGRESS_CLIENT_PASSWORD
    const tenant = body.tenant || process.env.NEXT_PUBLIC_INGRESS_CLIENT_TENANT

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'
    const baseUrlTemp = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

    // === Paso 1: Login para obtener token ===
    const loginRes = await fetch(`${baseUrl}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_INGRESS_CLIENT_FIXED_TOKEN}`
      },
      body: JSON.stringify({ username, password, tenant })
    })

    const loginData = await loginRes.json()

    if (!loginRes.ok) {
      return NextResponse.json({ step: 'login', message: loginData?.message || 'Error al autenticar' }, { status: loginRes.status })
    }

    const token = loginData?.access_token

    if (!token) return NextResponse.json({ step: 'login', message: 'Token no recibido' }, { status: 401 })

    // === Paso 2: Crear usuario en Keycloak ===
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { username: _, password: __, tenant: ___, ...userPayload } = body

    const userRes = await fetch(`${baseUrl}admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userPayload)
    })

    const userData = await userRes.json()

    if (!userRes.ok) {
      let statusCode = userRes.status

      if (userData?.detail?.includes('same username')) statusCode = 409

      return NextResponse.json(
        { step: 'user', message: userData?.message || 'Error al crear usuario' },
        { status: statusCode }
      )
    }

    // === Paso 2.5: Asignar rol al usuario ===
    const rolePayload = {
      email: body.email,
      realmRoles: ['client']
    }

    const roleRes = await fetch(`${baseUrl}admin/users/by-email/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(rolePayload)
    })

    if (!roleRes.ok) {
      console.warn('⚠️ No se pudo asignar el rol al usuario:', await roleRes.text())
    }

    // === Paso 3: Crear Partner ===
    const code = 'on' + (body.nombres?.substring(0, 3) || '').toLowerCase() + (body.apellidos || '')

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

    const partnerData = await partnerRes.json()

    if (!partnerRes.ok) {
      let statusCode = partnerRes.status

      if (partnerData?.detail?.includes('duplicate key')) statusCode = 409

      return NextResponse.json(
        { step: 'partner', message: partnerData?.message || 'Error al crear partner' },
        { status: statusCode }
      )
    }

    const partnerId = partnerData.id

    // === Paso 4: Crear Contactos (principal + lista) ===
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
        birthDate: now.split('T')[0],
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

      const contactData = await contactRes.json()

      if (!contactRes.ok) {
        console.error('❌ Error al crear contacto:', contactData)
        continue
      }

      contactsCreated.push(contactData)
    }

    // === Paso 5: Crear Dirección ===
    const addressPayload = {
      businessPartner: { id: partnerId },
      addressType: 'HOME',
      street: body.street || 'Principal',
      street2: body.number || null,
      neighborhood: body.neighborhood,
      postalCode: body.postalCode,
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

    const addressData = await addressRes.json()

    if (!addressRes.ok) {
      let statusCode = addressRes.status

      if (addressData?.detail?.includes('duplicate key')) statusCode = 409

      return NextResponse.json(
        { step: 'address', message: addressData?.message || 'Error al crear dirección' },
        { status: statusCode }
      )
    }

    // === Respuesta final ===
    return NextResponse.json(
      {
        message: 'Usuario, rol, partner, contactos y dirección creados con éxito',
        user: userData,
        partner: partnerData,
        contacts: contactsCreated,
        address: addressData
      },
      { status: 201 }
    )

  } catch (err) {
    console.error('❌ Error en /api/pather:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

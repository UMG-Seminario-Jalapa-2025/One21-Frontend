import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 🔹 Credenciales
    const username = process.env.NEXT_PUBLIC_INGRESS_CLIENT_USERNAME
    const password = body.password || process.env.NEXT_PUBLIC_INGRESS_CLIENT_PASSWORD
    const tenant = body.tenant || process.env.NEXT_PUBLIC_INGRESS_CLIENT_TENANT

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'

    // 🔹 1. Login para token dinámico
    const loginRes = await fetch(`${baseUrl}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_INGRESS_CLIENT_FIXED_TOKEN}`
      },
      body: JSON.stringify({ username, password, tenant })
    })

    let loginData: any
    const contentType = loginRes.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      loginData = await loginRes.json()
    } else {
      loginData = { message: await loginRes.text() }
    }

    if (!loginRes.ok) {
      return NextResponse.json({ step: 'login', message: loginData?.message || 'Error al autenticar' }, { status: loginRes.status })
    }

    const token = loginData?.access_token

    if (!token) {
      return NextResponse.json({ step: 'login', message: 'Token no recibido' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { username: _, password: __, tenant: ___, ...userPayload } = body

    // 🔹 2. Crear User
    const userRes = await fetch(`${baseUrl}admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // ✅ token dinámico
      },
      body: JSON.stringify(userPayload)
    })

    let userData: any
    const userContentType = userRes.headers.get('content-type')

    if (userContentType && userContentType.includes('application/json')) {
      userData = await userRes.json()
    } else {
      userData = { message: await userRes.text() }
    }

    if (!userRes.ok) {
      return NextResponse.json({ step: 'user', message: userData?.message || 'Error al crear usuario' }, { status: userRes.status })
    }

    // 🔹 3. Crear Partner
    const partnerPayload = {
      code: body.username,
      name: `${body.firstName} ${body.lastName}`,
      commercialName: `${body.firstName} ${body.lastName}`,
      type: { id: 1 },
      category: { id: 1 },
      email: body.email,
      phone: body.mobile,
      isActive: true
    }

    const partnerRes = await fetch(`${baseUrl}partners/partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // ✅ token dinámico
      },
      body: JSON.stringify(partnerPayload)
    })

    const partnerData = await partnerRes.json()

    if (!partnerRes.ok) {
      return NextResponse.json({ step: 'partner', message: partnerData?.message || 'Error al crear partner' }, { status: partnerRes.status })
    }

    const partnerId = partnerData.id

    // 🔹 4. Crear Address
    const addressPayload = {
      businessPartner: { id: partnerId },
      addressType: 'HOME',
      street: body.street,
      street2: body.number,
      neighborhood: body.neighborhood,
      postalCode: body.zone,
      city: { id: 1 },
      state: { id: 1 },
      country: { id: 1 },
      isDefault: true,
      isActive: true
    }

    const addressRes = await fetch(`${baseUrl}partners/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // ✅ token dinámico
      },
      body: JSON.stringify(addressPayload)
    })

    const addressData = await addressRes.json()

    if (!addressRes.ok) {
      return NextResponse.json({ step: 'address', message: addressData?.message || 'Error al crear dirección' }, { status: addressRes.status })
    }

    return NextResponse.json(
      { message: 'Usuario, Partner y Dirección creados con éxito', user: userData, partner: partnerData, address: addressData },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error en /api/pather:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

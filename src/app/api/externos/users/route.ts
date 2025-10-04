import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const username = process.env.NEXT_PUBLIC_INGRESS_CLIENT_USERNAME
    const password = body.password || process.env.NEXT_PUBLIC_INGRESS_CLIENT_PASSWORD
    const tenant = body.tenant || process.env.NEXT_PUBLIC_INGRESS_CLIENT_TENANT

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'
    const baseUrlTemp = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

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

    const userRes = await fetch(`${baseUrl}admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
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
      let statusCode = userRes.status

      if (userData?.detail?.includes('same username')) {
        statusCode = 409
      } else if (userData?.detail?.includes('execute actions email')) {
        statusCode = 502
      }

      return NextResponse.json(
        {
          step: 'user',
          error: userData?.error || 'user_error',
          message: userData?.detail || userData?.message || 'Error al crear usuario'
        },
        { status: statusCode }
      )
    }

    const partnerPayload = {
      code: body.username,
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

    const addressRes = await fetch(`${baseUrlTemp}addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(addressPayload)
    })

    console.log('addressRes', addressRes)

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

    return NextResponse.json(
      { message: 'Usuario, Partner y Dirección creados con éxito', user: userData, partner: partnerData, address: addressData },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error en /api/pather:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

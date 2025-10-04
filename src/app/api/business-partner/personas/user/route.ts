import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const username = process.env.NEXT_PUBLIC_INGRESS_CLIENT_USERNAME
    const password = body.password || process.env.NEXT_PUBLIC_INGRESS_CLIENT_PASSWORD
    const tenant = body.tenant || process.env.NEXT_PUBLIC_INGRESS_CLIENT_TENANT

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'
    const baseUrlPather = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

    // 1. Login
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
      return NextResponse.json(
        { step: 'login', message: loginData?.message || 'Error al autenticar' },
        { status: loginRes.status }
      )
    }

    const token = loginData?.access_token

    if (!token) {
      
      return NextResponse.json({ step: 'login', message: 'Token no recibido' }, { status: 401 })
    }

    // 2. Crear usuario
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { username: _, password: __, tenant: ___, partnerId, ...userPayload } = body

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

    console.log(body)

    // 3. Obtener partner actual
    if (partnerId) {
      const partnerResGet = await fetch(`${baseUrlPather}partners/${partnerId}`, {
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

      // 4. Actualizar partner con isCustomer = true
      const partnerResPut = await fetch(`${baseUrlPather}partners`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...currentPartner, isCustomer: true })
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
    }

    return NextResponse.json(
      { message: 'Usuario creado y partner actualizado con éxito', user: userData },
      { status: 201 }
    )
  } catch (err) {
    console.error('❌ Error en /api/personas/crear-usuario:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

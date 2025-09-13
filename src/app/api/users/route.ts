import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Tomar credenciales de body o variables de entorno
    const username =  process.env.NEXT_PUBLIC_INGRESS_CLIENT_USERNAME
    const password = body.password || process.env.NEXT_PUBLIC_INGRESS_CLIENT_PASSWORD
    const tenant = body.tenant || process.env.NEXT_PUBLIC_INGRESS_CLIENT_TENANT

    console.log('body', username, password, tenant)

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'

    // 1. Login para obtener token dinámico
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
    // eslint-disable-next-line padding-line-between-statements
    if (contentType && contentType.includes('application/json')) {
      loginData = await loginRes.json()
    } else {
      loginData = { message: await loginRes.text() }
    }

    if (!loginRes.ok) {
      return NextResponse.json({ message: loginData?.message || 'Error al autenticar' }, { status: loginRes.status })
    }

    const token = loginData?.access_token
    // eslint-disable-next-line padding-line-between-statements
    if (!token) {
      return NextResponse.json({ message: 'Token no recibido' }, { status: 401 })
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
    // eslint-disable-next-line padding-line-between-statements
    if (userContentType && userContentType.includes('application/json')) {
      userData = await userRes.json()
    } else {
      userData = { message: await userRes.text() }
    }

    if (!userRes.ok) {
      return NextResponse.json({ message: userData?.message || 'Error al crear usuario' }, { status: userRes.status })
    }

    return NextResponse.json({ message: 'Usuario creado con éxito', data: userData }, { status: 201 })
  } catch (err) {
    console.error('Error en /api/users:', err)

    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

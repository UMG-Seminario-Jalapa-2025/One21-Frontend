import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, realmRoles } = body

    if (!email || !realmRoles || !Array.isArray(realmRoles) || realmRoles.length === 0) {
      return NextResponse.json(
        { message: 'Debes enviar un email válido y al menos un rol en "realmRoles".' },
        { status: 400 }
      )
    }

    // === Configuración base ===
    const username = process.env.NEXT_PUBLIC_INGRESS_CLIENT_USERNAME
    const password = process.env.NEXT_PUBLIC_INGRESS_CLIENT_PASSWORD
    const tenant = process.env.NEXT_PUBLIC_INGRESS_CLIENT_TENANT
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'
    const fixedToken = process.env.NEXT_PUBLIC_INGRESS_CLIENT_FIXED_TOKEN

    // === Paso 1: Login para obtener token ===
    const loginRes = await fetch(`${baseUrl}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fixedToken}`
      },
      body: JSON.stringify({ username, password, tenant })
    })

    const loginData = await loginRes.json()

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

    // === Paso 2: Asignar rol dinámico ===
    const rolePayload = {
      email,
      realmRoles
    }

    const roleRes = await fetch(`${baseUrl}admin/users/by-email/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(rolePayload)
    })

    const roleText = await roleRes.text()

    if (!roleRes.ok) {
      return NextResponse.json(
        { step: 'role', message: `Error asignando rol: ${roleText}` },
        { status: roleRes.status }
      )
    }

    // === Éxito ===
    return NextResponse.json(
      {
        message: `Roles asignados correctamente al usuario ${email}`,
        assignedRoles: realmRoles
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ Error en /api/roles/asignar:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

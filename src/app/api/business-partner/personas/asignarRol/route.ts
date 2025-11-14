import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, realmRoles } = body
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!email || !realmRoles || !Array.isArray(realmRoles) || realmRoles.length === 0) {
      return NextResponse.json(
        { message: 'Debes enviar un email válido y al menos un rol en "realmRoles".' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'

  

    if (!tokenCookie?.value) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const token = tokenCookie.value

    // === Paso 2: Asignar rol dinámico ===
    const rolePayload = {
      email: body.email,
      realmRoles: realmRoles
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

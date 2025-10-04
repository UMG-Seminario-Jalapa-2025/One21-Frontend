import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const partnerId = searchParams.get('id')

    if (!partnerId) {
      return NextResponse.json(
        { step: 'validation', message: 'partnerId es requerido' },
        { status: 400 }
      )
    }

    const baseUrlPather = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

    // ✅ Token desde cookies
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const token = tokenCookie.value

    // 🔴 DELETE al backend
    const deleteRes = await fetch(`${baseUrlPather}partners/${partnerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!deleteRes.ok) {

      const errorMsg = await deleteRes.text()

      return NextResponse.json(
        { step: 'partner_delete', message: errorMsg || 'Error al eliminar partner' },
        { status: deleteRes.status }
      )
    }

    return NextResponse.json(
      { message: `Partner ${partnerId} eliminado con éxito` },
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ Error en /api/personas/eliminar:', err)
    
    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

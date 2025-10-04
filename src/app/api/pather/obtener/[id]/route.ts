import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = context.params

    const baseUrlTemp =
      process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return new Response(
        JSON.stringify({ message: 'Token no encontrado en cookies' }),
        { status: 401 }
      )
    }

    const token = tokenCookie.value

    const res = await fetch(`${baseUrlTemp}partners/partners/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const msg = await res.text()

      return new Response(
        JSON.stringify({ message: msg || 'Error al obtener socio' }),
        { status: res.status }
      )
    }

    const socio = await res.json()

    return new Response(JSON.stringify(socio), { status: 200 })
  } catch (err) {
    console.error('❌ Error en /api/pather/obtener/[id]:', err)

    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500 }
    )
  }
}

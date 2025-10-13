import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ========================= HELPERS =========================
async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) return await response.json()

  return { message: await response.text() }
}

function getTokenFromCookies(req: NextRequest) {
  const token = req.cookies.get('one21_token')?.value

  if (!token) {
    return NextResponse.json(
      { step: 'auth', message: 'Token no encontrado. Por favor inicia sesión.' },
      { status: 401 }
    )
  }

  return token
}

// ========================= MAIN =========================
export async function GET(req: NextRequest) {
  try {
    const baseUrlTickets = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Obtener token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) return tokenResult

    const token = tokenResult

    // ===================== 4️⃣ Obtener todos los tickets =====================
    const ticketsRes = await fetch(`${baseUrlTickets}tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const ticketsData = await parseResponse(ticketsRes)

    if (!ticketsRes.ok) {
      return NextResponse.json(
        {
          step: 'tickets',
          message: ticketsData?.message || 'Error al obtener tickets',
        },
        { status: ticketsRes.status },
      )
    }

    // Obtener todos los tickets sin filtros
    const ticketsFiltrados = (ticketsData?.data || ticketsData || [])

    // ===================== 5️⃣ Respuesta final =====================
    return NextResponse.json(
      {
        message: 'Datos obtenidos con éxito',
        tickets: ticketsFiltrados,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('Error en /api/tickets/asignaciones/obtener:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

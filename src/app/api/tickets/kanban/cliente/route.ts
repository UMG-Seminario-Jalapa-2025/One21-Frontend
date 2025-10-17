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

function getPartnerFromCookies(req: NextRequest) {
  const partnerRaw = req.cookies.get('one21_partner')?.value

  if (!partnerRaw) {
    return NextResponse.json(
      { step: 'partner', message: 'No se encontró información del partner en la cookie.' },
      { status: 401 }
    )
  }

  try {
    return JSON.parse(partnerRaw)
  } catch (e) {
    console.error('❌ Error parseando cookie one21_partner:', e)

    return NextResponse.json({ step: 'partner', message: 'Error al leer la cookie de partner.' }, { status: 400 })
  }
}

// ========================= MAIN =========================
export async function GET(req: NextRequest) {
  try {
    const baseUrlTickets = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) return tokenResult
    const token = tokenResult

    const partnerResult = getPartnerFromCookies(req)

    if (partnerResult instanceof NextResponse) return partnerResult
    const partner = partnerResult

    const partnerId = partner?.id ?? partner

    if (!partnerId) {
      return NextResponse.json({ step: 'validation', message: 'El partner no tiene un ID válido.' }, { status: 400 })
    }

    console.log('🔹 Buscando tickets del partner ID:', partnerId)

    const ticketsRes = await fetch(`${baseUrlTickets}tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    const ticketsData = await parseResponse(ticketsRes)

    if (!ticketsRes.ok) {
      return NextResponse.json(
        {
          step: 'tickets_fetch',
          message: ticketsData?.message || 'Error al obtener tickets del cliente.'
        },
        { status: ticketsRes.status }
      )
    }

    const tickets = ticketsData?.data || ticketsData || []

    // console.log(
    //   '✅ Total de tickets obtenidos:',
    //   Array.isArray(tickets) ? tickets.length : 0
    // )

    const filteredTickets = Array.isArray(tickets)
      ? tickets.filter((t: any) => {
          if (!t.businessPartnerId && !t.business_partner_id) return true

          return t.businessPartnerId === partnerId || t.business_partner_id === partnerId
        })
      : []

    // console.log(' Tickets filtrados para partner:', filteredTickets.length)

    // ===================== 3️⃣ Normalizar fechas =====================
    const normalizedTickets = filteredTickets.map((t: any) => {
      // ✅ Tu base de datos usa "opened_at" y "updated_at"
      const fecha = t.fecha_creacion || t.opened_at || t.updated_at || t.slaDueAt || null

      return {
        ...t,
        fecha_creacion: fecha // nombre unificado
      }
    })

    return NextResponse.json(
      {
        success: true,
        tickets: normalizedTickets
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error obteniendo tickets del cliente:', error)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

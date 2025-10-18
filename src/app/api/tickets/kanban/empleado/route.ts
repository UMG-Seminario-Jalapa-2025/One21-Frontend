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

    return NextResponse.json(
      { step: 'partner', message: 'Error al leer la cookie de partner.' },
      { status: 400 }
    )
  }
}

// ========================= MAIN =========================
export async function GET(req: NextRequest) {
  try {
    const baseUrlEmployee =
      process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8080/employees/'

    const baseUrlTickets =
      process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Obtener token y partner desde cookies
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) return tokenResult
    const token = tokenResult

    const partnerResult = getPartnerFromCookies(req)

    if (partnerResult instanceof NextResponse) return partnerResult
    const partner = partnerResult

    const partnerId = partner

    console.log('🔹 partnerId:', partnerId)

    if (!partnerId) {
      return NextResponse.json(
        { step: 'validation', message: 'El partner no tiene un ID válido.' },
        { status: 400 }
      )
    }

    // ===================== 1️⃣ Buscar empleado por partner =====================
    const empleadoResponse = await fetch(
      `${baseUrlEmployee}employees/by-business-partner/${partnerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const empleadoData = await parseResponse(empleadoResponse)

    if (!empleadoResponse.ok) {
      return NextResponse.json(
        {
          step: 'employee_fetch',
          message: empleadoData?.message || 'Error al obtener empleado del partner.'
        },
        { status: empleadoResponse.status }
      )
    }

    const empleado = empleadoData?.data || empleadoData
    const empleadoId = empleado?.id

    if (!empleadoId) {
      return NextResponse.json(
        {
          step: 'employee_validation',
          message: 'No se encontró un empleado válido para el partner.'
        },
        { status: 404 }
      )
    }

    // ===================== 2️⃣ Buscar tickets del empleado =====================
    const ticketsResponse = await fetch(
      `${baseUrlTickets}tickets/by-employee-assigned/${empleadoId}?id=${empleadoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const ticketsData = await parseResponse(ticketsResponse)

    if (!ticketsResponse.ok) {
      return NextResponse.json(
        {
          step: 'tickets_fetch',
          message: ticketsData?.message || 'Error al obtener tickets asignados.'
        },
        { status: ticketsResponse.status }
      )
    }

    let tickets = ticketsData?.data || ticketsData

    // ===================== 3️⃣ Filtrar tickets por estado (1 y 2) =====================
    if (Array.isArray(tickets)) {
      tickets = tickets.filter(t => {
        const estadoId =
          t?.status?.id ?? t?.statusId ?? t?.estado_id ?? null
          
        return estadoId === 1 || estadoId === 2
      })
    }

    // ===================== 3️⃣ Respuesta final =====================
    return NextResponse.json(
      {
        success: true,
        empleado,
        tickets
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error obteniendo tickets asignados:', error)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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

// ========================= CONSTANTES =========================
const VALID_STATUS = {
  INGRESADO: 1,
  INICIADO: 2,
  FINALIZADO: 3
} as const

type ValidStatusKey = keyof typeof VALID_STATUS
type ValidStatusId = (typeof VALID_STATUS)[ValidStatusKey]

// ========================= MAIN =========================
export async function PUT(req: NextRequest) {
  try {
    const baseUrlTickets =
      process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Obtener token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) return tokenResult
    const token = tokenResult

    // Leer cuerpo
    const body = await req.json()

    if (!body || !body.id) {
      return NextResponse.json(
        { step: 'validation', message: 'El ticket es requerido y debe incluir un ID.' },
        { status: 400 }
      )
    }

    // ===================== 1️⃣ Validar estado =====================
    const statusValue = body.status

    let statusId: ValidStatusId | null = null

    if (typeof statusValue === 'number') {
      // Only accept numeric values that exist in VALID_STATUS
      const num = statusValue as ValidStatusId

      statusId = Object.values(VALID_STATUS).includes(num) ? num : null
    } else if (typeof statusValue === 'string') {
      const upper = statusValue.trim().toUpperCase() as ValidStatusKey

      statusId = VALID_STATUS[upper] ?? null
    } else if (statusValue?.id) {
      statusId = statusValue.id
    }

    if (!statusId || !Object.values(VALID_STATUS).includes(statusId)) {
      return NextResponse.json(
        {
          step: 'validation',
          message: `Estado inválido. Estados permitidos: ${Object.keys(VALID_STATUS).join(', ')}`
        },
        { status: 400 }
      )
    }

    // ===================== 2️⃣ Construir payload limpio =====================
    const payload = {
      id: body.id,
      ticketNumber: body.ticketNumber,
      subject: body.subject,
      description: body.description,
      businessPartnerId: body.businessPartnerId,
      contactId: body.contactId,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      createdByEmployeeId: body.createdByEmployeeId,
      assignedToEmployeeId: body.assignedToEmployeeId,
      openedAt: body.openedAt,
      closedAt: body.closedAt,
      slaDueAt: body.slaDueAt,
      resolutionSummary: body.resolutionSummary,
      satisfactionRating: body.satisfactionRating,
      feedback: body.feedback,
      isEscalated: body.isEscalated,
      parentTicket: body.parentTicket ? { id: body.parentTicket.id } : null,
      category: body.category ? { id: body.category.id } : null,
      priority: body.priority ? { id: body.priority.id } : null,
      status: { id: statusId } // ✅ viene del catálogo
    }

    // ===================== 3️⃣ Hacer PUT al microservicio =====================
    const response = await fetch(`${baseUrlTickets}tickets`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })


    const data = await parseResponse(response)

    if (!response.ok) {
      return NextResponse.json(
        {
          step: 'tickets_update',
          error: data?.error || 'ticket_update_error',
          message: data?.message || 'Error al actualizar ticket'
        },
        { status: response.status }
      )
    }

    // ===================== 4️⃣ Éxito =====================
    return NextResponse.json(
      { message: 'Ticket actualizado correctamente', data },
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ Error en /api/tickets/actualizar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

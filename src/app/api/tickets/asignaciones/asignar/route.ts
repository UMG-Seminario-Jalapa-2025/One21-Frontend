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
export async function PUT(req: NextRequest) {
  try {
    const baseUrlTickets = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

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

    // ===================== 1️⃣ Construir payload limpio =====================
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
      assignedToEmployeeId: body.assignedToEmployeeId, // 🔹 este es el que cambia
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
      status: body.status ? { id: body.status.id } : null,
    }

  

    // ===================== 2️⃣ Hacer PUT al microservicio =====================
    const response = await fetch(`${baseUrlTickets}tickets`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await parseResponse(response)

    if (!response.ok) {
      return NextResponse.json(
        {
          step: 'tickets_update',
          error: data?.error || 'ticket_update_error',
          message: data?.message || 'Error al asignar ticket',
        },
        { status: response.status }
      )
    }

    // ===================== 3️⃣ Éxito =====================
    return NextResponse.json(
      { message: 'Ticket asignado correctamente', data },
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ Error en /api/tickets/asignaciones/asignar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

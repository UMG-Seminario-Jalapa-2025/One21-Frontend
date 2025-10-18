// app/api/tickets/asignaciones/rechazar/route.ts

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

    if (!body.rejectionReason || body.rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { step: 'validation', message: 'La justificación del rechazo es requerida.' },
        { status: 400 }
      )
    }

    console.log('🚫 Rechazando ticket:', body.id)

    // ===================== 1️⃣ Construir payload para rechazo =====================
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
      closedAt: new Date().toISOString(), // 🔹 Marcar como cerrado
      slaDueAt: body.slaDueAt,
      resolutionSummary: body.rejectionReason, // 🔹 Guardar justificación aquí
      satisfactionRating: body.satisfactionRating,
      feedback: body.feedback,
      isEscalated: body.isEscalated,
      parentTicket: body.parentTicket ? { id: body.parentTicket.id } : null,
      category: body.category ? { id: body.category.id } : null,
      priority: body.priority ? { id: body.priority.id } : null,
      status: { id: 2 } // 🔹 Estado "Rechazado" - ajusta el ID según tu BD
    }

    console.log('📦 Payload:', payload)

    // ===================== 2️⃣ Hacer PUT al microservicio =====================
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
      console.error('❌ Error del backend:', data)

      return NextResponse.json(
        {
          step: 'tickets_reject',
          error: data?.error || 'ticket_reject_error',
          message: data?.message || 'Error al rechazar ticket'
        },
        { status: response.status }
      )
    }

    // ===================== 3️⃣ Éxito =====================
    console.log('✅ Ticket rechazado exitosamente')

    return NextResponse.json({ message: 'Ticket rechazado correctamente', data }, { status: 200 })
  } catch (err) {
    console.error('❌ Error en /api/tickets/asignaciones/rechazar:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

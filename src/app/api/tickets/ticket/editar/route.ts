import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Validaciones para editar ticket
function validateEditTicketData(body: any) {
  if (!body.id || isNaN(Number(body.id))) {
    return NextResponse.json({ message: 'El ID del ticket es requerido' }, { status: 400 })
  }

  if (body.subject && (typeof body.subject !== 'string' || body.subject.trim().length === 0)) {
    return NextResponse.json({ message: 'El asunto debe ser texto y no vacío' }, { status: 400 })
  }

  if (body.subject && body.subject.length > 200) {
    return NextResponse.json({ message: 'El asunto no puede superar 200 caracteres' }, { status: 400 })
  }

  if (body.description && (typeof body.description !== 'string' || body.description.trim().length === 0)) {
    return NextResponse.json({ message: 'La descripción debe ser texto y no vacía' }, { status: 400 })
  }

  if (body.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email)) {
    return NextResponse.json({ message: 'El email de contacto no es válido' }, { status: 400 })
  }

  if (body.contact_phone && typeof body.contact_phone !== 'string') {
    return NextResponse.json({ message: 'El teléfono de contacto debe ser texto' }, { status: 400 })
  }

  return null
}

export async function PUT(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'
    const token = req.cookies.get('one21_token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const body = await req.json()

    // Validaciones
    const validationError = validateEditTicketData(body)

    if (validationError) return validationError

    const { id, ...ticketData } = body

    const res = await fetch(`${baseUrl}ticket/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(ticketData)
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ message: data.message || 'Error al editar ticket' }, { status: res.status })
    }

    return NextResponse.json({ message: 'Ticket editado con éxito', data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

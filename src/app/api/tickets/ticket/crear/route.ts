import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Validaciones según el modelo de la tabla tickets
function validateTicketData(body: any) {
  if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length === 0) {
    return NextResponse.json({ message: 'El asunto es requerido' }, { status: 400 })
  }

  if (body.subject.length > 200) {
    return NextResponse.json({ message: 'El asunto no puede superar 200 caracteres' }, { status: 400 })
  }

  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    return NextResponse.json({ message: 'La descripción es requerida' }, { status: 400 })
  }

  if (!body.category_id || isNaN(Number(body.category_id))) {
    return NextResponse.json({ message: 'La categoría es requerida' }, { status: 400 })
  }

  if (!body.priority_id || isNaN(Number(body.priority_id))) {
    return NextResponse.json({ message: 'La prioridad es requerida' }, { status: 400 })
  }

  if (!body.status_id || isNaN(Number(body.status_id))) {
    return NextResponse.json({ message: 'El estado es requerido' }, { status: 400 })
  }

  if (!body.contact_name || typeof body.contact_name !== 'string' || body.contact_name.trim().length === 0) {
    return NextResponse.json({ message: 'El nombre de contacto es requerido' }, { status: 400 })
  }

  if (!body.contact_email || typeof body.contact_email !== 'string' || body.contact_email.trim().length === 0) {
    return NextResponse.json({ message: 'El email de contacto es requerido' }, { status: 400 })
  }

  // Validación básica de email

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email)) {
    return NextResponse.json({ message: 'El email de contacto no es válido' }, { status: 400 })
  }

  // Teléfono es opcional, pero si viene debe ser string
  if (body.contact_phone && typeof body.contact_phone !== 'string') {
    return NextResponse.json({ message: 'El teléfono de contacto debe ser texto' }, { status: 400 })
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'
    const token = req.cookies.get('one21_token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const body = await req.json()

    // Validaciones según el modelo
    const validationError = validateTicketData(body)

    if (validationError) return validationError

    const res = await fetch(`${baseUrl}ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ message: data.message || 'Error al crear ticket' }, { status: res.status })
    }

    return NextResponse.json({ message: 'Ticket creado con éxito', data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

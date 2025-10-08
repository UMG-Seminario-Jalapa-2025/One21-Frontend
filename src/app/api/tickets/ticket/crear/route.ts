import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// ✅ Generar un identificador aleatorio
function generateTicketNumber(): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  const timestamp = Date.now().toString().slice(-6)

  return `TK-${timestamp}-${randomPart}`
}

// ✅ Validaciones según el modelo de la tabla tickets
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

  if (!body.contactName || typeof body.contactName !== 'string' || body.contactName.trim().length === 0) {
    return NextResponse.json({ message: 'El nombre de contacto es requerido' }, { status: 400 })
  }

  if (!body.contactEmail || typeof body.contactEmail !== 'string' || body.contactEmail.trim().length === 0) {
    return NextResponse.json({ message: 'El email de contacto es requerido' }, { status: 400 })
  }

  // Validación básica de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) {
    return NextResponse.json({ message: 'El email de contacto no es válido' }, { status: 400 })
  }

  // Teléfono es opcional, pero si viene debe ser string
  if (body.contactPhone && typeof body.contactPhone !== 'string') {
    return NextResponse.json({ message: 'El teléfono de contacto debe ser texto' }, { status: 400 })
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    console.log('Entre')

    const cookieStore = await cookies()

    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8095/tickets/'
    const token = cookieStore.get('one21_token')?.value
    const partner = cookieStore.get('one21_partner')?.value || 16

    console.log('Base URL:', baseUrl)
    console.log('Partner ID from cookie:', partner)
    console.log('Token from cookie:', token ? 'Encontrado' : 'No encontrado')

    if (!token) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const body = await req.json()

    // ✅ Agregar ticketNumber y businessPartnerId al body antes de enviar
    const payload = {
      ...body,
      ticketNumber: generateTicketNumber(),
      businessPartnerId: partner ? Number(partner) : null
    }

    // Validaciones según el modelo
    const validationError = validateTicketData(payload)

    if (validationError) return validationError

    console.log('Llamando a:', `${baseUrl}tickets`)
    console.log('Body final que se envía:', payload)

    const res = await fetch(`${baseUrl}tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    console.log('Response recibida:', res.status)

    const data = await res.json()

    console.log('Response JSON:', data)

    if (!res.ok) {
      return NextResponse.json({ message: data.message || 'Error al crear ticket' }, { status: res.status })
    }

    return NextResponse.json({ message: 'Ticket creado con éxito', data }, { status: 201 })
  } catch (err) {
    console.error('❌ Error en creación de ticket:', err)

    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

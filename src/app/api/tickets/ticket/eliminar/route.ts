import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function DELETE(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'
    const token = req.cookies.get('one21_token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 })
    }

    const { id } = await req.json()

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID del ticket es requerido' }, { status: 400 })
    }

    const res = await fetch(`${baseUrl}ticket/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ message: data.message || 'Error al eliminar ticket' }, { status: res.status })
    }

    return NextResponse.json({ message: 'Ticket eliminado con éxito', data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

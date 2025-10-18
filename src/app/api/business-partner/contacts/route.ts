import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SERVICE || 'http://localhost:8090/'

// =============================================================
// 🔹 POST → Crear contactos
// =============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessPartnerId, phones } = body

    if (!businessPartnerId || !Array.isArray(phones)) {
      return NextResponse.json(
        { step: 'validation', message: 'businessPartnerId y phones son requeridos' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const token = tokenCookie.value

    const createdContacts: any[] = []

    for (const phone of phones) {
      const now = new Date().toISOString().split('.')[0] + 'Z'

      const contactPayload = {
        firstName: phone.firstName || '',
        lastName: phone.lastName || '',
        phone: phone.phone,
        isActive: phone.is_active ?? true,
        birthDate: now.split('T')[0],
        createdAt: now,
        updatedAt: now,
        businessPartner: { id: businessPartnerId },
      }

      const res = await fetch(`${baseUrl}partners/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contactPayload),
      })

      const contentType = res.headers.get('content-type')
      const data = contentType && contentType.includes('application/json') ? await res.json() : { message: await res.text() }

      if (!res.ok) {
        console.error('❌ Error al crear contacto:', data)
        continue
      }

      createdContacts.push(data)
    }

    return NextResponse.json(
      { message: 'Contactos creados con éxito', contacts: createdContacts },
      { status: 201 }
    )
  } catch (err) {
    console.error('❌ Error en POST /api/business-partner/contacts:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

// =============================================================
// 🔹 PUT → Actualizar contacto
// =============================================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('Cuerpo recibido para actualizar contacto:', body)

    const { id } = body

    if (!id) {
      return NextResponse.json(
        { step: 'validation', message: 'id es requerido para actualizar el contacto' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {

      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const token = tokenCookie.value

    const res = await fetch(`${baseUrl}partners/contacts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    console.log('Respuesta de actualización de contacto:', res)


    const contentType = res.headers.get('content-type')
    const data = contentType && contentType.includes('application/json') ? await res.json() : { message: await res.text() }

    if (!res.ok) {
      return NextResponse.json(
        { step: 'contact_update', message: data?.message || 'Error al actualizar contacto' },
        { status: res.status }
      )
    }

    return NextResponse.json({ message: 'Contacto actualizado con éxito', contact: data }, { status: 200 })
  } catch (err) {
    console.error('❌ Error en PUT /api/business-partner/contacts:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

// =============================================================
// DELETE → Eliminar contacto por id
// =============================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { step: 'validation', message: 'id es requerido para eliminar el contacto' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')

    if (!tokenCookie?.value) {
      return NextResponse.json({ step: 'auth', message: 'Token no encontrado en cookies' }, { status: 401 })
    }

    const token = tokenCookie.value

    const res = await fetch(`${baseUrl}partners/contacts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    const contentType = res.headers.get('content-type')
    const data = contentType && contentType.includes('application/json') ? await res.json() : { message: await res.text() }

    if (!res.ok) {
      return NextResponse.json(
        { step: 'contact_delete', message: data?.message || 'Error al eliminar contacto' },
        { status: res.status }
      )
    }

    return NextResponse.json({ message: 'Contacto eliminado con éxito', contact: data }, { status: 200 })
  } catch (err) {
    console.error('❌ Error en DELETE /api/business-partner/contacts:', err)

    return NextResponse.json({ step: 'server', message: 'Error interno del servidor' }, { status: 500 })
  }
}

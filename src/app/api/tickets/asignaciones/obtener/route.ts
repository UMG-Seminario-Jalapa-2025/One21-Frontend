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
export async function GET(req: NextRequest) {
  try {
    const baseUrlTickets = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'
    const baseUrlUsers = process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE || 'http://localhost:8091/'
    const baseUrlPartners = process.env.NEXT_PUBLIC_API_BASE_URL_PARTNER || 'http://localhost:8090/partners/'

    // Obtener token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) return tokenResult

    const token = tokenResult

    // ===================== 1️⃣ Obtener empleados =====================
    const employeesRes = await fetch(`${baseUrlUsers}employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const employeesData = await parseResponse(employeesRes)

    if (!employeesRes.ok) {
      return NextResponse.json(
        {
          step: 'employees',
          message: employeesData?.message || 'Error al obtener empleados',
        },
        { status: employeesRes.status },
      )
    }

    // ===================== 2️⃣ Filtrar empleados (por puesto id = 2) =====================
    // const empleadosFiltrados = (employeesData?.data || employeesData || [])
    //   .filter((e: any) => e.position?.id === 2 && e.isActive !== false)

    // ===================== 3️⃣ Consultar Partner para cada empleado =====================
    const empleadosConPartner = await Promise.all(
      employeesData.map(async (emp: any) => {
        try {
          const partnerRes = await fetch(`${baseUrlPartners}partners/${emp.businessPartnerId}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })

          const partnerData = await parseResponse(partnerRes)

          return {
            id: emp.id,
            businessPartnerId: emp.businessPartnerId,
            puesto: emp.position?.name || 'Sin puesto',
            name:
              partnerData?.name ||
              partnerData?.businessPartner?.name ||
              partnerData?.data?.name ||
              'Sin nombre',
            email:
              partnerData?.email ||
              partnerData?.businessPartner?.email ||
              partnerData?.data?.email ||
              null,
            phone:
              partnerData?.phone ||
              partnerData?.businessPartner?.phone ||
              partnerData?.data?.phone ||
              null,
          }
        } catch (error) {
          console.error(`Error al obtener partner del empleado ${emp.id}:`, error)

          return {
            id: emp.id,
            businessPartnerId: emp.businessPartnerId,
            puesto: emp.position?.name || 'Sin puesto',
            name: 'Sin nombre',
            email: null,
            phone: null,
          }
        }
      }),
    )

    // ===================== 4️⃣ Obtener todos los tickets =====================
    const ticketsRes = await fetch(`${baseUrlTickets}tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const ticketsData = await parseResponse(ticketsRes)

    if (!ticketsRes.ok) {
      return NextResponse.json(
        {
          step: 'tickets',
          message: ticketsData?.message || 'Error al obtener tickets',
        },
        { status: ticketsRes.status },
      )
    }

    // Filtrar tickets sin asignar y status = 1
    const ticketsFiltrados = (ticketsData?.data || ticketsData || []).filter(
      (t: any) => t.status?.id === 1 && !t.assignedToEmployeeId,
    )

    // ===================== 5️⃣ Respuesta final =====================
    return NextResponse.json(
      {
        message: 'Datos obtenidos con éxito',
        empleados: empleadosConPartner,
        tickets: ticketsFiltrados,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('Error en /api/tickets/asignaciones/obtener:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

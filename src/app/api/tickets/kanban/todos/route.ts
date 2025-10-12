import { NextResponse } from 'next/server'

// Obtener todos los tickets para el kanban
export async function GET() {
  try {
    // Aquí iría la lógica para obtener tickets del backend
    // Por ahora devolvemos datos de ejemplo
    const tickets = [
      {
        id: 1,
        subject: 'Problema con conexión a internet',
        description: 'El usuario reporta que no puede conectarse a internet',
        contactName: 'Juan Pérez',
        priority: { name: 'Alta' },
        status: { name: 'Pendiente' },
        assignedToEmployeeName: 'María García',
        assignedToEmployeeId: 1
      },
      {
        id: 2,
        subject: 'Error en aplicación móvil',
        description: 'La aplicación se cierra inesperadamente',
        contactName: 'Ana López',
        priority: { name: 'Media' },
        status: { name: 'Iniciado' },
        assignedToEmployeeName: 'Carlos Rodríguez',
        assignedToEmployeeId: 2
      },
      {
        id: 3,
        subject: 'Solicitud de nueva funcionalidad',
        description: 'Agregar botón de exportar datos',
        contactName: 'Roberto Sánchez',
        priority: { name: 'Baja' },
        status: { name: 'Terminado' },
        assignedToEmployeeName: 'Laura Martín',
        assignedToEmployeeId: 3
      }
    ]

    const empleados = [
      { id: 1, name: 'María García' },
      { id: 2, name: 'Carlos Rodríguez' },
      { id: 3, name: 'Laura Martín' }
    ]

    return NextResponse.json({
      tickets,
      empleados,
      success: true
    })

  } catch (error) {
    console.error('Error obteniendo tickets para kanban:', error)

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

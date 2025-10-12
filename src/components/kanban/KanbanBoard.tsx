'use client'

import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'

// Tipos
export interface Ticket {
  id: number
  cliente: string
  asunto: string
  descripcion: string
  prioridad: string
  estado: 'pendiente' | 'iniciado' | 'terminado'
  asignadoA?: string
  empleadoId?: number
  _raw: any
}

export interface Empleado {
  id: number
  name: string
}

interface KanbanColumn {
  id: string
  title: string
  status: Ticket['estado']
  color: 'default' | 'primary' | 'success' | 'warning' | 'error'
  tickets: Ticket[]
}

type ColumnConfigEntry = {
  title: string
  color: 'default' | 'primary' | 'success' | 'warning' | 'error'
  allowedTransitions: Ticket['estado'][]
}

const COLUMN_CONFIG: Record<Ticket['estado'], ColumnConfigEntry> = {
  pendiente: { title: 'Pendiente', color: 'default', allowedTransitions: ['iniciado'] },
  iniciado: { title: 'Iniciado', color: 'primary', allowedTransitions: ['terminado'] },
  terminado: { title: 'Terminado', color: 'success', allowedTransitions: [] }
}

interface KanbanBoardProps {
  empleadoId?: number
  empleadoNombre?: string
  onTicketMove?: (ticketId: number, newStatus: Ticket['estado'], empleadoId?: number) => void
}

const KanbanBoard = ({ onTicketMove }: KanbanBoardProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)

  // Crear columnas del kanban
  const columns: KanbanColumn[] = [
    {
      id: 'pendiente',
      title: COLUMN_CONFIG.pendiente.title,
      status: 'pendiente',
      color: COLUMN_CONFIG.pendiente.color,
      tickets: tickets.filter(t => t.estado === 'pendiente')
    },
    {
      id: 'iniciado',
      title: COLUMN_CONFIG.iniciado.title,
      status: 'iniciado',
      color: COLUMN_CONFIG.iniciado.color,
      tickets: tickets.filter(t => t.estado === 'iniciado')
    },
    {
      id: 'terminado',
      title: COLUMN_CONFIG.terminado.title,
      status: 'terminado',
      color: COLUMN_CONFIG.terminado.color,
      tickets: tickets.filter(t => t.estado === 'terminado')
    }
  ]

  // ✅ Cargar tickets del empleado autenticado
  const fetchTickets = async () => {
    try {
      setLoading(true)

      // 🔹 ya no usamos empleadoId — el backend lo obtiene desde la cookie one21_partner
      const res = await fetch(`/api/tickets/kanban/empleado`)
      const json = await res.json()

      if (res.ok && json?.tickets) {
        setEmpleado(json.empleado)

        const mapped: Ticket[] = json.tickets.map((t: any) => ({
          id: t.id,
          cliente: t.contactName || 'Sin cliente',
          asunto: t.subject,
          descripcion: t.description,
          prioridad: t.priority?.name || 'N/A',
          estado: t.status?.name?.toLowerCase() || 'pendiente',
          asignadoA: json.empleado?.name || 'Sin asignar',
          empleadoId: json.empleado?.id,
          _raw: t
        }))

        setTickets(mapped)
      } else {
        console.error('Error cargando tickets:', json.message)
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // ✅ Mover ticket entre columnas
  const moveTicket = async (ticketId: number, newStatus: Ticket['estado']) => {
    const ticket = tickets.find(t => t.id === ticketId)

    if (!ticket) return

    const currentConfig = COLUMN_CONFIG[ticket.estado]

    if (!currentConfig.allowedTransitions.includes(newStatus)) {
      console.warn(`No se permite cambiar de ${ticket.estado} a ${newStatus}`)

      return
    }

    try {
      // 🔹 Mapeo de estado string → id de catálogo
      const estadoMap = {
        pendiente: 1,   // INGRESADO
        iniciado: 2,    // INICIADO
        terminado: 3    // FINALIZADO
      }

      const payload = {
        ...ticket._raw,
        status: { id: estadoMap[newStatus] }, // ✅ formato correcto
        assignedToEmployeeId: empleado?.id
      }

      const res = await fetch(`/api/tickets/kanban/actualizar-estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setTickets(prev =>
          prev.map(t =>
            t.id === ticketId ? { ...t, estado: newStatus } : t
          )
        )
        onTicketMove?.(ticketId, newStatus, empleado?.id)
      } else {
        const err = await res.json()

        console.error('Error actualizando estado del ticket:', err.message)
      }
    } catch (error) {
      console.error('Error al mover ticket:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4">Seguimiento de Tickets</Typography>
          <Typography variant="body1" color="text.secondary">
            {empleado ? `Tickets asignados a ${empleado.name}` : 'Mis tickets asignados'}
          </Typography>
        </div>
        <Chip label={`Total: ${tickets.length} tickets`} color="primary" variant="outlined" />
      </div>

      {/* Board del Kanban */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card className="h-full">
              <CardHeader
                title={
                  <div className="flex items-center justify-between">
                    <Typography variant="h6">{column.title}</Typography>
                    <Chip
                      label={`${column.tickets.length} tickets`}
                      size="small"
                      color={column.color}
                    />
                  </div>
                }
                className="pb-2"
              />
              <div className="p-4 pt-0">
                <div className="space-y-3 min-h-[200px]">
                  {column.tickets.map(ticket => (
                    <Card key={ticket.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <Typography variant="subtitle2" className="font-medium">
                            #{ticket.id} - {ticket.asunto}
                          </Typography>
                          <Chip
                            label={ticket.prioridad}
                            size="small"
                            color={
                              ticket.prioridad === 'Alta'
                                ? 'error'
                                : ticket.prioridad === 'Media'
                                ? 'warning'
                                : 'success'
                            }
                          />
                        </div>

                        <Typography variant="body2" color="text.secondary" className="line-clamp-2">
                          {ticket.descripcion}
                        </Typography>

                        <div className="flex items-center justify-between">
                          <Typography variant="caption" color="text.secondary">
                            {ticket.cliente}
                          </Typography>
                          {ticket.asignadoA && (
                            <Typography variant="caption" color="primary">
                              {ticket.asignadoA}
                            </Typography>
                          )}
                        </div>

                        <div className="flex gap-1 pt-2">
                          {COLUMN_CONFIG[column.status].allowedTransitions.map(newStatus => (
                            <Tooltip
                              key={newStatus}
                              title={`Mover a ${COLUMN_CONFIG[newStatus].title}`}
                            >
                              <IconButton
                                size="small"
                                onClick={() => moveTicket(ticket.id, newStatus)}
                                className="text-xs"
                              >
                                <i className="tabler-arrow-right" />
                              </IconButton>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {column.tickets.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                      <Typography variant="body2">No hay tickets</Typography>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard

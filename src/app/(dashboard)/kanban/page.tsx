'use client'

import { useState, useEffect, useMemo } from 'react'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import KanbanBoard from '@/components/kanban/KanbanBoard'
import type { Empleado } from '@/components/kanban/KanbanBoard'

// Utilidad local para normalizar estado
function estadoFromBackend(ticket: any): 'pendiente' | 'iniciado' | 'terminado' {
  const name = (ticket?.status?.name ?? ticket?.statusName ?? '').toString().toLowerCase()

  switch (name) {
    case 'ingresado':
    case 'pendiente':
      return 'pendiente'
    case 'iniciado':
      return 'iniciado'
    case 'finalizado':
    case 'terminado':
      return 'terminado'
    default:
      // fallback por si viene vacío o desconocido
      return 'pendiente'
  }
}

const KanbanPage = () => {
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [rawTickets, setRawTickets] = useState<any[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchEmpleadoTickets = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tickets/kanban/empleado')
      const json = await res.json()

      if (res.ok && json.success) {
        setEmpleado(json.empleado ?? null)
        setRawTickets(Array.isArray(json.tickets) ? json.tickets : [])
      } else {
        console.error('Error obteniendo datos:', json.message)
        setEmpleado(null)
        setRawTickets([])
      }
    } catch (error) {
      console.error('Error cargando tickets:', error)
      setEmpleado(null)
      setRawTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleadoTickets()
  }, [refreshTrigger])

  // Normalizamos SOLO para las estadísticas
  const stats = useMemo(() => {
    const estados = rawTickets.map(t => estadoFromBackend(t))
    const pendientes = estados.filter(e => e === 'pendiente').length
    const iniciados = estados.filter(e => e === 'iniciado').length
    const terminados = estados.filter(e => e === 'terminado').length

    return { pendientes, iniciados, terminados }
  }, [rawTickets])

  const STATUS_MAP = {
    pendiente: { id: 1, name: 'INGRESADO' },
    iniciado:  { id: 2, name: 'INICIADO' },
    terminado: { id: 3, name: 'FINALIZADO' }
  } as const

  const handleTicketMove = (
    ticketId: number,
    newStatus: 'pendiente' | 'iniciado' | 'terminado'
  ) => {
    //Actualización optimista del ticket en memoria
    setRawTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: STATUS_MAP[newStatus],     
              statusId: STATUS_MAP[newStatus].id 
            }
          : t
      )
    )
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Seguimiento de Tickets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualiza y gestiona el progreso de tus tickets asignados
          </Typography>
        </div>

        <Tooltip title="Actualizar datos">
          <IconButton onClick={handleRefresh} color="primary">
            <i className="tabler-refresh" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Estadísticas rápidas (sin “Empleado activo”) */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" color="warning" gutterBottom>
                {loading ? '-' : stats.pendientes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tickets pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" color="info" gutterBottom>
                {loading ? '-' : stats.iniciados}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En progreso
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" color="success" gutterBottom>
                {loading ? '-' : stats.terminados}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Kanban */}
      {empleado && (
        <KanbanBoard
          key={refreshTrigger}
          empleadoId={empleado.id}
          empleadoNombre={empleado.name}
          onTicketMove={handleTicketMove}
        />
      )}
    </div>
  )
}

export default KanbanPage

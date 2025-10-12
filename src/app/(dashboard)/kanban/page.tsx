'use client'

import { useState, useEffect } from 'react'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Chip from '@mui/material/Chip'

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import KanbanBoard from '@/components/kanban/KanbanBoard'
import type { Empleado, Ticket } from '@/components/kanban/KanbanBoard'

const KanbanPage = () => {
  const [empleado, setEmpleado] = useState<Empleado | null>(null)

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)

  const fetchEmpleadoTickets = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tickets/kanban/empleado')
      const json = await res.json()

      if (res.ok && json.success) {
        setEmpleado(json.empleado)
        setTickets(json.tickets || [])
      } else {
        console.error('Error obteniendo datos:', json.message)
      }
    } catch (error) {
      console.error('Error cargando tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleadoTickets()
  }, [refreshTrigger])

  const handleTicketMove = (ticketId: number, newStatus: Ticket['estado']) => {
    console.log('Ticket movido:', { ticketId, newStatus })
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

      {/* Estadísticas rápidas */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" color="primary" gutterBottom>
                {empleado ? 1 : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Empleado activo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" color="warning" gutterBottom>
                {tickets.filter(t => t.estado === 'pendiente').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tickets pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" color="info" gutterBottom>
                {tickets.filter(t => t.estado === 'iniciado').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En progreso
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" color="success" gutterBottom>
                {tickets.filter(t => t.estado === 'terminado').length}
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

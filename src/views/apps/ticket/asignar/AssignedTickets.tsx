'use client'

import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'

// Third-party Imports
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'

// Styles
import styles from '@core/styles/table.module.css'

// Custom Hooks
import { useLoading } from '@/components/ui/LoadingModal'

// -----------------------------
// Tipos
// -----------------------------
interface Ticket {
  id: number
  cliente: string
  asunto: string
  descripcion: string
  prioridad: string
  estado: string
  asignadoA?: string
  _raw: any
}

interface Empleado {
  id: number
  name: string
}

// -----------------------------
// Configuración tabla
// -----------------------------
const columnHelper = createColumnHelper<Ticket>()

const AssignedTickets = () => {
  const { esperar, finEspera } = useLoading()
  const [data, setData] = useState<Ticket[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para el modal de rechazo
  const [openRejectModal, setOpenRejectModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [justificacion, setJustificacion] = useState('')

  // -----------------------------
  // Asignar ticket a empleado
  // -----------------------------
  const asignarTicket = async (ticketId: number, empleadoId: number) => {
    try {
      const ticket = data.find(t => t.id === ticketId)

      if (!ticket) return

      const empleado = empleados.find(e => e.id === empleadoId)

      const payload = {
        ...ticket._raw,
        assignedToEmployeeId: empleadoId
      }

      esperar()

      const res = await fetch('/api/tickets/asignaciones/asignar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (!res.ok) {
        console.error('Error asignando ticket:', result)
        finEspera()

        return
      }

      // ✅ Actualización local
      setData(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, estado: 'Asignado', asignadoA: empleado?.name || '' } : t))
      )

      finEspera()
    } catch (error) {
      console.error('Error al asignar ticket:', error)
      finEspera()
    }
  }

  // -----------------------------
  // Rechazar ticket
  // -----------------------------
  const rechazarTicket = async () => {
    if (!selectedTicket || !justificacion.trim()) {
      alert('Por favor ingrese una justificación')

      return
    }

    try {
      esperar()

      console.log('Enviando datos de rechazo:', {
        id: selectedTicket.id,
        rejectionReason: justificacion.trim()
      })

      const res = await fetch('/api/tickets/asignaciones/rechazar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedTicket._raw,
          rejectionReason: justificacion.trim()
        })
      })

      console.log('Respuesta status:', res.status)

      const result = await res.json()

      console.log('Respuesta completa:', result)

      if (!res.ok) {
        console.error('Error del servidor:', result)
        alert(result.message || 'Error al rechazar el ticket')
        finEspera()

        return
      }

      // ✅ Actualización local - remover ticket de la lista
      setData(prev => prev.filter(t => t.id !== selectedTicket.id))

      alert('Ticket rechazado exitosamente')
      setOpenRejectModal(false)
      setSelectedTicket(null)
      setJustificacion('')
      finEspera()
    } catch (error) {
      console.error('Error en rechazarTicket:', error)
      alert(`Error al rechazar el ticket: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      finEspera()
    }
  }

  // -----------------------------
  // Obtener tickets y empleados
  // -----------------------------
  const fetchTickets = async () => {
    try {
      setLoading(true)
      esperar()

      const res = await fetch('/api/tickets/asignaciones/obtener')
      const json = await res.json()

      if (res.ok && json?.tickets) {
        const mapped: Ticket[] = json.tickets.map((t: any) => ({
          id: t.id,
          cliente: t.contactName || 'Sin cliente',
          asunto: t.subject,
          descripcion: t.description,
          prioridad: t.priority?.name || 'N/A',
          estado: t.status?.name || 'Pendiente',
          asignadoA: t.assignedToEmployeeId ? 'Asignado' : undefined,
          _raw: t
        }))

        setData(mapped)
        setEmpleados(json.empleados || [])
      } else {
        console.error('Error cargando datos:', json.message)
      }

      finEspera()
    } catch (error) {
      console.error('Error al cargar tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // -----------------------------
  // Columnas
  // -----------------------------
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Ticket',
        cell: info => `#${info.getValue()}`
      }),
      columnHelper.accessor('cliente', { header: 'Cliente' }),
      columnHelper.accessor('asunto', { header: 'Asunto' }),
      columnHelper.accessor('descripcion', { header: 'Descripción' }),
      columnHelper.accessor('prioridad', {
        header: 'Prioridad',
        cell: info => {
          const value = info.getValue()

          const color = value === 'Alta' ? 'error' : value === 'Media' ? 'warning' : 'success'

          return <Chip label={value} color={color as any} size='small' />
        }
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: info => {
          const estado = info.getValue()

          const color = estado === 'Asignado' ? 'primary' : estado === 'Pendiente' ? 'default' : 'success'

          return <Chip label={estado} color={color as any} size='small' />
        }
      }),
      columnHelper.display({
        id: 'asignar',
        header: 'Asignar',
        cell: ({ row }) => {
          const ticket = row.original

          return ticket.estado === 'Asignado' ? (
            <span>{ticket.asignadoA}</span>
          ) : (
            <Box display='flex' gap={1}>
              <Select
                size='small'
                displayEmpty
                defaultValue=''
                onChange={e => asignarTicket(ticket.id, Number(e.target.value))}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value='' disabled>
                  Seleccionar técnico
                </MenuItem>
                {empleados.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </Select>

              <Button
                variant='outlined'
                color='error'
                size='small'
                onClick={() => {
                  setSelectedTicket(ticket)
                  setJustificacion('')
                  setOpenRejectModal(true)
                }}
              >
                Rechazar
              </Button>
            </Box>
          )
        }
      })
    ],
    [empleados]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  // -----------------------------
  // Render
  // -----------------------------
  if (loading) return <p className='p-4'>Cargando tickets...</p>

  return (
    <>
      <Card>
        <CardHeader title='Asignación de Tickets' />
        <div className='overflow-x-auto'>
          {data.length > 0 ? (
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Box display='flex' justifyContent='center' alignItems='center' height='150px' textAlign='center'>
              <Typography variant='body1' color='text.secondary'>
                Sin tickets pendientes de asignación.
              </Typography>
            </Box>
          )}
        </div>
      </Card>

      {/* Modal de Rechazo */}
      <Dialog open={openRejectModal} onClose={() => setOpenRejectModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Rechazar Ticket #{selectedTicket?.id}</DialogTitle>

        <DialogContent>
          <Box mb={2} mt={1}>
            <Typography variant='body2' color='text.secondary'>
              <strong>Cliente:</strong> {selectedTicket?.cliente}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              <strong>Asunto:</strong> {selectedTicket?.asunto}
            </Typography>
          </Box>

          <TextField
            label='Justificación del rechazo'
            placeholder='Ingrese el motivo por el cual se rechaza este ticket...'
            multiline
            rows={4}
            fullWidth
            required
            value={justificacion}
            onChange={e => setJustificacion(e.target.value)}
            helperText='Este comentario quedará registrado en el historial'
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenRejectModal(false)}>Cancelar</Button>
          <Button onClick={rechazarTicket} color='error' variant='contained' disabled={!justificacion.trim()}>
            Confirmar Rechazo
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AssignedTickets

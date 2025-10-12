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

// Third-party Imports
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'

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
        prev.map(t =>
          t.id === ticketId
            ? { ...t, estado: 'Asignado', asignadoA: empleado?.name || '' }
            : t
        )
      )

      finEspera()
    } catch (error) {
      console.error('Error al asignar ticket:', error)
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

          const color =
            value === 'Alta' ? 'error' : value === 'Media' ? 'warning' : 'success'

          return <Chip label={value} color={color as any} size="small" />
        }
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: info => {
          const estado = info.getValue()

          const color =
            estado === 'Asignado'
              ? 'primary'
              : estado === 'Pendiente'
              ? 'default'
              : 'success'

          return <Chip label={estado} color={color as any} size="small" />
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
            <Select
              size="small"
              displayEmpty
              defaultValue=""
              onChange={e => asignarTicket(ticket.id, Number(e.target.value))}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="" disabled>
                Seleccionar técnico
              </MenuItem>
              {empleados.map(emp => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
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
  if (loading) return <p className="p-4">Cargando tickets...</p>

  return (
    <Card>
      <CardHeader title="Asignación de Tickets" />
      <div className="overflow-x-auto">
        {data.length > 0 ? (
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (

          // 🔹 Mensaje cuando no hay tickets pendientes de asignación
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="150px"
            textAlign="center"
          >
            <Typography variant="body1" color="text.secondary">
              Sin tickets pendientes de asignación.
            </Typography>
          </Box>
        )}
      </div>
    </Card>
  )
}

export default AssignedTickets

'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'

// Third-party Imports
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'

// Style Imports
import styles from '@core/styles/table.module.css'

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
  _raw: any // 🔹 guardamos el ticket completo para reenviarlo luego
}

interface Empleado {
  id: number
  name: string
}

// -----------------------------
// Tabla
// -----------------------------
const columnHelper = createColumnHelper<Ticket>()

const AssignedTickets = () => {
  const [data, setData] = useState<Ticket[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)

  // -----------------------------
  // Lógica para asignar ticket
  // -----------------------------
  const asignarTicket = async (ticketId: number, empleadoId: number) => {
    try {
      const ticket = data.find(t => t.id === ticketId)

      if (!ticket) return

      const empleado = empleados.find(e => e.id === empleadoId)

      // 🔹 Mandar todo el objeto del ticket (completo)
      const payload = {
        ...ticket._raw, // ticket completo del backend
        assignedToEmployeeId: empleadoId // reemplazar asignación
      }

      console.log('📤 Enviando ticket:', payload)

      const res = await fetch('/api/tickets/asignaciones/asignar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (!res.ok) {
        console.error('Error asignando ticket:', result)

        return
      }

      console.log('✅ Ticket asignado:', result)

      // Actualiza visualmente
      setData(prev =>
        prev.map(t =>
          t.id === ticketId
            ? { ...t, estado: 'Asignado', asignadoA: empleado?.name || '' }
            : t
        )
      )
    } catch (error) {
      console.error('Error al asignar ticket:', error)
    }
  }

  // -----------------------------
  // Obtener tickets y empleados reales
  // -----------------------------
  const fetchTickets = async () => {
    try {
      setLoading(true)
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
          _raw: t // 🔹 guardamos el objeto completo
        }))

        setData(mapped)
        setEmpleados(json.empleados || [])
      } else {
        console.error('Error cargando datos:', json.message)
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

  // -----------------------------
  // Definición de columnas
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
            value === 'Alta'
              ? 'error'
              : value === 'Media'
              ? 'warning'
              : 'success'

          return <Chip label={value} color={color as any} size="small" />

        }
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: info => {
          const estado = info.getValue()

          return (
            <Chip
              label={estado}
              color={estado === 'Pendiente' ? 'default' : 'primary'}
              size="small"
            />
          )
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
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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
      </div>
    </Card>
  )
}

export default AssignedTickets

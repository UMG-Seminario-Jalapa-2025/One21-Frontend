'use client'

// React Imports
import { useMemo, useState } from 'react'

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
  prioridad: 'Alta' | 'Media' | 'Baja'
  estado: 'Pendiente' | 'Asignado'
  asignadoA?: string
}

const columnHelper = createColumnHelper<Ticket>()

// -----------------------------
// Data quemada
// -----------------------------
const defaultData: Ticket[] = [
  {
    id: 101,
    cliente: 'Juan Pérez',
    asunto: 'Error en login',
    descripcion: 'El usuario no puede acceder al sistema',
    prioridad: 'Alta',
    estado: 'Pendiente'
  },
  {
    id: 102,
    cliente: 'ACME Inc.',
    asunto: 'Factura duplicada',
    descripcion: 'Cliente reporta doble cobro en factura',
    prioridad: 'Media',
    estado: 'Pendiente'
  },
  {
    id: 103,
    cliente: 'María López',
    asunto: 'Consulta de servicio',
    descripcion: 'Quiere información de plan premium',
    prioridad: 'Baja',
    estado: 'Asignado',
    asignadoA: 'Carlos López'
  }
]

// Técnicos random
const tecnicos = ['Carlos López', 'María García', 'Ana Rodríguez']

// -----------------------------
// Componente principal
// -----------------------------
const AssignedTickets = () => {
  const [data, setData] = useState<Ticket[]>(defaultData)

  const asignarTicket = (ticketId: number, tecnico: string) => {
    setData(prev =>
      prev.map(t =>
        t.id === ticketId
          ? { ...t, estado: 'Asignado', asignadoA: tecnico }
          : t
      )
    )
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Ticket',
        cell: info => `#${info.getValue()}`
      }),
      columnHelper.accessor('cliente', {
        header: 'Cliente'
      }),
      columnHelper.accessor('asunto', {
        header: 'Asunto'
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción'
      }),
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
              onChange={e => asignarTicket(ticket.id, e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="" disabled>
                Seleccionar técnico
              </MenuItem>
              {tecnicos.map(tec => (
                <MenuItem key={tec} value={tec}>
                  {tec}
                </MenuItem>
              ))}
            </Select>
          )
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

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

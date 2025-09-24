'use client'

import { useEffect, useState, useMemo } from 'react'

// MUI
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Pagination from '@mui/material/Pagination'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'

// React Table
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel
} from '@tanstack/react-table'

// Styles
import styles from '@core/styles/table.module.css'

// Tipos
type Empleado = {
  id: number
  nombre: string
  email: string
  telefono: string
  fecha: string
  activo: boolean
}

// helper para columnas
const columnHelper = createColumnHelper<Empleado>()

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('') // 🔎 filtro

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/empleados/obtener')
        const data: Empleado[] = await res.json()
        setEmpleados(data)
      } catch (error) {
        console.error('Error cargando empleados', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleActivo = (id: number, value: boolean) => {
    setEmpleados(prev =>
      prev.map(e => (e.id === id ? { ...e, activo: value } : e))
    )
  }

  const handleEliminar = (id: number) => {
    setEmpleados(prev => prev.filter(e => e.id !== id))
  }

  // 🔎 aplica filtro
  const empleadosFiltrados = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return empleados
    return empleados.filter(
      e =>
        e.nombre.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.telefono.toLowerCase().includes(q)
    )
  }, [query, empleados])

  const columns = useMemo(
    () => [
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor('email', { header: 'Correo Electrónico' }),
      columnHelper.accessor('telefono', { header: 'Teléfono' }),
      columnHelper.accessor('fecha', {
        header: 'Fecha',
        cell: info => {
          const d = new Date(info.getValue())
          return isNaN(+d) ? info.getValue() : d.toLocaleDateString()
        }
      }),
      columnHelper.accessor('activo', {
        header: 'Estado',
        cell: info => (
          <Switch
            checked={info.getValue()}
            onChange={e => toggleActivo(info.row.original.id, e.target.checked)}
          />
        )
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: info => (
          <div className="flex gap-2 justify-center">
            <Tooltip title="Editar">
              <IconButton color="info" size="small">
                <i className="tabler-edit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                color="error"
                size="small"
                onClick={() => handleEliminar(info.row.original.id)}
              >
                <i className="tabler-trash-off" />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: empleadosFiltrados, // 👈 usamos el filtrado
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } }
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4">Empleados</Typography>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <CircularProgress />
        </div>
      ) : (
        <Card>
          <CardHeader
            title="Listado de Empleados"
            action={
              <TextField
                size="small"
                placeholder="Buscar empleado..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            }
          />

          <div className="overflow-x-auto">
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
          </div>

          <div className="flex justify-center py-4">
            <Pagination
              count={table.getPageCount()}
              page={table.getState().pagination.pageIndex + 1}
              onChange={(_, page) => table.setPageIndex(page - 1)}
              color="primary"
            />
          </div>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

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

// Componente de protección de rutas
// import RoleBasedRoute from '@/components/RoleBasedRoute'

// Tipos
interface Ticket {
  id: number
  cliente: string
  asunto: string
  descripcion: string
  prioridad: string
  estado: string
  estadoNombre: string
  asignadoA?: string
  fechaCreacion: string
  _raw: any
}

interface Estadisticas {
  total: number
  sinAsingar: number
  pendientes: number
  iniciados: number
  completos: number
}

const columnHelper = createColumnHelper<Ticket>()

const VerTodosTickets = () => {
  const [data, setData] = useState<Ticket[]>([])

  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total: 0,
    sinAsingar: 0,
    pendientes: 0,
    iniciados: 0,
    completos: 0
  })

  const [loading, setLoading] = useState(true)

  // Obtener tickets
  const fetchTickets = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/tickets/obtenerTodos')
      const json = await res.json()

      if (res.ok && json?.tickets) {
        const mapped: Ticket[] = json.tickets.map((t: any) => ({
          id: t.id,
          cliente: t.contactName || 'Sin cliente',
          asunto: t.subject,
          descripcion: t.description,
          prioridad: t.priority?.name || 'N/A',
          estado: t.status?.name || 'Pendiente',
          estadoNombre: t.status?.name || 'Pendiente',
          asignadoA: t.assignedToEmployeeId ? 'Asignado' : 'Sin asignar',
          fechaCreacion: new Date(t.slaDueAt).toLocaleDateString('es-GT'),
          _raw: t
        }))

        setData(mapped)

        // Calcular estadísticas
        const stats: Estadisticas = {
          total: mapped.length,
          sinAsingar: mapped.filter(t => !t._raw.assignedToEmployeeId).length,
          pendientes: mapped.filter(t => t._raw.status?.id === 1).length,
          iniciados: mapped.filter(t => t._raw.status?.id === 2).length,
          completos: mapped.filter(t => t._raw.status?.id === 3).length,
          
        }

        setEstadisticas(stats)
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

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Ticket',
        cell: info => `#${info.getValue()}`
      }),
      columnHelper.accessor('cliente', { header: 'Cliente' }),
      columnHelper.accessor('asunto', { header: 'Asunto' }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: info => (
          <div style={{
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {info.getValue()}
          </div>
        )
      }),
      columnHelper.accessor('prioridad', {
        header: 'Prioridad',
        cell: info => {
          const value = info.getValue()

          const color =
            value === 'Alta' ? 'error' : value === 'Media' ? 'warning' : 'success'

          return <Chip label={value} color={color as any} size="small" />
        }
      }),
      columnHelper.accessor('estadoNombre', {
        header: 'Estado',
        cell: info => {
          const estado = info.getValue()

          const color =
            estado === 'Pendiente'
              ? 'default'
              : estado === 'En Proceso' || estado === 'Iniciado'
              ? 'primary'
              : estado === 'Completado' || estado === 'Cerrado'
              ? 'success'
              : 'secondary'

          return <Chip label={estado} color={color as any} size="small" />
        }
      }),
      columnHelper.accessor('asignadoA', { header: 'Asignación' }),
      columnHelper.accessor('fechaCreacion', { header: 'Fecha de Creación' })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  // Componente de estadísticas
  const EstadisticasCard = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="primary">
              {estadisticas.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Tickets
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="warning">
              {estadisticas.pendientes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pendientes
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="info">
              {estadisticas.iniciados}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Iniciados
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="success">
              {estadisticas.completos}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completos
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="success">
              {estadisticas.sinAsingar}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sin Asignar
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando tickets...</Typography>
      </Box>
    )
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <Typography variant='h4'>Administración de Tickets</Typography>
      </div>

      {/* Estadísticas */}
      <EstadisticasCard />

      {/* Tabla de tickets */}
      <Card>
        <CardHeader title={`Lista de Tickets (${data.length})`} />
        <div className='overflow-x-auto'>
          {data.length > 0 ? (
            <>
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

              {/* Paginación */}
              <div className='flex justify-center py-4'>
                <div className='flex gap-2'>
                  <button
                    className='px-3 py-1 border rounded disabled:opacity-50'
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Anterior
                  </button>

                  <span className='px-3 py-1'>
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                  </span>

                  <button
                    className='px-3 py-1 border rounded disabled:opacity-50'
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="150px"
              textAlign="center"
            >
              <Typography variant="body1" color="text.secondary">
                No hay tickets disponibles.
              </Typography>
            </Box>
          )}
        </div>
      </Card>
    </div>
  )
}

export default VerTodosTickets

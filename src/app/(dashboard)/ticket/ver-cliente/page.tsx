'use client'

import { useEffect, useState, useMemo } from 'react'

import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  CircularProgress
} from '@mui/material'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel
} from '@tanstack/react-table'

import styles from '@core/styles/table.module.css'

// ================= Tipos =================
interface Ticket {
  id: number
  asunto: string
  descripcion: string
  prioridad: string
  estado: string
  fechaCreacion: string
  _raw: any
}

interface Estadisticas {
  total: number
  pendientes: number
  iniciados: number
  completados: number
}

// ================= Component =================
const columnHelper = createColumnHelper<Ticket>()

export default function VerTicketsCliente() {
  const [tickets, setTickets] = useState<Ticket[]>([])

  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total: 0,
    pendientes: 0,
    iniciados: 0,
    completados: 0
  })

  const [loading, setLoading] = useState(true)

  // ======= Obtener tickets del cliente =======
  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tickets/kanban/cliente')
      const json = await res.json()

      if (res.ok && json?.tickets) {
        const mapped: Ticket[] = json.tickets.map((t: any) => ({
          id: t.id,
          asunto: t.subject || 'Sin asunto',
          descripcion: t.description || 'Sin descripción',
          prioridad: t.priority?.name || 'N/A',
          estado: t.status?.name || 'Pendiente',
          fechaCreacion: new Date(t.slaDueAt || t.createdAt).toLocaleDateString('es-GT'),
          _raw: t
        }))

        setTickets(mapped)

        // Calcular estadísticas
        const stats: Estadisticas = {
          total: mapped.length,
          pendientes: mapped.filter(t => t.estado === 'Pendiente').length,
          iniciados: mapped.filter(t => t.estado === 'En Proceso' || t.estado === 'Iniciado').length,
          completados: mapped.filter(t => t.estado === 'Completado' || t.estado === 'Cerrado').length
        }

        setEstadisticas(stats)

      } else {
        console.error('Error cargando tickets:', json.message)
      }
    } catch (error) {
      console.error('❌ Error al cargar tickets del cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // ======= Columnas =======
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'Ticket', cell: info => `#${info.getValue()}` }),
      columnHelper.accessor('asunto', { header: 'Asunto' }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: info => (
          <div
            style={{
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {info.getValue()}
          </div>
        )
      }),
      columnHelper.accessor('prioridad', {
        header: 'Prioridad',
        cell: info => {
          const value = info.getValue()
          const color = value === 'Alta' ? 'error' : value === 'Media' ? 'warning' : 'success'

          return <Chip label={value} color={color as any} size="small" />
        }
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: info => {
          const value = info.getValue()

          const color =
            value === 'Pendiente'
              ? 'default'
              : value === 'En Proceso'
              ? 'primary'
              : value === 'Completado'
              ? 'success'
              : 'secondary'

          return <Chip label={value} color={color as any} size="small" />
        }
      }),
      columnHelper.accessor('fechaCreacion', { header: 'Fecha de Creación' })
    ],
    []
  )

  const table = useReactTable({
    data: tickets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  // ======= Subcomponente de estadísticas =======
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
            <Typography variant="h4" color="warning.main">
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
            <Typography variant="h4" color="info.main">
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
            <Typography variant="h4" color="success.main">
              {estadisticas.completados}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completados
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  // ======= Loader =======
  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando tickets...</Typography>
      </Box>
    )

  // ======= Render =======
  return (
    <div className="p-6">
      <Typography variant="h4" mb={4}>
        Tickets del Cliente
      </Typography>

      <EstadisticasCard />

      <Card>
        <CardHeader title={`Lista de Tickets (${tickets.length})`} />
        <div className="overflow-x-auto">
          {tickets.length > 0 ? (
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
              <div className="flex justify-center py-4">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Anterior
                  </button>

                  <span className="px-3 py-1">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                  </span>

                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="150px">
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

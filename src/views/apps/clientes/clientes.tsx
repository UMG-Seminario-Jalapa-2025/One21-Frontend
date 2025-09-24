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
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

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
type Cliente = {
  id: number
  code: string
  nombre: string
  documento: string
  estado: boolean
  rol: string
  email?: string
  telefono?: string
  createdAt?: string
}

const columnHelper = createColumnHelper<Cliente>()

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Cliente | null>(null) // 👈 cliente en modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/clientes/obtener')
        const data: Cliente[] = await res.json()

        // ✅ filtra SOLO clientes con rol CUSTOMER
        const soloCustomers = data.filter(c => c.rol === 'CUSTOMER')
        setClientes(soloCustomers)
      } catch (error) {
        console.error('Error cargando clientes', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 🔎 filtro por búsqueda
  const clientesFiltrados = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return clientes
    return clientes.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        c.documento.toLowerCase().includes(q)
    )
  }, [query, clientes])

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', { header: 'Código' }),
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor('documento', { header: 'Documento' }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: info =>
          info.getValue() ? (
            <Chip label="Activo" color="success" size="small" />
          ) : (
            <Chip label="Inactivo" color="default" size="small" />
          )
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: info => (
          <div className="flex gap-2 justify-center">
            <Tooltip title="Ver detalles">
              <IconButton
                color="info"
                size="small"
                onClick={() => setSelected(info.row.original)} // 👈 abre modal
              >
                <i className="tabler-eye" />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: clientesFiltrados,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } }
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4">Clientes</Typography>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <CircularProgress />
        </div>
      ) : (
        <Card>
          <CardHeader
            title="Listado de Clientes"
            action={
              <TextField
                size="small"
                placeholder="Buscar cliente..."
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      No se encontraron clientes
                    </td>
                  </tr>
                )}
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

      {/* 👁️ Modal de detalles */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Cliente</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <div className="space-y-3">
              <p><b>Código:</b> {selected.code}</p>
              <p><b>Nombre:</b> {selected.nombre}</p>
              <p><b>Documento:</b> {selected.documento}</p>
              <p><b>Email:</b> {selected.email ?? 'N/A'}</p>
              <p><b>Teléfono:</b> {selected.telefono ?? 'N/A'}</p>
              <p><b>Estado:</b> {selected.estado ? 'Activo' : 'Inactivo'}</p>
              <p><b>Rol:</b> {selected.rol}</p>
              {selected.createdAt && (
                <p><b>Fecha creación:</b> {new Date(selected.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'

import Link from 'next/link'

// MUI
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Pagination from '@mui/material/Pagination'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

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

// Components
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Custom hook
import { useLoading } from '@/components/ui/LoadingModal'

type Country = {
  id: number
  code: string
  name: string
  phone_code: string
  is_active: boolean
}

const columnHelper = createColumnHelper<Country>()

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([])

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { esperar, finEspera } = useLoading()

  const fetchData = async () => {
    try {
      esperar()
      const res = await fetch('/api/countries/obtener')
      const data: Country[] = await res.json()
      
      setCountries(data)
    } catch (err) {
      console.error('Error cargando países', err)
    } finally {
      finEspera()
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      esperar()
      const res = await fetch(`/api/countries/${deleteId}`, { method: 'DELETE' })

      if (!res.ok) throw new Error('Error al eliminar')

      setSnackbar({ open: true, message: 'País eliminado con éxito', severity: 'success' })
      fetchData()
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al eliminar país', severity: 'error' })
    } finally {
      finEspera()
      setConfirmOpen(false)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', { header: 'Código' }),
      columnHelper.accessor('name', { header: 'Nombre' }),
      columnHelper.accessor('phone_code', { header: 'Teléfono' }),
      columnHelper.accessor('is_active', {
        header: 'Activo',
        cell: info => (info.getValue() ? 'Sí' : 'No')
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const country = row.original

          return (
            <div className="flex gap-2 justify-center">
              <Tooltip title="Editar">
                <Link href={`/countries/${country.id}/edit`}>
                  <IconButton color="info" size="small">
                    <i className="tabler-edit" />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => {
                    setDeleteId(country.id)
                    setConfirmOpen(true)
                  }}
                >
                  <i className="tabler-trash-off" />
                </IconButton>
              </Tooltip>
            </div>
          )
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data: countries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 5 }
    }
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4">Países</Typography>
        <Link href="/countries/create">
          <Button variant="contained" color="primary">
            Crear País
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader title="Catálogo de Países" />
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
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        message="¿Seguro que deseas eliminar este país?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Notificación */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  )
}

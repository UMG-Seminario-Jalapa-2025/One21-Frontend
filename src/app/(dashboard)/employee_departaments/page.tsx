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

// Tipo para departamentos
type Department = {
  id: number
  code: string
  name: string
  isActive: boolean
}

const columnHelper = createColumnHelper<Department>()

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { esperar, finEspera } = useLoading()

  // 🔹 Solo placeholder por ahora, luego se conecta con API
  const fetchData = async () => {
    try {
      esperar()

      const data: Department[] = [
        { id: 1, code: '1', name: 'Mantenimiento', isActive: true }
      ]
      setDepartments(data)
    } catch (err) {
      console.error('Error cargando departamentos', err)
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
      // 🔹 placeholder (luego se conecta con DELETE)
      setSnackbar({ open: true, message: 'Departamento eliminado con éxito', severity: 'success' })
      setDepartments(prev => prev.filter(d => d.id !== deleteId))
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al eliminar departamento', severity: 'error' })
    } finally {
      finEspera()
      setConfirmOpen(false)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', { header: 'Código' }),
      columnHelper.accessor('name', { header: 'Nombre' }),
      columnHelper.accessor('isActive', {
        header: 'Activo',
        cell: info => (info.getValue() ? 'Sí' : 'No')
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const dept = row.original

          return (
            <div className="flex gap-2 justify-center">
              <Tooltip title="Editar">
                <Link href={`/employee_departaments/${dept.id}/edit`}>
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
                    setDeleteId(dept.id)
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
    data: departments,
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
        <Typography variant="h4">Departamentos</Typography>
        <Link href="/employee_departaments/create">
          <Button variant="contained" color="primary">
            Crear Departamento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader title="Catálogo de Departamentos" />
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
        message="¿Seguro que deseas eliminar este departamento?"
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

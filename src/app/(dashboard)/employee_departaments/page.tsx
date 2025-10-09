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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })
  
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { esperar, finEspera } = useLoading()

  // 🔹 Obtener departamentos
  const fetchData = async () => {
    try {
      esperar()
      const res = await fetch('/api/employee_departments/obtener')

      if (!res.ok) {
        const error = await res.json()

        throw new Error(error.message || 'Error al obtener departamentos')
      }

      const data = await res.json()

      // 🧠 Aseguramos compatibilidad con isActive o is_active
      const mappedData: Department[] = data.map((d: any) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        isActive: d.isActive ?? d.is_active ?? false
      }))

      setDepartments(mappedData)
    } catch (err) {
      console.error('❌ Error cargando departamentos:', err)
      setSnackbar({ open: true, message: 'Error al cargar departamentos', severity: 'error' })
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
      const res = await fetch(`/api/employee_departments/${deleteId}`, { method: 'DELETE' })

      if (!res.ok) throw new Error('Error al eliminar departamento')

      setSnackbar({ open: true, message: 'Departamento eliminado con éxito', severity: 'success' })
      fetchData()
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

        // 🔹 Mostrar texto correcto según valor booleano
        cell: info => (info.getValue() ? 'Sí' : 'No')
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const dept = row.original

          return (
            <div className='flex gap-2 justify-center'>
              <Tooltip title='Editar'>
                <Link href={`/employee_departaments/${dept.id}/edit`}>
                  <IconButton color='info' size='small'>
                    <i className='tabler-edit' />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip title='Eliminar'>
                <IconButton
                  color='error'
                  size='small'
                  onClick={() => {
                    setDeleteId(dept.id)
                    setConfirmOpen(true)
                  }}
                >
                  <i className='tabler-trash-off' />
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
    initialState: { pagination: { pageSize: 5 } }
  })

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <Typography variant='h4'>Departamentos</Typography>
        <Link href='/employee_departaments/create'>
          <Button variant='contained' color='primary'>
            Crear Departamento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader title='Catálogo de Departamentos' />
        <div className='overflow-x-auto'>
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
        </div>

        <div className='flex justify-center py-4'>
          <Pagination
            count={table.getPageCount()}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(_, page) => table.setPageIndex(page - 1)}
            color='primary'
          />
        </div>
      </Card>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        message='¿Seguro que deseas eliminar este departamento?'
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Notificación */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Pagination from '@mui/material/Pagination'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel
} from '@tanstack/react-table'

import styles from '@core/styles/table.module.css'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useLoading } from '@/components/ui/LoadingModal'

type DepartmentRaw = Record<string, any>
type CountryLite = { id: number; name: string }

// Fila normalizada para la tabla
type DepartmentRow = {
  id: number
  name: string
  _active: boolean
  _countryId: number | null
  _countryName: string | null
}

const columnHelper = createColumnHelper<DepartmentRow>()

export default function DepartmentsPage() {
  const [rows, setRows] = useState<DepartmentRow[]>([])
  const [countriesMap, setCountriesMap] = useState<Record<number, string>>({})

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

      const [depRes, ctryRes] = await Promise.all([fetch('/api/business-partner/departaments/obtener'), fetch('/api/business-partner/countries/obtener')])

      const depData: DepartmentRaw[] = await depRes.json()
      const countries: CountryLite[] = await ctryRes.json()

      const cmap = Object.fromEntries((countries || []).map(c => [c.id, c.name])) as Record<number, string>

      setCountriesMap(cmap)

      const normalized: DepartmentRow[] = (depData || []).map(d => {
        console.log('Departamento individual:', d) // Debug

        const isActive = d.isActive ?? d.is_active
        const _active = isActive === false || isActive === 0 || isActive === '0' || isActive === 'false' ? false : true

        return {
          id: d.id,
          name: d.name,
          _active,
          _countryId: d.country_id ?? d.countryId ?? d.country?.id ?? d.countries?.id ?? null,
          _countryName: d.country?.name ?? d.countries?.name ?? null
        }
      })

      setRows(normalized)
    } catch (err) {
      console.error('Error cargando departamentos', err)
      setSnackbar({ open: true, message: 'Error al cargar departamentos', severity: 'error' })
    } finally {
      finEspera()
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      esperar()
      const res = await fetch(`/api/business-partner/departments/${deleteId}`, { method: 'DELETE' })

      if (!res.ok) throw new Error('Error al eliminar')

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
      columnHelper.accessor('name', { header: 'NOMBRE' }),
      columnHelper.display({
        id: 'country',
        header: 'PAÍS',
        cell: ({ row }) => {
          const r = row.original

          return r._countryName || (r._countryId ? countriesMap[r._countryId] : '—')
        }
      }),
      columnHelper.display({
        id: 'active',
        header: 'ACTIVO',
        cell: ({ row }) => (row.original._active ? 'Sí' : 'No')
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'ACCIONES',
        cell: ({ row }) => {
          const d = row.original

          return (
            <div className='flex gap-2 justify-center'>
              <Tooltip title='Editar'>
                <Link href={`/departments/${d.id}/edit`}>
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
                    setDeleteId(d.id)
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
    [countriesMap]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } }
  })

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <Typography variant='h4'>Departamentos</Typography>
        <Link href='/departments/create'>
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
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(r => (
                <tr key={r.id}>
                  {r.getVisibleCells().map(c => (
                    <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
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
            onChange={(_, p) => table.setPageIndex(p - 1)}
            color='primary'
          />
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        message='¿Seguro que deseas eliminar este departamento?'
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  )
}

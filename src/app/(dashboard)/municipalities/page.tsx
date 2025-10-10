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

type MunicipalityRaw = Record<string, any>
type DepartmentLite = { id: number; name: string }

type MunicipalityNorm = {
  id: number
  name: string
  _active: boolean
  _deptId: number | null
  _deptName: string | null
}

const columnHelper = createColumnHelper<MunicipalityNorm>()

export default function MunicipalitiesPage() {
  const [rows, setRows] = useState<MunicipalityNorm[]>([])
  const [departmentsMap, setDepartmentsMap] = useState<Record<number, string>>({})

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId] = useState<number | null>(null)
  const { esperar, finEspera } = useLoading()

  const pickDeptId = (m: MunicipalityRaw): number | null => {
    const v = m.departments_id ?? m.department_id ?? m.departments?.id ?? m.department?.id ?? null

    return typeof v === 'number' ? v : v ? Number(v) : null
  }

  const pickDeptName = (m: MunicipalityRaw): string | null => m.department?.name ?? m.departments?.name ?? null

  const pickActive = (m: MunicipalityRaw): boolean => {
    const v = m.is_active ?? m.isActive ?? m.active

    return v === false || v === 0 || v === '0' || v === 'false' ? false : true
  }

  const fetchData = async () => {
    try {
      esperar()

      const [munRes, depRes] = await Promise.all([
        fetch('/api/business-partner/municipality/obtener'),
        fetch('/api/business-partner/departaments/obtener')
      ])

      const munData: MunicipalityRaw[] = await munRes.json()
      const depData: DepartmentLite[] = await depRes.json()

      const dmap = Object.fromEntries((depData || []).map(d => [d.id, d.name])) as Record<number, string>

      setDepartmentsMap(dmap)

      // 🔥 FIX: Hacer fetch individual de cada municipio para obtener el departamento
      const detailedMunicipalities = await Promise.all(
        munData.map(async m => {
          try {
            const res = await fetch(`/api/business-partner/municipality/${m.id}`)

            if (res.ok) {
              return await res.json()
            }

            return m
          } catch {
            return m
          }
        })
      )

      const normalized: MunicipalityNorm[] = detailedMunicipalities.map(m => {
        const deptId = pickDeptId(m)

        return {
          id: m.id,
          name: m.name,
          _active: pickActive(m),
          _deptId: deptId,
          _deptName: pickDeptName(m) ?? (deptId ? dmap[deptId] : null)
        }
      })

      setRows(normalized)
    } catch (err) {
      console.error('Error cargando municipios', err)
      setSnackbar({ open: true, message: 'Error al cargar municipios', severity: 'error' })
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
      const res = await fetch(`/api/business-partner/municipality/${deleteId}`, { method: 'DELETE' })

      if (!res.ok) throw new Error('Error al eliminar')

      setSnackbar({ open: true, message: 'Municipio eliminado con éxito', severity: 'success' })
      fetchData()
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al eliminar municipio', severity: 'error' })
    } finally {
      finEspera()
      setConfirmOpen(false)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'NOMBRE' }),
      columnHelper.display({
        id: 'department',
        header: 'DEPARTAMENTO',
        cell: ({ row }) => {
          const r = row.original

          return r._deptName || (r._deptId ? departmentsMap[r._deptId] : '—')
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
          const m = row.original

          return (
            <div className='flex gap-2 justify-center'>
              <Tooltip title='Editar'>
                <Link href={`/municipalities/${m.id}/edit`}>
                  <IconButton color='info' size='small'>
                    <i className='tabler-edit' />
                  </IconButton>
                </Link>
              </Tooltip>
              {/* <Tooltip title='Eliminar'>
                <IconButton
                  color='error'
                  size='small'
                  onClick={() => {
                    setDeleteId(m.id)
                    setConfirmOpen(true)
                  }}
                >
                  <i className='tabler-trash-off' />
                </IconButton>
              </Tooltip> */}
            </div>
          )
        }
      })
    ],
    [departmentsMap]
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
        <Typography variant='h4'>Municipios</Typography>
        <Link href='/municipalities/create'>
          <Button variant='contained' color='primary'>
            Crear Municipio
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader title='Catálogo de Municipios' />
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
        message='¿Seguro que deseas eliminar este municipio?'
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  )
}

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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

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
  positionTitle?: string
  baseSalary?: number
  currencyCode?: string
}

const columnHelper = createColumnHelper<Empleado>()

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/empleados')

        if (!res.ok) throw new Error(`Error al obtener empleados: ${res.status}`)

        const empleadosData = await res.json()

        const empleadosNormalizados: Empleado[] = await Promise.all(
          empleadosData.map(async (emp: any) => {
            try {
              const socioRes = await fetch(`/api/pather/obtener/${emp.businessPartnerId}`)

              if (!socioRes.ok) {
                return {
                  id: emp.id,
                  nombre: '—',
                  email: '—',
                  telefono: '—',
                  fecha: emp.hireDate,
                  activo: emp.status === 'ACTIVE'
                }
              }

              const socio = await socioRes.json()

              return {
                id: emp.id,
                nombre: socio?.name || '—',
                email: socio?.email || '—',
                telefono: socio?.phone || '—',
                fecha: emp.hireDate,
                activo: emp.status === 'ACTIVE',
                positionTitle: emp.positionTitle,
                baseSalary: emp.baseSalary,
                currencyCode: emp.currencyCode
              }
            } catch {
              return {
                id: emp.id,
                nombre: '—',
                email: '—',
                telefono: '—',
                fecha: emp.hireDate,
                activo: emp.status === 'ACTIVE'
              }
            }
          })
        )

        setEmpleados(empleadosNormalizados)
      } catch (error: any) {
        console.error('❌ Error cargando empleados:', error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleActivo = async (id: number, value: boolean) => {
    try {
      const nuevoEstado = value ? 'ACTIVE' : 'INACTIVE'

      const res = await fetch(`/api/empleados/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nuevoEstado })
      })

      if (!res.ok) throw new Error('Error al actualizar estado')

      setEmpleados(prev => prev.map(e => (e.id === id ? { ...e, activo: value } : e)))
    } catch (err) {
      console.error('❌ Error al cambiar estado:', err)
    }
  }

  const handleEliminar = (id: number) => {
    setEmpleados(prev => prev.filter(e => e.id !== id))
  }

  const handleEditar = (empleado: Empleado) => {
    setSelectedEmpleado(empleado)
    setOpenModal(true)
  }

  const handleGuardar = async () => {
    if (!selectedEmpleado) return

    try {
      // 🔹 solo enviamos lo laboral

      const res = await fetch(`/api/empleados/${selectedEmpleado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEmpleado)
      })

      if (!res.ok) throw new Error('Error al actualizar empleado')

      const actualizado = await res.json()

      setEmpleados(prev => prev.map(e => (e.id === actualizado.id ? { ...e, ...actualizado } : e)))

      setOpenModal(false)
    } catch (err) {
      console.error('❌ Error al guardar cambios:', err)
    }
  }

  const empleadosFiltrados = useMemo(() => {
    const q = query.toLowerCase().trim()

    if (!q) return empleados

    return empleados.filter(
      e =>
        e.nombre.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.telefono.toLowerCase().includes(q)
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
          <Switch checked={info.getValue()} onChange={e => toggleActivo(info.row.original.id, e.target.checked)} />
        )
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: info => (
          <div className='flex gap-2 justify-center'>
            <Tooltip title='Editar'>
              <IconButton color='info' size='small' onClick={() => handleEditar(info.row.original)}>
                <i className='tabler-edit' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Eliminar'>
              <IconButton color='error' size='small' onClick={() => handleEliminar(info.row.original.id)}>
                <i className='tabler-trash-off' />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: empleadosFiltrados,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } }
  })

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <Typography variant='h4'>Empleados</Typography>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-40'>
          <CircularProgress />
        </div>
      ) : (
        <Card>
          <CardHeader
            title='Listado de Empleados'
            action={
              <TextField
                size='small'
                placeholder='Buscar empleado...'
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            }
          />

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
      )}

      {/* Modal de edición */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Editar Empleado</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className='mt-2'>
            <Grid item xs={12}>
              <TextField
                label='Puesto'
                fullWidth
                value={selectedEmpleado?.positionTitle || ''}
                onChange={e => setSelectedEmpleado(prev => (prev ? { ...prev, positionTitle: e.target.value } : prev))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='Salario Base'
                type='number'
                fullWidth
                value={selectedEmpleado?.baseSalary || ''}
                onChange={e =>
                  setSelectedEmpleado(prev => (prev ? { ...prev, baseSalary: parseFloat(e.target.value) } : prev))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='Moneda'
                fullWidth
                value={selectedEmpleado?.currencyCode || ''}
                onChange={e => setSelectedEmpleado(prev => (prev ? { ...prev, currencyCode: e.target.value } : prev))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={handleGuardar} variant='contained' color='primary'>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

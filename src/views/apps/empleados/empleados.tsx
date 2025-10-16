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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

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
  jobPositionId?: number
}

const columnHelper = createColumnHelper<Empleado>()

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [openModal, setOpenModal] = useState(false)

  // ================= CARGAR LISTA =================
  const fetchData = async () => {
    try {
      const res = await fetch('/api/empleados', { cache: 'no-store' })

      if (!res.ok) throw new Error(`Error al obtener empleados: ${res.status}`)

      const empleadosData = await res.json()

      const empleadosNormalizados: Empleado[] = await Promise.all(
        empleadosData.map(async (emp: any) => {
          try {
            const socioRes = await fetch(`/api/pather/obtener/${emp.businessPartnerId}`, { cache: 'no-store' })

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

  useEffect(() => {
    fetchData()
  }, [])

  const [puestos, setPuestos] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/employee_positions/obtener')
      .then(res => res.json())
      .then(data => (Array.isArray(data) ? setPuestos(data) : setPuestos([])))
      .catch(() => setPuestos([]))
  }, [])

  // ================= PATCH estado =================
  const toggleActivo = async (id: number, value: boolean) => {
    try {
      const nuevoEstado = value ? 'ACTIVE' : 'INACTIVE'

      const res = await fetch(`/api/empleados/${id}`, {
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

  // ================= Editar =================
  const handleEditar = (empleado: Empleado) => {
    setSelectedEmpleado(empleado)
    setOpenModal(true)
  }

  const handleGuardar = async () => {
    if (!selectedEmpleado) return

    try {
      const payload = {
        jobPositionId: selectedEmpleado.jobPositionId,
        baseSalary: selectedEmpleado.baseSalary,
        currencyCode: selectedEmpleado.currencyCode
      }

      const res = await fetch(`/api/empleados/${selectedEmpleado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store'
      })

      if (!res.ok) throw new Error('Error al actualizar empleado')

      const actualizado = await res.json()

      setEmpleados(prev => prev.map(e => (e.id === actualizado.id ? { ...e, ...actualizado } : e)))
      setOpenModal(false)
    } catch (err) {
      console.error('❌ Error al guardar cambios:', err)
    }
  }

  // ================= Filtrado =================
  const empleadosFiltrados = useMemo(() => {
    const q = query.toLowerCase().trim()

    if (!q) return empleados

    return empleados.filter(
      e =>
        e.nombre.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.telefono.toLowerCase().includes(q)
    )
  }, [query, empleados])

  // ================= Columnas =================
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

  // ================= Render =================
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
            {/* Puesto (Select) */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Puesto</InputLabel>
                <Select
                  value={selectedEmpleado?.jobPositionId || ''}
                  label='Puesto'
                  onChange={e =>
                    setSelectedEmpleado(prev => (prev ? { ...prev, jobPositionId: Number(e.target.value) } : prev))
                  }
                >
                  {puestos.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Salario base */}
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

            {/* Moneda */}
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

'use client'

import { useEffect, useState, useMemo } from 'react'

import Link from 'next/link'

// MUI
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Pagination from '@mui/material/Pagination'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid2'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

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

// UI compartidos
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'

type Status = {
  id: number
  code: string
  name: string
  isFinal: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const columnHelper = createColumnHelper<Status>()

export default function StatusPage() {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)

  // Modal editar
  const [editModal, setEditModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState<Status | null>(null)
  const [editFormData, setEditFormData] = useState({ code: '', name: '', isFinal: false, isActive: true })
  const [submitting, setSubmitting] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    status?: Status
  }>({ open: false })

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const fetchData = async () => {
    try {
      const res = await fetch('/api/tickets/status/obtener')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener estados')
      }

      setStatuses(data.data || [])
    } catch (error) {
      console.error('Error cargando estados', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar estados',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Abrir modal editar
  const handleOpenEditModal = (status: Status) => {
    setEditingStatus(status)
    setEditFormData({
      code: status.code,
      name: status.name,
      isFinal: status.isFinal,
      isActive: status.isActive
    })
    setEditModal(true)
  }

  // Editar status
  const handleEditarStatus = async () => {
    if (!editingStatus) return

    // Validaciones
    if (!editFormData.code.trim()) {
      setSnackbar({ open: true, message: 'El código es requerido', severity: 'error' })

      return
    }

    if (!editFormData.name.trim()) {
      setSnackbar({ open: true, message: 'El nombre es requerido', severity: 'error' })

      return
    }

    try {
      setSubmitting(true)

      const res = await fetch('/api/tickets/status/editar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStatus.id,
          code: editFormData.code,
          name: editFormData.name,
          isFinal: editFormData.isFinal,
          isActive: editFormData.isActive,
          createdAt: editingStatus.createdAt
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al editar estado')
      }

      setSnackbar({ open: true, message: 'Estado editado con éxito', severity: 'success' })
      setEditModal(false)
      await fetchData()
    } catch (error: any) {
      console.error('Error editando estado:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Error al editar estado',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar status
  const handleEliminar = async (status: Status) => {
    try {
      const res = await fetch(`/api/tickets/status/eliminar?id=${status.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al eliminar estado')
      }

      await new Promise(r => setTimeout(r, 300))
      setSnackbar({
        open: true,
        message: `Estado ${status.name} eliminado con éxito`,
        severity: 'success'
      })
      await fetchData()
    } catch (error: any) {
      console.error('Error eliminando estado:', error)
      await new Promise(r => setTimeout(r, 300))
      setSnackbar({
        open: true,
        message: error.message || 'Error al eliminar estado',
        severity: 'error'
      })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', { header: 'Código' }),
      columnHelper.accessor('name', { header: 'Nombre' }),
      
      // columnHelper.accessor('isFinal', {
      //   header: '¿Final?',
      //   cell: info => (
      //     <span
      //       className={`px-2 py-1 rounded-full text-xs font-medium ${
      //         info.getValue() ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      //       }`}
      //     >
      //       {info.getValue() ? 'Sí' : 'No'}
      //     </span>
      //   )
      // }),
      columnHelper.accessor('isActive', {
        header: 'Estado',
        cell: info => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              info.getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {info.getValue() ? 'Activo' : 'Inactivo'}
          </span>
        )
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const status = row.original

          return (
            <div className='flex gap-2 justify-center'>
              <Tooltip title='Editar'>
                <IconButton color='info' size='small' onClick={() => handleOpenEditModal(status)}>
                  <i className='tabler-edit' />
                </IconButton>
              </Tooltip>

              {/* <Tooltip title='Eliminar'>
                <IconButton color='error' size='small' onClick={() => setConfirmDialog({ open: true, status })}>
                  <i className='tabler-trash' />
                </IconButton>
              </Tooltip> */}
            </div>
          )
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data: statuses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } }
  })

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <Typography variant='h4'>Estados</Typography>
        <Link href='/status/crear'>
          <Button variant='contained' color='primary'>
            Crear Estado
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-40'>
          <CircularProgress />
        </div>
      ) : (
        <Card>
          <CardHeader title='Listado de Estados' />
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

      {/* Notificación */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal Editar Estado */}
      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Editar Estado</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Código'
                placeholder='Ej: OPEN'
                value={editFormData.code}
                onChange={e => setEditFormData({ ...editFormData, code: e.target.value })}
                disabled={submitting}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Nombre'
                placeholder='Ej: Abierto'
                value={editFormData.name}
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                disabled={submitting}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.isFinal}
                    onChange={e => setEditFormData({ ...editFormData, isFinal: e.target.checked })}
                    disabled={submitting}
                  />
                }
                label='¿Es estado final?'
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.isActive}
                    onChange={e => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    disabled={submitting}
                  />
                }
                label='Estado activo'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant='outlined' color='error' onClick={() => setEditModal(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant='contained' onClick={handleEditarStatus} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDialog.open}
        title='Confirmar eliminación'
        message={`¿Seguro que deseas eliminar el estado "${confirmDialog.status?.name}"?`}
        confirmText='Eliminar'
        cancelText='Cancelar'
        onConfirm={async () => {
          if (confirmDialog.status) await handleEliminar(confirmDialog.status)
          setConfirmDialog({ open: false })
        }}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </div>
  )
}

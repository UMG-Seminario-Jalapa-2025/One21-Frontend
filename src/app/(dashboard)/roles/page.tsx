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

// React Table
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel
} from '@tanstack/react-table'

// Styles
import Grid from '@mui/material/Grid2'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

import DialogActions from '@mui/material/DialogActions'

import CustomTextField from '@core/components/mui/TextField'
import styles from '@core/styles/table.module.css'

import ConfirmDialog from '@/components/ui/ConfirmDialog'



type Role = {
  id: string
  name: string
  description?: string
  composite?: boolean
  clientRole?: boolean
  containerId?: string
}

const columnHelper = createColumnHelper<Role>()

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  // Modal para editar rol
  const [editModal, setEditModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editFormData, setEditFormData] = useState({ newName: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    role?: Role
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
      const res = await fetch('/api/admin/roles/obtener')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener roles')
      }

      setRoles(data.data || [])
    } catch (error) {
      console.error('Error cargando roles', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar roles',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Abrir modal para editar
  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role)
    setEditFormData({
      newName: role.name,
      description: role.description || ''
    })
    setEditModal(true)
  }

  // Editar rol
  const handleEditarRol = async () => {
    if (!editingRole) return

    if (!editFormData.newName.trim()) {
      setSnackbar({
        open: true,
        message: 'El nombre del rol es requerido',
        severity: 'error'
      })

      return
    }

    try {
      setSubmitting(true)

      const res = await fetch(`/api/admin/roles/editar?name=${encodeURIComponent(editingRole.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al editar rol')
      }

      setSnackbar({
        open: true,
        message: 'Rol editado con éxito',
        severity: 'success'
      })
      setEditModal(false)
      await fetchData()
    } catch (error: any) {
      console.error('Error editando rol:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Error al editar rol',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar rol
  const handleEliminar = async (role: Role) => {
    try {
      const res = await fetch(`/api/admin/roles/eliminar?name=${encodeURIComponent(role.name)}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al eliminar rol')
      }

      // Esperar un momento antes de cerrar el diálogo para que se vea el toast
      await new Promise(resolve => setTimeout(resolve, 300))

      setSnackbar({
        open: true,
        message: `Rol ${role.name} eliminado con éxito`,
        severity: 'success'
      })
      await fetchData()
    } catch (error: any) {
      console.error('Error eliminando rol:', error)

      // Esperar un momento antes de cerrar el diálogo en caso de error
      await new Promise(resolve => setTimeout(resolve, 300))

      setSnackbar({
        open: true,
        message: error.message || 'Error al eliminar rol',
        severity: 'error'
      })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Nombre del Rol' }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('composite', {
        header: 'Compuesto',
        cell: info => (info.getValue() ? 'Sí' : 'No')
      }),
      columnHelper.accessor('clientRole', {
        header: 'Rol de Cliente',
        cell: info => (info.getValue() ? 'Sí' : 'No')
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const role = row.original

          return (
            <div className="flex gap-2 justify-center">
              <Tooltip title="Editar">
                <IconButton
                  color="info"
                  size="small"
                  onClick={() => handleOpenEditModal(role)}
                >
                  <i className="tabler-edit" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => setConfirmDialog({ open: true, role })}
                >
                  <i className="tabler-trash" />
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
    data: roles,
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
        <Typography variant="h4">Roles</Typography>
        <Link href="/roles/crear">
          <Button variant="contained" color="primary">
            Crear Rol
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <CircularProgress />
        </div>
      ) : (
        <Card>
          <CardHeader title="Listado de Roles" />
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
      )}

      {/* Notificación */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal Editar Rol */}
      <Dialog
        open={editModal}
        onClose={() => setEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Rol</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label="Nombre del Rol"
                placeholder="Ej: premium-client"
                value={editFormData.newName}
                onChange={(e) => setEditFormData({ ...editFormData, newName: e.target.value })}
                disabled={submitting}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label="Descripción"
                placeholder="Ej: Usuario cliente con acceso premium"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                disabled={submitting}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setEditModal(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEditarRol}
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmar eliminación"
        message={`¿Seguro que deseas eliminar el rol "${confirmDialog.role?.name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={async () => {
          if (confirmDialog.role) {
            await handleEliminar(confirmDialog.role)
          }

          setConfirmDialog({ open: false })
        }}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </div>
  )
}

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

import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'

type Priority = {
    id: number
    code: string
    name: string
    level: number
    slaHours: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

const columnHelper = createColumnHelper<Priority>()

export default function PrioridadesPage() {
    const [priorities, setPriorities] = useState<Priority[]>([])
    const [loading, setLoading] = useState(true)

    // Modal para editar prioridad
    const [editModal, setEditModal] = useState(false)
    const [editingPriority, setEditingPriority] = useState<Priority | null>(null)
    const [editFormData, setEditFormData] = useState({ code: '', name: '', level: '' })
    const [submitting, setSubmitting] = useState(false)

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        priority?: Priority
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
            const res = await fetch('/api/tickets/prioridades/obtener')
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error al obtener prioridades')
            }

            setPriorities(data.data || [])
        } catch (error) {
            console.error('Error cargando prioridades', error)
            setSnackbar({
                open: true,
                message: 'Error al cargar prioridades',
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
    const handleOpenEditModal = (priority: Priority) => {
        setEditingPriority(priority)
        setEditFormData({
            code: priority.code,
            name: priority.name,
            level: String(priority.level)
        })
        setEditModal(true)
    }

    // Editar prioridad
    const handleEditarPrioridad = async () => {
        if (!editingPriority) return

        // Validaciones
        if (!editFormData.code.trim()) {
            setSnackbar({
                open: true,
                message: 'El código es requerido',
                severity: 'error'
            })

            return
        }

        if (!editFormData.name.trim()) {
            setSnackbar({
                open: true,
                message: 'El nombre es requerido',
                severity: 'error'
            })

            return
        }

        if (!editFormData.level.trim() || isNaN(Number(editFormData.level))) {
            setSnackbar({
                open: true,
                message: 'El nivel es requerido y debe ser un número',
                severity: 'error'
            })

            return
        }

        try {
            setSubmitting(true)

            const res = await fetch('/api/tickets/prioridades/editar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingPriority.id,
                    code: editFormData.code,
                    name: editFormData.name,
                    level: Number(editFormData.level),
                    createdAt: editingPriority.createdAt
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error al editar prioridad')
            }

            setSnackbar({
                open: true,
                message: 'Prioridad editada con éxito',
                severity: 'success'
            })
            setEditModal(false)
            await fetchData()
        } catch (error: any) {
            console.error('Error editando prioridad:', error)
            setSnackbar({
                open: true,
                message: error.message || 'Error al editar prioridad',
                severity: 'error'
            })
        } finally {
            setSubmitting(false)
        }
    }

    // Eliminar prioridad
    const handleEliminar = async (priority: Priority) => {
        try {
            const res = await fetch(`/api/tickets/prioridades/eliminar?id=${priority.id}`, {
                method: 'DELETE'
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error al eliminar prioridad')
            }

            // Esperar un momento antes de cerrar el diálogo para que se vea el toast
            await new Promise(resolve => setTimeout(resolve, 300))

            setSnackbar({
                open: true,
                message: `Prioridad ${priority.name} eliminada con éxito`,
                severity: 'success'
            })
            await fetchData()
        } catch (error: any) {
            console.error('Error eliminando prioridad:', error)

            // Esperar un momento antes de cerrar el diálogo en caso de error
            await new Promise(resolve => setTimeout(resolve, 300))

            setSnackbar({
                open: true,
                message: error.message || 'Error al eliminar prioridad',
                severity: 'error'
            })
        }
    }

    const columns = useMemo(
        () => [
            columnHelper.accessor('code', { header: 'Código' }),
            columnHelper.accessor('name', { header: 'Nombre' }),
            columnHelper.accessor('level', { header: 'Nivel' }),
            columnHelper.display({
                id: 'acciones',
                header: 'Acciones',
                cell: ({ row }) => {
                    const priority = row.original

                    return (
                        <div className="flex gap-2 justify-center">
                            <Tooltip title="Editar">
                                <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => handleOpenEditModal(priority)}
                                >
                                    <i className="tabler-edit" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                                <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => setConfirmDialog({ open: true, priority })}
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
        data: priorities,
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
                <Typography variant="h4">Prioridades</Typography>
                <Link href="/prioridades/crear">
                    <Button variant="contained" color="primary">
                        Crear Prioridad
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <CircularProgress />
                </div>
            ) : (
                <Card>
                    <CardHeader title="Listado de Prioridades" />
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

            {/* Modal Editar Prioridad */}
            <Dialog
                open={editModal}
                onClose={() => setEditModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Editar Prioridad</DialogTitle>
                <DialogContent>
                    <Grid container spacing={4} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12 }}>
                            <CustomTextField
                                fullWidth
                                label="Código"
                                placeholder="Ej: HIGH"
                                value={editFormData.code}
                                onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                                disabled={submitting}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <CustomTextField
                                fullWidth
                                label="Nombre"
                                placeholder="Ej: Alta"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                disabled={submitting}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <CustomTextField
                                fullWidth
                                label="Nivel"
                                placeholder="Ej: 1"
                                type="number"
                                value={editFormData.level}
                                onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                                disabled={submitting}
                                required
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
                        onClick={handleEditarPrioridad}
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
                message={`¿Seguro que deseas eliminar la prioridad "${confirmDialog.priority?.name}"?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={async () => {
                    if (confirmDialog.priority) {
                        await handleEliminar(confirmDialog.priority)
                    }

                    setConfirmDialog({ open: false })
                }}
                onCancel={() => setConfirmDialog({ open: false })}
            />
        </div>
    )
}

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

import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'

type Category = {
    id: number
    code: string
    name: string
    description: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

const columnHelper = createColumnHelper<Category>()

export default function CategoriasPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    // Modal para editar categoría
    const [editModal, setEditModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [editFormData, setEditFormData] = useState({ code: '', name: '', description: '', isActive: true })
    const [submitting, setSubmitting] = useState(false)

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        category?: Category
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
            const res = await fetch('/api/tickets/categorias/obtener')
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error al obtener categorías')
            }

            setCategories(data.data || [])
        } catch (error) {
            console.error('Error cargando categorías', error)
            setSnackbar({
                open: true,
                message: 'Error al cargar categorías',
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
    const handleOpenEditModal = (category: Category) => {
        setEditingCategory(category)
        setEditFormData({
            code: category.code,
            name: category.name,
            description: category.description,
            isActive: category.isActive
        })
        setEditModal(true)
    }

    // Editar categoría
    const handleEditarCategoria = async () => {
        if (!editingCategory) return

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

        if (!editFormData.description.trim()) {
            setSnackbar({
                open: true,
                message: 'La descripción es requerida',
                severity: 'error'
            })

            return
        }

        try {
            setSubmitting(true)

            const res = await fetch('/api/tickets/categorias/editar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingCategory.id,
                    code: editFormData.code,
                    name: editFormData.name,
                    description: editFormData.description,
                    isActive: editFormData.isActive,
                    createdAt: editingCategory.createdAt
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error al editar categoría')
            }

            setSnackbar({
                open: true,
                message: 'Categoría editada con éxito',
                severity: 'success'
            })
            setEditModal(false)
            await fetchData()
        } catch (error: any) {
            console.error('Error editando categoría:', error)
            setSnackbar({
                open: true,
                message: error.message || 'Error al editar categoría',
                severity: 'error'
            })
        } finally {
            setSubmitting(false)
        }
    }

    // Eliminar categoría
    const handleEliminar = async (category: Category) => {
        try {
            const res = await fetch(`/api/tickets/categorias/eliminar?id=${category.id}`, {
                method: 'DELETE'
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error al eliminar categoría')
            }

            // Esperar un momento antes de cerrar el diálogo para que se vea el toast
            await new Promise(resolve => setTimeout(resolve, 300))

            setSnackbar({
                open: true,
                message: `Categoría ${category.name} eliminada con éxito`,
                severity: 'success'
            })
            await fetchData()
        } catch (error: any) {
            console.error('Error eliminando categoría:', error)

            // Esperar un momento antes de cerrar el diálogo en caso de error
            await new Promise(resolve => setTimeout(resolve, 300))

            setSnackbar({
                open: true,
                message: error.message || 'Error al eliminar categoría',
                severity: 'error'
            })
        }
    }

    const columns = useMemo(
        () => [
            columnHelper.accessor('code', { header: 'Código' }),
            columnHelper.accessor('name', { header: 'Nombre' }),
            columnHelper.accessor('description', {
                header: 'Descripción',
                cell: info => info.getValue() || '-'
            }),
            columnHelper.accessor('isActive', {
                header: 'Estado',
                cell: info => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {info.getValue() ? 'Activo' : 'Inactivo'}
                    </span>
                )
            }),
            columnHelper.display({
                id: 'acciones',
                header: 'Acciones',
                cell: ({ row }) => {
                    const category = row.original

                    return (
                        <div className="flex gap-2 justify-center">
                            <Tooltip title="Editar">
                                <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => handleOpenEditModal(category)}
                                >
                                    <i className="tabler-edit" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                                <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => setConfirmDialog({ open: true, category })}
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
        data: categories,
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
                <Typography variant="h4">Categorías</Typography>
                <Link href="/categorias/crear">
                    <Button variant="contained" color="primary">
                        Crear Categoría
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <CircularProgress />
                </div>
            ) : (
                <Card>
                    <CardHeader title="Listado de Categorías" />
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

            {/* Modal Editar Categoría */}
            <Dialog
                open={editModal}
                onClose={() => setEditModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Editar Categoría</DialogTitle>
                <DialogContent>
                    <Grid container spacing={4} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12 }}>
                            <CustomTextField
                                fullWidth
                                label="Código"
                                placeholder="Ej: TECH"
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
                                placeholder="Ej: Técnico"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                disabled={submitting}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <CustomTextField
                                fullWidth
                                label="Descripción"
                                placeholder="Ej: Problemas técnicos y de infraestructura"
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                disabled={submitting}
                                multiline
                                rows={3}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editFormData.isActive}
                                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                                        disabled={submitting}
                                    />
                                }
                                label="Categoría activa"
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
                        onClick={handleEditarCategoria}
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
                message={`¿Seguro que deseas eliminar la categoría "${confirmDialog.category?.name}"?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={async () => {
                    if (confirmDialog.category) {
                        await handleEliminar(confirmDialog.category)
                    }

                    setConfirmDialog({ open: false })
                }}
                onCancel={() => setConfirmDialog({ open: false })}
            />
        </div>
    )
}

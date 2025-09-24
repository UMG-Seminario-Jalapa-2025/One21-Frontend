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
import styles from '@core/styles/table.module.css'

// Custom hook
import { useLoading } from '@/components/ui/LoadingModal'

import { showAlert } from "@/components/ui/AlertProvider"

import ConfirmDialog from '@/components/ui/ConfirmDialog'

type Persona = {
  id: number
  code: string
  name: string
  taxId: string
  email: string
  isActive: boolean
  isCustomer: boolean
  isVendor: boolean
  isEmployee: boolean
  notes: string | null
  createdBy: number
  updatedBy: number
  createdAt: string
  updatedAt: string
}

const columnHelper = createColumnHelper<Persona>()

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    persona?: Persona
  }>({ open: false })

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const { esperar, finEspera } = useLoading()

  const fetchData = async () => {
    try {
      esperar()
      const res = await fetch('/api/personas/obtener')
      const data: Persona[] = await res.json()

      setPersonas(data)
      finEspera()
    } catch (error) {
      console.error('Error cargando personas', error)
      finEspera()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Crear usuario desde la fila
  const handleCrearUsuario = async (persona: Persona) => {
    try {
      esperar()

      const payload = {
        username: persona.code,
        email: persona.email,
        partnerId: persona.id
      }

      const res = await fetch('/api/personas/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data?.message || 'Error al crear usuario')

      showAlert('success', 'Usuario creado con éxito')
      await fetchData()
    } catch (error: any) {
      console.error('Error creando usuario:', error)
      setSnackbar({ open: true, message: error.message || 'Error al crear usuario', severity: 'error' })
    } finally {
      finEspera()
    }
  }

  // Método genérico para actualizar partner
  const handleActualizarPartner = async (payload: Record<string, any>) => {
    try {
      esperar()

      const res = await fetch('/api/personas/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data?.message || 'Error al actualizar partner')

      showAlert('success', 'Partner actualizado con éxito')
      await fetchData()
    } catch (error: any) {
      console.error('Error actualizando partner:', error)
      setSnackbar({ open: true, message: error.message || 'Error al actualizar partner', severity: 'error' })
    } finally {
      finEspera()
    }
  }

  // Hacer empleado
  const handleHacerEmpleado = (persona: Persona) => {
    handleActualizarPartner({ partnerId: persona.id, isEmployee: true })
  }

  // Hacer proveedor
  const handleHacerProveedor = (persona: Persona) => {
    handleActualizarPartner({ partnerId: persona.id, isVendor: true })
  }

  // Eliminar persona
  const handleEliminar = async (persona: Persona) => {
    try {
      esperar()

      const res = await fetch(`/api/personas/eliminar?id=${persona.id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (!res.ok) {
        showAlert('error', data?.message || 'Error al eliminar persona')
        throw new Error(data.message || 'Error al eliminar persona')
      }

      showAlert('success', `Persona ${persona.name} eliminada con éxito`)
      await fetchData()
    } catch (error: any) {
      console.error('Error eliminando persona:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Error al eliminar persona',
        severity: 'error'
      })
    } finally {
      finEspera()
    }
  }



  const columns = useMemo(
    () => [
      columnHelper.accessor('code', { header: 'Código' }),
      columnHelper.accessor('name', { header: 'Nombre' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('isActive', {
        header: 'Activo',
        cell: info => (info.getValue() ? 'Sí' : 'No')
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const persona = row.original

          return (
            <div className="flex gap-2 justify-center">
              {!persona.isCustomer && (
                <Tooltip title="Hacer usuario">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleCrearUsuario(persona)}
                  >
                    <i className="tabler-user-plus" />
                  </IconButton>
                </Tooltip>
              )}

              {persona.isCustomer && !persona.isVendor && !persona.isEmployee && (
                <>
                  <Tooltip title="Hacer empleado">
                    <IconButton
                      color="success"
                      size="small"
                      onClick={() => handleHacerEmpleado(persona)}
                    >
                      <i className="tabler-user-share" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Hacer proveedor">
                    <IconButton
                      color="warning"
                      size="small"
                      onClick={() => handleHacerProveedor(persona)}
                    >
                      <i className="tabler-users-group" />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Tooltip title="Editar">
                <IconButton color="info" size="small">
                  <i className="tabler-edit" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton color="error" size="small" onClick={() => setConfirmDialog({ open: true, persona })}>
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
    data: personas,
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
        <Typography variant="h4">Personas</Typography>
        <Link href="/personas/crear">
          <Button variant="contained" color="primary">
            Crear Persona
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <CircularProgress />
        </div>
      ) : (
        <Card>
          <CardHeader title="Listado de Personas" />
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

      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmar eliminación"
        message={`¿Seguro que deseas eliminar a "${confirmDialog.persona?.name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          if (confirmDialog.persona) {
            handleEliminar(confirmDialog.persona)
          }

          setConfirmDialog({ open: false })
        }}
        onCancel={() => setConfirmDialog({ open: false })}
      />

    </div>
  )
}

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/personas/obtener')
        const data: Persona[] = await res.json()

        setPersonas(data)
      } catch (error) {
        console.error('Error cargando personas', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
        cell: () => (
          <div className="flex gap-2 justify-center">
            <Tooltip title="Hacer empleado">
              <IconButton color="success" size="small">
                <i className="tabler-user-share" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Hacer proveedor">
              <IconButton color="warning" size="small">
                <i className="tabler-users-group" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton color="info" size="small">
                <i className="tabler-edit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton color="error" size="small">
                <i className="tabler-trash-off" />
              </IconButton>
            </Tooltip>
          </div>
        )
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
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
    </div>
  )
}

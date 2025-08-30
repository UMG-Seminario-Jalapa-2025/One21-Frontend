'use client'

import React, { useMemo, useState } from 'react'


import type { ColumnDef } from '../../../components/datagrid/DataGrid'
import DataGrid from '../../../components/datagrid/DataGrid'
import SearchBar from '../../../components/datagrid/SearchBar'
import PageSizer from '../../../components/datagrid/Pagesizer'
import StatusSwitch from '../../../components/datagrid/StatusSwitch'
import RowActions from '../../../components/datagrid/RowActions'
import Modal from '../../../components/ui/Modal'
import EmployeeForm from '../../../components/forms/EmployeeForm'
import type { EmpleadoInput } from '../../../components/forms/EmployeeForm'
import ConfirmDialog from '../../../components/ui/ConfirmDialog' // 👈 nuevo

import empleadosData from '../../../data/empleados.json'

type Empleado = {
  id: number
  nombre: string
  email: string
  telefono: string
  fecha: string
  activo: boolean
}

export default function Page() {
  const [data, setData] = useState<Empleado[]>(empleadosData as Empleado[])
  const [query, setQuery] = useState('')
  const [pageSize, setPageSize] = useState(10)

  // modal add/edit
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Empleado | null>(null)

  // confirm delete
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; row?: Empleado }>({ open: false })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return data

    return data.filter(
      r =>
        r.nombre.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.telefono.toLowerCase().includes(q)
    )
  }, [query, data])

  const nextId = () => (data.length ? Math.max(...data.map(d => d.id)) + 1 : 1)

  const handleAdd = () => { setEditing(null); setOpen(true) }
  const handleEdit = (row: Empleado) => { setEditing(row); setOpen(true) }

  // 👉 abre confirm dialog
  const askDelete = (row: Empleado) => setConfirmDel({ open: true, row })

  // 👉 acción real al confirmar
  const confirmDelete = () => {
    if (!confirmDel.row) return
    setData(prev => prev.filter(r => r.id !== confirmDel.row!.id))
    setConfirmDel({ open: false })
  }

  const handleSubmit = (values: EmpleadoInput) => {
    if (editing) {
      setData(prev => prev.map(r => (r.id === editing.id ? { ...editing, ...values, id: editing.id } : r)))
    } else {
      const nuevo: Empleado = { ...(values as Empleado), id: nextId() }

      setData(prev => [...prev, nuevo])
    }

    setOpen(false)
  }

  const columns = useMemo<ColumnDef<Empleado>[]>(() => [
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Correo Electrónico' },
    { key: 'telefono', header: 'Teléfono' },
    {
      key: 'fecha',
      header: 'Fecha',
      render: row => {
        const d = new Date(row.fecha)

        return isNaN(+d) ? row.fecha : d.toLocaleDateString()
      }
    },
    {
      key: 'activo',
      header: 'Estado',
      render: row => (
        <StatusSwitch
          checked={row.activo}
          onChange={value =>
            setData(prev => prev.map(r => (r.id === row.id ? { ...r, activo: value } : r)))
          }
        />
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: row => (
        <RowActions
          onEdit={() => handleEdit(row)}
          onDelete={() => askDelete(row)}   // 👈 usa diálogo
        />
      )
    }
  ], [setData])

  return (
      <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Empleados</h1>
        <button
          onClick={handleAdd}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
        >
          + Agregar empleado
        </button>
      </div>

      {/* Toolbar */}
      <div className='flex items-center justify-between gap-4'>
        <SearchBar value={query} onChange={setQuery} placeholder='Buscar...' />
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <span>Mostrar</span>
          <PageSizer value={pageSize} onChange={setPageSize} />
          <span>entradas</span>
        </div>
      </div>

      {/* DataGrid */}
      <DataGrid
        columns={columns}
        rows={filtered.slice(0, pageSize)}
        emptyMessage='No hay empleados para mostrar.'
      />

      {/* Modal Add/Edit */}
      <Modal
        open={open}
        title={editing ? 'Editar empleado' : 'Agregar empleado'}
        onClose={() => setOpen(false)}
      >
        <EmployeeForm
          initial={
            editing ?? {
              nombre: '',
              email: '',
              telefono: '',
              fecha: new Date().toISOString().slice(0, 10),
              activo: true
            }
          }
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDel.open}
        title="Eliminar empleado"
        message={
          <>¿Estás seguro de eliminar a <b>{confirmDel.row?.nombre}</b>?</>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDel({ open: false })}
      />
      </div>



  )
}

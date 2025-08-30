'use client'

import React, { useState } from 'react'

export type EmpleadoInput = {
  id?: number
  nombre: string
  email: string
  telefono: string
  fecha: string // yyyy-mm-dd o ISO
  activo: boolean
}

export default function EmployeeForm({
  initial,
  onSubmit,
  onCancel
}: {
  initial: EmpleadoInput
  onSubmit: (values: EmpleadoInput) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<EmpleadoInput>(initial)
  const [errors, setErrors] = useState<{ [k in keyof EmpleadoInput]?: string }>({})

  const handle = (k: keyof EmpleadoInput, v: any) => setValues(prev => ({ ...prev, [k]: v }))

  const validate = () => {
    const e: typeof errors = {}

    if (!values.nombre.trim()) e.nombre = 'Requerido'
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Correo inválido'
    if (!values.telefono.trim()) e.telefono = 'Requerido'
    if (!values.fecha.trim()) e.fecha = 'Requerido'
    setErrors(e)

    return Object.keys(e).length === 0
  }

  return (
    <form
      onSubmit={ev => {
        ev.preventDefault()
        if (validate()) onSubmit(values)
      }}
      className='space-y-3'
    >
      <div>
        <label className='block text-sm font-medium'>Nombre</label>
        <input
          className='mt-1 w-full rounded border border-gray-300 px-3 py-2'
          value={values.nombre}
          onChange={e => handle('nombre', e.target.value)}
          placeholder='John Doe'
        />
        {errors.nombre && <p className='text-xs text-red-600'>{errors.nombre}</p>}
      </div>

      <div>
        <label className='block text-sm font-medium'>Correo</label>
        <input
          type='email'
          className='mt-1 w-full rounded border border-gray-300 px-3 py-2'
          value={values.email}
          onChange={e => handle('email', e.target.value)}
          placeholder='john@example.com'
        />
        {errors.email && <p className='text-xs text-red-600'>{errors.email}</p>}
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium'>Teléfono</label>
          <input
            className='mt-1 w-full rounded border border-gray-300 px-3 py-2'
            value={values.telefono}
            onChange={e => handle('telefono', e.target.value)}
            placeholder='123-456-7890'
          />
          {errors.telefono && <p className='text-xs text-red-600'>{errors.telefono}</p>}
        </div>
        <div>
          <label className='block text-sm font-medium'>Fecha</label>
          <input
            type='date'
            className='mt-1 w-full rounded border border-gray-300 px-3 py-2'
            value={values.fecha.slice(0, 10)}
            onChange={e => handle('fecha', e.target.value)}
          />
          {errors.fecha && <p className='text-xs text-red-600'>{errors.fecha}</p>}
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <input
          id='activo'
          type='checkbox'
          checked={values.activo}
          onChange={e => handle('activo', e.target.checked)}
          className='h-4 w-4'
        />
        <label htmlFor='activo' className='text-sm'>
          Activo
        </label>
      </div>

      <div className='flex justify-end gap-2 pt-2'>
        <button type='button' onClick={onCancel} className='rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200'>
          Cancelar
        </button>
        <button type='submit' className='rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700'>
          Guardar
        </button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Custom components
import CustomTextField from '@core/components/mui/TextField'

export default function CreateDepartmentPage() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    isActive: true
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim()) {
      setSnackbar({ open: true, message: 'Todos los campos son obligatorios', severity: 'error' })

      return
    }

    try {
      // ✅ Payload en formato que espera el backend
      const payload = {
        code: formData.code,
        name: formData.name,
        isActive: formData.isActive
      }

      const res = await fetch('/api/employee_departments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Error al crear departamento')

      setSnackbar({
        open: true,
        message: 'Departamento creado con éxito',
        severity: 'success'
      })

      setTimeout(() => router.push('/employee_departaments'), 1500)
    } catch (err) {
      console.error('❌ Error creando departamento:', err)
      setSnackbar({
        open: true,
        message: 'Error al crear departamento',
        severity: 'error'
      })
    }
  }

  return (
    <div className='p-6'>
      <Typography variant='h4' gutterBottom>
        Crear Departamento
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <CustomTextField
              label='Código'
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
            />

            <CustomTextField
              label='Nombre'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label='Activo'
            />

            <div className='flex justify-end gap-2'>
              <Button onClick={() => router.push('/employee_departaments')} variant='outlined' color='error'>
                Cancelar
              </Button>
              <Button type='submit' variant='contained' color='primary'>
                Guardar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  )
}
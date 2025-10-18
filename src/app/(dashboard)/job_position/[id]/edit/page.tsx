'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

// MUI
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Componentes personalizados
import CustomTextField from '@core/components/mui/TextField'

export default function EditJobPositionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    is_active: true
  })

  const [loading, setLoading] = useState(true)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // 🔹 Obtener datos del puesto
  useEffect(() => {
    const fetchJobPosition = async () => {
      try {
        const res = await fetch(`/api/employee_positions/${id}`)

        if (!res.ok) throw new Error('Error al obtener puesto')

        const data = await res.json()

        setFormData({
          code: data.code || '',
          name: data.name || '',
          description: data.description || '',
          is_active: data.is_active === true || data.is_active === 1 || data.isActive === true || data.isActive === 1
        })
      } catch (err) {
        console.error('❌ Error cargando puesto:', err)
        setSnackbar({ open: true, message: 'Error al cargar datos', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchJobPosition()
  }, [id])

  // 🔹 Actualizar puesto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim() || !formData.description.trim()) {
      setSnackbar({ open: true, message: 'Todos los campos son obligatorios', severity: 'error' })

      return
    }

    try {
      const payload = {
        id: Number(id),
        code: formData.code,
        name: formData.name,
        description: formData.description,
        isActive: formData.is_active ? 1 : 0
      }

      const res = await fetch(`/api/employee_positions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Error al actualizar puesto')

      setSnackbar({ open: true, message: 'Puesto actualizado con éxito', severity: 'success' })

      setTimeout(() => router.push('/job_position'), 1200)
    } catch (err) {
      console.error('❌ Error actualizando puesto:', err)
      setSnackbar({ open: true, message: 'Error al actualizar puesto', severity: 'error' })
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-40'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className='p-6'>
      <Typography variant='h4' gutterBottom>
        Editar Puesto
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

            <CustomTextField
              label='Descripción'
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label='Activo'
            />

            <div className='flex justify-end gap-2'>
              <Button onClick={() => router.push('/job_position')} variant='outlined' color='error'>
                Cancelar
              </Button>
              <Button type='submit' variant='contained' color='primary'>
                Actualizar
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

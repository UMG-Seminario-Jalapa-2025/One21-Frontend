'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import CustomTextField from '@core/components/mui/TextField'

export default function CreateJobPositionPage() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    is_active: true
  })

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim() || !formData.description.trim()) {
      setSnackbar({ open: true, message: 'Todos los campos son obligatorios', severity: 'error' })

      return
    }

    try {
      const res = await fetch('/api/job_positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al crear puesto')

      setSnackbar({ open: true, message: 'Puesto creado con éxito', severity: 'success' })
      setTimeout(() => router.push('/job_position'), 1500)
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al crear puesto', severity: 'error' })
    }
  }

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>Crear Puesto</Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CustomTextField
              label="Código"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
            />
            <CustomTextField
              label="Nombre"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <CustomTextField
              label="Descripción"
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
              label="Activo"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => router.push('/job_position')} variant="outlined" color="error">Cancelar</Button>
              <Button type="submit" variant="contained" color="primary">Guardar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  )
}

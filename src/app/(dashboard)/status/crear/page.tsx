'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

import CustomTextField from '@core/components/mui/TextField'

export default function CrearStatusPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    isFinal: false, // por defecto no final
    isActive: true // por defecto activo
  })

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleCancel = () => {
    router.push('/status') // ajusta si tu listado vive en otra ruta
  }

  const handleSave = async () => {
    // Validaciones mínimas (igual que categorías)
    if (!formData.code.trim()) {
      setSnackbar({ open: true, message: 'El código es requerido', severity: 'error' })

      return
    }

    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'El nombre es requerido', severity: 'error' })

      return
    }

    try {
      setSubmitting(true)

      const res = await fetch('/api/tickets/status/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al crear estado')
      }

      setSnackbar({ open: true, message: 'Estado creado con éxito', severity: 'success' })

      // pequeño delay para mostrar el toast
      setTimeout(() => {
        router.push('/status') // ajusta si tu listado vive en otra ruta
      }, 1500)
    } catch (error: any) {
      console.error('Error creando estado:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Error al crear estado',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='p-6'>
      <Typography variant='h4' gutterBottom>
        Crear Estado
      </Typography>

      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Información del Estado
          </Typography>

          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Código'
                placeholder='Ej: OPEN'
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                disabled={submitting}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Nombre'
                placeholder='Ej: Abierto'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFinal}
                    onChange={e => setFormData({ ...formData, isFinal: e.target.checked })}
                    disabled={submitting}
                  />
                }
                label='¿Es estado final?'
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={submitting}
                  />
                }
                label='Estado activo'
              />
            </Grid>

            <Grid size={{ xs: 12 }} className='flex justify-between'>
              <Button variant='outlined' color='error' onClick={handleCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button variant='contained' onClick={handleSave} disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Toast */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

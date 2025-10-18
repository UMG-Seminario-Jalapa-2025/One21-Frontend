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

export default function CreateCountryPage() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone_code: '',
    is_active: true
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim() || !formData.phone_code.trim()) {
      setSnackbar({ open: true, message: 'Todos los campos son obligatorios', severity: 'error' })

      return
    }

    // Validación adicional: código telefónico solo numérico
    if (!/^[0-9]+$/.test(formData.phone_code)) {
      setSnackbar({ open: true, message: 'El código telefónico solo puede contener números', severity: 'error' })

      return
    }

    try {
      const res = await fetch('/api/business-partner/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al crear país')

      setSnackbar({ open: true, message: 'País creado con éxito', severity: 'success' })
      setTimeout(() => router.push('/countries'), 1500)
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al crear país', severity: 'error' })
    }
  }

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>Crear País</Typography>
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
              label="Código telefónico"
              value={formData.phone_code}
              onChange={e => {
                // Elimina todo lo que no sea número
                const numericValue = e.target.value.replace(/\D/g, '')

                setFormData({ ...formData, phone_code: numericValue })
              }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
              <Button onClick={() => router.push('/countries')} variant="outlined" color="error">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Guardar
              </Button>
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

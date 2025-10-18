'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'

type Country = { id: number; name: string }

export default function CreateDepartmentPage() {
  const [formData, setFormData] = useState({
    country_id: 0,
    name: '',
    is_active: true
  })

  const [countries, setCountries] = useState<Country[]>([])

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  const router = useRouter()

  useEffect(() => {
    // Cargar países para el select
    const loadCountries = async () => {
      try {
        const res = await fetch('/api/business-partner/countries/obtener')

        if (!res.ok) throw new Error('Error al obtener países')
        const data = await res.json()

        setCountries(data || [])
      } catch (err) {
        console.error(err)
        setSnackbar({ open: true, message: 'Error al cargar países', severity: 'error' })
      }
    }

    loadCountries()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      country_id: Number(formData.country_id),
      is_active: formData.is_active
    }

    console.log('Enviando al backend:', payload)
    console.log('formData.is_active tipo:', typeof formData.is_active, 'valor:', formData.is_active)

    try {
      const res = await fetch('/api/business-partner/departaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const responseData = await res.json()

      console.log('Respuesta del servidor:', responseData)

      if (!res.ok) throw new Error('Error al crear departamento')

      setSnackbar({ open: true, message: 'Departamento creado con éxito', severity: 'success' })
      setTimeout(() => router.push('/departments'), 1000)
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al crear departamento', severity: 'error' })
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
              select
              label='País'
              value={formData.country_id}
              onChange={e => setFormData({ ...formData, country_id: Number(e.target.value) })}
              required
            >
              <MenuItem value={0} disabled>
                Seleccione un país
              </MenuItem>
              {countries.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomTextField
              label='Nombre del departamento'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={e => {
                    const newValue = e.target.checked

                    console.log('Switch cambiado a:', newValue)
                    setFormData({ ...formData, is_active: newValue })
                  }}
                />
              }
              label={`Activo (${formData.is_active ? 'Sí' : 'No'})`}
            />

            <div className='flex justify-end gap-2'>
              <Button onClick={() => router.push('/departments')} variant='outlined' color='error'>
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

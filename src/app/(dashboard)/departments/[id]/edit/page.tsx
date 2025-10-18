'use client'

import { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

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

export default function EditDepartmentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [formData, setFormData] = useState({
    country_id: '',
    name: '',
    is_active: true
  })

  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar países
        const countriesRes = await fetch('/api/business-partner/countries/obtener')

        if (!countriesRes.ok) throw new Error('Error al obtener países')
        const countriesData = await countriesRes.json()

        setCountries(countriesData || [])

        // Cargar departamento específico
        const deptRes = await fetch(`/api/business-partner/departaments/${id}`)

        if (!deptRes.ok) throw new Error('Error al obtener departamento')
        const deptData = await deptRes.json()

        // Poblar el formulario con los datos del departamento
        setFormData({
          country_id: String(deptData.country_id || deptData.countryId || deptData.country?.id || ''),
          name: deptData.name || '',
          is_active: Boolean(deptData.isActive) //
        })

        setLoading(false)
      } catch (err) {
        console.error(err)
        setSnackbar({ open: true, message: 'Error al cargar datos', severity: 'error' })
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.name.trim()) {
      return setSnackbar({ open: true, message: 'El nombre es requerido', severity: 'error' })
    }

    if (!formData.country_id || formData.country_id === '') {
      return setSnackbar({ open: true, message: 'Seleccione un país', severity: 'error' })
    }

    try {
      //Agrega el console.log aquí
      console.log('Datos a enviar:', {
        ...formData,
        country_id: Number(formData.country_id)
      })

      const res = await fetch(`/api/business-partner/departaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          country_id: Number(formData.country_id)
        })
      })

      const text = await res.text()
      let payload: any = {}

      try {
        payload = text ? JSON.parse(text) : {}
      } catch {
        payload = { raw: text }
      }

      if (!res.ok) {
        const msg = payload?.message || payload?.raw || 'Error al actualizar departamento'

        setSnackbar({ open: true, message: msg, severity: 'error' })

        return
      }

      setSnackbar({ open: true, message: 'Departamento actualizado con éxito', severity: 'success' })
      setTimeout(() => router.push('/departments'), 1500)
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al actualizar departamento', severity: 'error' })
    }
  }

  if (loading) {
    return (
      <div className='p-6'>
        <Typography>Cargando...</Typography>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <Typography variant='h4' gutterBottom>
        Editar Departamento
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <CustomTextField
              select
              label='País'
              value={formData.country_id}
              onChange={e => setFormData({ ...formData, country_id: e.target.value })}
              required
              helperText={formData.country_id ? '' : 'Seleccione un país'}
            >
              <MenuItem value='' disabled>
                Seleccione un país
              </MenuItem>
              {countries.map(c => (
                <MenuItem key={c.id} value={String(c.id)}>
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
                  checked={Boolean(formData.is_active)}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label='Activo'
            />

            <div className='flex justify-end gap-2'>
              <Button onClick={() => router.push('/departments')} variant='outlined' color='error'>
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

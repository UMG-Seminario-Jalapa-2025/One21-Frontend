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

type Department = { id: number; name: string }

export default function CreateMunicipalityPage() {
  const [formData, setFormData] = useState({ departments_id: 0, name: '', is_active: true })
  const [departments, setDepartments] = useState<Department[]>([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const router = useRouter()

  useEffect(() => {
    const loadDeps = async () => {
      try {
        const res = await fetch('/api/business-partner/departaments/obtener')

        if (!res.ok) throw new Error('Error al obtener departamentos')
        const data = await res.json()

        setDepartments(data || [])
      } catch (err) {
        console.error(err)
        setSnackbar({ open: true, message: 'Error al cargar departamentos', severity: 'error' })
      }
    }

    loadDeps()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📤 Enviando:', {
      name: formData.name,
      departments_id: Number(formData.departments_id),
      is_active: formData.is_active
    })

    // Validaciones mínimas
    if (!formData.name.trim()) {
      return setSnackbar({ open: true, message: 'El nombre es requerido', severity: 'error' })
    }

    if (!formData.departments_id || Number(formData.departments_id) <= 0) {
      return setSnackbar({ open: true, message: 'Seleccione un departamento', severity: 'error' })
    }

    try {
      const res = await fetch('/api/business-partner/municipality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          departments_id: Number(formData.departments_id) // el API route lo transforma
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
        const msg =
          payload?.message ||
          payload?.raw ||
          (res.status === 409
            ? 'Ya existe un municipio con ese nombre en ese departamento'
            : `Error al crear municipio (HTTP ${res.status})`)

        setSnackbar({ open: true, message: msg, severity: 'error' })

        return
      }

      setSnackbar({ open: true, message: 'Municipio creado con éxito', severity: 'success' })
      setTimeout(() => router.push('/municipalities'), 1500)
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al crear municipio', severity: 'error' })
    }
  }

  return (
    <div className='p-6'>
      <Typography variant='h4' gutterBottom>
        Crear Municipio
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <CustomTextField
              select
              label='Departamento'
              value={formData.departments_id}
              onChange={e => setFormData({ ...formData, departments_id: Number(e.target.value) })}
            >
              <MenuItem value={0} disabled>
                Seleccione un departamento
              </MenuItem>
              {departments.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomTextField
              label='Nombre del municipio'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
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
              <Button onClick={() => router.push('/municipalities')} variant='outlined' color='error'>
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

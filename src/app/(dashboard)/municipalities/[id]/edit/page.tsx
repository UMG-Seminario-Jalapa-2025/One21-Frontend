'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'

type Department = { id: number; name: string }

export default function EditMunicipalityPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<{
    name: string
    isActive: boolean
    departments_id: number | ''
  }>({
    name: '',
    isActive: true,
    departments_id: ''
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Carga detalle + departamentos
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        const [munRes, depRes] = await Promise.all([
          fetch(`/api/business-partner/municipality/${id}`),
          fetch('/api/business-partner/departaments/obtener')
        ])

        const mun = await munRes.json()
        const deps: Department[] = await depRes.json()

        console.log(' Datos RAW del municipio:', mun)
        console.log(' Departamentos disponibles:', deps)

        setDepartments(deps || [])

        const extractedDeptId =
          mun?.departments?.id ?? mun?.department?.id ?? mun?.departments_id ?? mun?.department_id ?? ''

        console.log('departments_id extraído:', extractedDeptId)

        setFormData({
          name: mun?.name ?? '',
          isActive: (mun?.isActive ?? mun?.is_active) !== false,
          departments_id: extractedDeptId
        })

        console.log('FormData inicial:', {
          name: mun?.name ?? '',
          isActive: (mun?.isActive ?? mun?.is_active) !== false,
          departments_id: extractedDeptId
        })
      } catch (e) {
        console.error('Error cargando municipio/departamentos', e)
        setSnackbar({ open: true, message: 'Error al cargar datos', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }

    if (id) load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'Ingrese un nombre', severity: 'error' })

      return
    }

    if (!formData.departments_id) {
      setSnackbar({ open: true, message: 'Seleccione un departamento', severity: 'error' })

      return
    }

    try {
      setSaving(true)

      const bodyToSend = {
        name: formData.name.trim(),
        isActive: formData.isActive,
        departments_id: Number(formData.departments_id)
      }

      console.log('Body a enviar al API:', bodyToSend)
      console.log('departments_id tipo:', typeof bodyToSend.departments_id, 'valor:', bodyToSend.departments_id)

      const res = await fetch(`/api/business-partner/municipality/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend)
      })

      console.log(' Response status:', res.status)

      const payloadText = await res.text()

      console.log('Response text:', payloadText)

      let payload: any = {}

      try {
        payload = payloadText ? JSON.parse(payloadText) : {}
      } catch {
        payload = { raw: payloadText }
      }

      console.log('Response parsed:', payload)

      if (!res.ok) {
        console.error('Update municipality failed:', res.status, payload)
        const msg = payload?.message || payload?.raw || `Error al actualizar municipio (HTTP ${res.status})`

        throw new Error(msg)
      }

      setSnackbar({ open: true, message: 'Municipio actualizado con éxito', severity: 'success' })
      setTimeout(() => router.push('/municipalities'), 1200)
    } catch (err: any) {
      console.error('Error en handleSubmit:', err)
      setSnackbar({ open: true, message: err?.message || 'Error al actualizar municipio', severity: 'error' })
    } finally {
      setSaving(false)
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
        Editar Municipio
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <CustomTextField
              label='Nombre'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            <CustomTextField
              select
              label='Departamento'
              value={formData.departments_id}
              onChange={e => setFormData({ ...formData, departments_id: Number(e.target.value) })}
            >
              <MenuItem value='' disabled>
                Seleccione un departamento
              </MenuItem>
              {departments.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </CustomTextField>

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
              <Button onClick={() => router.push('/municipalities')} variant='outlined' color='error'>
                Cancelar
              </Button>
              <Button type='submit' variant='contained' color='primary' disabled={saving}>
                {saving ? 'Guardando…' : 'Actualizar'}
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

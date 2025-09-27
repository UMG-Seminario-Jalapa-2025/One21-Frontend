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

import CustomTextField from '@core/components/mui/TextField'

export default function EditDepartmentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    is_active: true
  })

  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await fetch(`/api/departamentos/${id}`)

        if (!res.ok) throw new Error('Error al obtener departamento')

        const data = await res.json()

        setFormData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchDepartment()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim()) {
      setSnackbar({ open: true, message: 'Todos los campos son obligatorios', severity: 'error' })
      
      return
    }

    try {
      const res = await fetch(`/api/departamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al actualizar departamento')

      setSnackbar({ open: true, message: 'Departamento actualizado con éxito', severity: 'success' })
      setTimeout(() => router.push('/employee_departaments'), 1000)
    } catch (err) {
      console.error(err)
      setSnackbar({ open: true, message: 'Error al actualizar departamento', severity: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>Editar Departamento</Typography>
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
              <Button onClick={() => router.push('/employee_departaments')} variant="outlined" color="error">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Actualizar
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

'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import type { SelectChangeEvent } from '@mui/material/Select'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

const Alert = MuiAlert

const CreateTicket = () => {
  const router = useRouter() // ✅ para redirigir después de crear el ticket

  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority_id: '',
    category_id: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    sla_due_at: ''
  })

  const [errors, setErrors] = useState<{ contact_email?: string; contact_phone?: string }>({})
  const [prioridades, setPrioridades] = useState<{ id: number; name: string }[]>([])
  const [categorias, setCategorias] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    const fetchPrioridades = async () => {
      try {
        const res = await fetch('/api/tickets/prioridades/obtener')
        const data = await res.json()

        setPrioridades(data?.data || [])
      } catch (error) {
        console.error('Error al obtener prioridades:', error)
      }
    }

    const fetchCategorias = async () => {
      try {
        const res = await fetch('/api/tickets/categorias/obtener')
        const data = await res.json()

        setCategorias(data?.data || [])
      } catch (error) {
        console.error('Error al obtener categorías:', error)
      }
    }

    fetchPrioridades()
    fetchCategorias()
  }, [])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPhone = (phone: string) => /^[0-9]{8,15}$/.test(phone)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'contact_phone') {
      const numericValue = value.replace(/\D/g, '')

      setForm(prev => ({ ...prev, [name]: numericValue }))

      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target

    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: typeof errors = {}

    if (!isValidEmail(form.contact_email)) newErrors.contact_email = 'Ingrese un correo electrónico válido.'

    if (!isValidPhone(form.contact_phone)) newErrors.contact_phone = 'Ingrese solo números válidos (8-15 dígitos).'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSnackbar({
        open: true,
        message: 'Revise los campos marcados antes de continuar.',
        severity: 'error'
      })

      return
    }

    setErrors({})
    setLoading(true)

    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        category: { id: Number(form.category_id) },
        priority: { id: Number(form.priority_id) },
        status: { id: 1 },
        contactName: form.contact_name,
        contactEmail: form.contact_email,
        contactPhone: form.contact_phone,
        sla_due_at: form.sla_due_at ? new Date(form.sla_due_at) : null
      }

      const res = await fetch('/api/tickets/ticket/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setSnackbar({
          open: true,
          message: 'Ticket creado con éxito',
          severity: 'success'
        })

        // 🟢 Limpia el formulario
        setForm({
          subject: '',
          description: '',
          priority_id: '',
          category_id: '',
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          sla_due_at: ''
        })

        // ⏳ Espera 1 segundo para mostrar el snackbar y luego redirige
        setTimeout(() => {
          router.push('/ticket/ver-cliente') // 🚀 Redirección automática
        }, 1000)
      } else {
        setSnackbar({
          open: true,
          message: 'Error al crear el ticket',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error)
      setSnackbar({
        open: true,
        message: 'Error de conexión con el servidor',
        severity: 'error'
      })
    }

    setLoading(false)
  }

  return (
    <>
      <Card>
        <CardHeader title='Crear Ticket' />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Asunto'
                  name='subject'
                  value={form.subject}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id='prioridad-label'>Prioridad</InputLabel>
                  <Select
                    labelId='prioridad-label'
                    label='Prioridad'
                    name='priority_id'
                    value={form.priority_id}
                    onChange={handleSelectChange}
                  >
                    {prioridades.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id='categoria-label'>Categoría</InputLabel>
                  <Select
                    labelId='categoria-label'
                    label='Categoría'
                    name='category_id'
                    value={form.category_id}
                    onChange={handleSelectChange}
                  >
                    {categorias.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label='Nombre de contacto'
                  name='contact_name'
                  value={form.contact_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label='Email de contacto'
                  name='contact_email'
                  value={form.contact_email}
                  onChange={handleChange}
                  fullWidth
                  required
                  type='email'
                  error={!!errors.contact_email}
                  helperText={errors.contact_email}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label='Teléfono de contacto'
                  name='contact_phone'
                  value={form.contact_phone}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.contact_phone}
                  helperText={errors.contact_phone}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label='Fecha del ticket'
                  name='sla_due_at'
                  type='date'
                  value={form.sla_due_at}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='Descripción'
                  name='description'
                  value={form.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button type='submit' variant='contained' color='primary' disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Ticket'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default CreateTicket

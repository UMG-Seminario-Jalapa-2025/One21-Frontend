'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'


const CreateTicket = () => {
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority_id: '',
    category_id: '',
    contact_name: '',
    contact_email: '',
    contact_phone: ''
  })

  const [prioridades, setPrioridades] = useState<{ id: number, nombre: string }[]>([])
  const [categorias, setCategorias] = useState<{ id: number, nombre: string }[]>([])
  const [loading, setLoading] = useState(false)

  // Obtener prioridades y categorías desde la API
  useEffect(() => {
    const fetchPrioridades = async () => {
      const res = await fetch('/api/tickets/prioridades/obtener?id=all')
      const data = await res.json()

      setPrioridades(data.data || [])
    }

    const fetchCategorias = async () => {
      const res = await fetch('/api/tickets/categorias/obtener?id=all')
      const data = await res.json()

      setCategorias(data.data || [])
    }

    fetchPrioridades()
    fetchCategorias()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/tickets/ticket/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (res.ok) {
        alert('Ticket creado:\n' + JSON.stringify(data.data, null, 2))
        setForm({
          subject: '',
          description: '',
          priority_id: '',
          category_id: '',
          contact_name: '',
          contact_email: '',
          contact_phone: ''
        })
      } else {
        alert(data.message || 'Error al crear ticket')
      }
    } catch {
      alert('Error de conexión')
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader title="Crear Ticket" />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Asunto"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="prioridad-label">Prioridad</InputLabel>
                <Select
                  labelId="prioridad-label"
                  label="Prioridad"
                  name="priority_id"
                  value={form.priority_id}
                  onChange={handleSelectChange}
                >
                  {prioridades.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="categoria-label">Categoría</InputLabel>
                <Select
                  labelId="categoria-label"
                  label="Categoría"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleSelectChange}
                >
                  {categorias.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre de contacto"
                name="contact_name"
                value={form.contact_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email de contacto"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                fullWidth
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Teléfono de contacto"
                name="contact_phone"
                value={form.contact_phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Ticket'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateTicket

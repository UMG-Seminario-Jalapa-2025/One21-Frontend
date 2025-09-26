'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, FormControl, InputLabel, Select
} from '@mui/material'

export type EmpleadoPayload = {
  employee_number: string
  business_partner_id: number
  hire_date: string              // YYYY-MM-DD
  employee_department_id?: number | null
  job_position_id?: number | null
  position_title?: string | null
  manager_employee_id?: number | null
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  base_salary?: number | null
  currency_code: string          // p.ej. GTQ, USD
  keycloak_user_id?: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  // Datos mínimos de la persona seleccionada
  persona?: { id: number; code: string; name: string }
  // Te regreso el payload listo para enviar a la API
  onSubmit: (payload: EmpleadoPayload) => void
}

const hoyISO = () => new Date().toISOString().slice(0, 10)

export default function EmpleadoModal({ open, onClose, persona, onSubmit }: Props) {
  const sugerenciaNumero = useMemo(() => {
    if (!persona) return ''
    const year = new Date().getFullYear()
    return `${persona.code}-${year}-${String(persona.id).padStart(4, '0')}`
  }, [persona])

  const [form, setForm] = useState<EmpleadoPayload>({
    employee_number: '',
    business_partner_id: persona?.id ?? 0,
    hire_date: hoyISO(),
    employee_department_id: null,
    job_position_id: null,
    position_title: '',
    manager_employee_id: null,
    status: 'ACTIVE',
    base_salary: undefined,
    currency_code: 'GTQ',
    keycloak_user_id: ''
  })

  // Cuando cambia la persona, refrescar defaults
  useEffect(() => {
    if (!persona) return
    setForm(f => ({
      ...f,
      business_partner_id: persona.id,
      employee_number: sugerenciaNumero
    }))
  }, [persona, sugerenciaNumero])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]:
        ['employee_department_id','job_position_id','manager_employee_id','base_salary'].includes(name)
          ? (value === '' ? null : Number(value))
          : value
    }))
  }

  const handleSubmit = () => {
    // Validaciones mínimas
    if (!form.business_partner_id) return alert('Falta business_partner_id')
    if (!form.employee_number) return alert('Falta número de empleado')
    if (!form.hire_date) return alert('Falta fecha de contratación')

    onSubmit(form)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Registrar Empleado</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Persona (Partner)"
              value={`${persona?.name ?? ''}  —  ID: ${persona?.id ?? ''}`}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth label="Número de empleado *"
              name="employee_number"
              value={form.employee_number}
              onChange={handleChange}
              placeholder={sugerenciaNumero}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth type="date" label="Fecha de contratación *"
              name="hire_date" value={form.hire_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth label="ID Departamento"
              name="employee_department_id"
              value={form.employee_department_id ?? ''}
              onChange={handleChange}
              placeholder="Ej. 1"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth label="ID Puesto"
              name="job_position_id"
              value={form.job_position_id ?? ''}
              onChange={handleChange}
              placeholder="Ej. 3"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth label="Título del puesto"
              name="position_title"
              value={form.position_title ?? ''}
              onChange={handleChange}
              placeholder="Ej. Desarrollador Full-Stack"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth label="ID Jefe directo"
              name="manager_employee_id"
              value={form.manager_employee_id ?? ''}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label" label="Estado"
                name="status" value={form.status}
                onChange={handleChange}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth label="Salario base"
              name="base_salary"
              value={form.base_salary ?? ''}
              onChange={handleChange}
              placeholder="Ej. 4500"
              inputMode="decimal"
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth label="Moneda"
              name="currency_code"
              value={form.currency_code}
              onChange={handleChange}
              placeholder="GTQ"
              inputProps={{ maxLength: 3 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth label="Keycloak User ID"
              name="keycloak_user_id"
              value={form.keycloak_user_id ?? ''}
              onChange={handleChange}
              placeholder="Opcional (UUID)"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  )
}

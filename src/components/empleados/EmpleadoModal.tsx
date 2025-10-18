'use client'

import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'

export type EmpleadoPayload = {
  employee_number: string
  businessPartner: { id: number; email: string }
  hire_date: string
  departments?: { id: number } | null
  jobPosition?: { id: number } | null
  position_title?: string | null
  managerEmployee?: { id: number } | null
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  base_salary?: number | null
  currency_code: string
  keycloak_user_id?: string | null,
  email?: string

}

type Props = {
  open: boolean
  onClose: () => void
  persona?: { id: number; code: string; name: string; email: string }
  onSubmit: (payload: EmpleadoPayload) => void
}

const hoyISO = () => new Date().toISOString().slice(0, 10)

const EmpleadoModal = ({ open, onClose, persona, onSubmit }: Props) => {
  const [formData, setFormData] = useState<EmpleadoPayload>({
    employee_number: '',
    businessPartner: { id: 0, email: '' },
    hire_date: hoyISO(),
    departments: null,
    jobPosition: null,
    position_title: '',
    managerEmployee: null,
    status: 'ACTIVE',
    base_salary: undefined,
    currency_code: 'GTQ',
    keycloak_user_id: null
  })

  const [departamentos, setDepartamentos] = useState<any[]>([])
  const [puestos, setPuestos] = useState<any[]>([])

  // const [jefes, setJefes] = useState<any[]>([])

  // Actualiza datos obligatorios al recibir persona
  useEffect(() => {
    if (persona) {
      setFormData(prev => ({
        ...prev,
        employee_number: persona.code,
        businessPartner: { id: persona.id, email: persona.email}

      }))
    }
  }, [persona])

  useEffect(() => {
    fetch('/api/employee_departments/obtener')
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setDepartamentos(data) : setDepartamentos([]))

    fetch('/api/empleados/puestos')
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setPuestos(data) : setPuestos([]))

    // fetch('/api/empleados/jefes')
    //   .then(res => res.json())
    //   .then(data => {
    //     setJefes(Array.isArray(data) ? data : [])
    //   })
  }, [])

  const handleChange = (field: keyof EmpleadoPayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.employee_number || !formData.businessPartner?.id || !formData.hire_date) {
      alert('Faltan datos obligatorios: Código, Socio o Fecha de contratación')

      return
    }

    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Registrar nuevo empleado</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField label='Código del empleado' fullWidth value={formData.employee_number} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField label='Nombre completo' fullWidth value={persona?.name || ''} disabled />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label='Fecha de contratación'
              fullWidth
              type='date'
              value={formData.hire_date}
              onChange={e => handleChange('hire_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={formData.departments?.id || ''}
                onChange={e => handleChange('departments', { id: Number(e.target.value) })}
                label='Departamento'
              >
                {departamentos.map(dep => (
                  <MenuItem key={dep.id} value={dep.id}>
                    {dep.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Puesto</InputLabel>
              <Select
                value={formData.jobPosition?.id || ''}
                onChange={e => handleChange('jobPosition', { id: Number(e.target.value) })}
                label='Puesto'
              >
                {puestos.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label='Título del puesto'
              fullWidth
              value={formData.position_title || ''}
              onChange={e => handleChange('position_title', e.target.value)}
            />
          </Grid>

          {/* <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Jefe directo</InputLabel>
              <Select
                value={formData.managerEmployee?.id || ''}
                onChange={e => {
                  const value = e.target.value

                  handleChange('managerEmployee', value ? { id: Number(value) } : null)
                }}
                label='Jefe directo'
              >
                <MenuItem value=''>Ninguno</MenuItem>
                {Array.isArray(jefes) && jefes.map(j => (
                  <MenuItem key={j.id} value={j.id}>
                    {j.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid> */}

          <Grid item xs={6}>
            <TextField
              label='Salario base'
              fullWidth
              type='number'
              value={formData.base_salary || ''}
              onChange={e => handleChange('base_salary', parseFloat(e.target.value))}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                onChange={e => handleChange('status', e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
              >
                <MenuItem value='ACTIVE'>Activo</MenuItem>
                <MenuItem value='INACTIVE'>Inactivo</MenuItem>
                <MenuItem value='SUSPENDED'>Suspendido</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label='Moneda'
              fullWidth
              value={formData.currency_code}
              onChange={e => handleChange('currency_code', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant='contained' onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmpleadoModal

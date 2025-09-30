'use client'

import { useEffect, useState, useMemo } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import CustomTextField from '@core/components/mui/TextField'
import { useLoading } from '@/components/ui/LoadingModal'

type Country = { id: number; name: string }
type Department = { id: number; name: string; country: Country }
type Municipality = { id: number; name: string; department: Department }

type StepPersonaDireccionProps = {
  handlePrev: () => void
  handleSave: () => void
  handleCancel: () => void
  formData: {
    calle: string
    numero: string
    zona: string
    colonia: string
    referencia: string
    ciudad: string
    estado: string
    countryId?: number
    departmentId?: number
    municipalityId?: number
    [key: string]: any
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      calle: string
      numero: string
      zona: string
      colonia: string
      referencia: string
      ciudad: string
      estado: string
      countryId?: number
      departmentId?: number
      municipalityId?: number
      [key: string]: any
    }>
  >
}

const StepPersonaDireccion = ({
  handlePrev,
  handleSave,
  handleCancel,
  formData,
  setFormData
}: StepPersonaDireccionProps) => {
  const [countries, setCountries] = useState<Country[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])

  const { esperar, finEspera } = useLoading()

  // cargar TODA la data de una vez
  useEffect(() => {
    const cargarData = async () => {
      try {
        esperar()

        const [countriesRes, departmentsRes, municipalitiesRes] = await Promise.all([
          fetch('/api/business-partner/countries'),
          fetch('/api/business-partner/departaments/obtener'),
          fetch('/api/business-partner/municipality/obtener')
        ])

        const [countriesData, departmentsData, municipalitiesData] = await Promise.all([
          countriesRes.json(),
          departmentsRes.json(),
          municipalitiesRes.json()
        ])

        setCountries(countriesData)
        setDepartments(departmentsData)
        setMunicipalities(municipalitiesData)
      } catch (err) {
        console.error('❌ Error cargando datos de selects', err)
      } finally {
        finEspera()
      }
    }

    cargarData()
  }, [])

  // filtrar departamentos por país
  const filteredDepartments = useMemo(() => {
    if (!formData.countryId) return []
    
    return departments.filter(d => d.country?.id === formData.countryId)
  }, [departments, formData.countryId])

  // filtrar municipios por departamento
  const filteredMunicipalities = useMemo(() => {
    if (!formData.departmentId) return []

    return municipalities.filter(m => Number(m.department?.id) === Number(formData.departmentId))
  }, [municipalities, formData.departmentId])

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Dirección de la Persona
      </Typography>

      <Grid container spacing={6}>
        {/* SELECT País */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="País"
            value={formData.countryId || ''}
            onChange={(e): void =>
              setFormData({
                ...formData,
                countryId: Number(e.target.value),
                departmentId: undefined,
                municipalityId: undefined
              })
            }
            disabled={countries.length === 0}
          >
            {countries.map(country => (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* SELECT Departamento */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Departamento"
            value={formData.departmentId || ''}
            onChange={(e): void =>
              setFormData({
                ...formData,
                departmentId: Number(e.target.value),
                municipalityId: undefined
              })
            }
            disabled={!formData.countryId || filteredDepartments.length === 0}
          >
            {filteredDepartments.map(dept => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* SELECT Municipio */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Municipio"
            value={formData.municipalityId || ''}
            onChange={e =>
              setFormData({
                ...formData,
                municipalityId: Number(e.target.value)
              })
            }
            disabled={!formData.departmentId || filteredMunicipalities.length === 0}
          >
            {filteredMunicipalities.map(mun => (
              <MenuItem key={mun.id} value={mun.id}>
                {mun.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Inputs adicionales */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Calle"
            placeholder="Ej. 3ra Avenida"
            value={formData.calle}
            onChange={e => setFormData({ ...formData, calle: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Número"
            placeholder="Ej. 12-34"
            value={formData.numero}
            onChange={e => setFormData({ ...formData, numero: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Zona"
            placeholder="Ej. Zona 9"
            value={formData.zona}
            onChange={e => setFormData({ ...formData, zona: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Colonia / Barrio"
            placeholder="Ej. Colonia Centro"
            value={formData.colonia}
            onChange={e => setFormData({ ...formData, colonia: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            fullWidth
            label="Referencia"
            placeholder="Ej. Frente a un parque"
            value={formData.referencia}
            onChange={e => setFormData({ ...formData, referencia: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Ciudad"
            placeholder="Ej. Guatemala"
            value={formData.ciudad}
            onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Departamento / Estado"
            placeholder="Ej. Jalapa"
            value={formData.estado}
            onChange={e => setFormData({ ...formData, estado: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12 }} className="flex justify-between">
          <Button variant="outlined" color="error" onClick={handleCancel}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button variant="outlined" onClick={handlePrev}>
              Anterior
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default StepPersonaDireccion

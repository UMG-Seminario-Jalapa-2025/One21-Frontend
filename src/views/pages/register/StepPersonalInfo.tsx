import { useEffect, useState, useMemo } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import DirectionalIcon from '@components/DirectionalIcon'
import CustomTextField from '@core/components/mui/TextField'

import type { PhoneContact } from '@/components/ui/PhoneTable';
import PhoneTable from '@/components/ui/PhoneTable'
import { useLoading } from '@/components/ui/LoadingModal'

type Country = { id: number; name: string }
type Department = { id: number; name: string; country: Country }
type Municipality = { id: number; name: string; department: Department }

type StepPersonalInfoProps = {
  handlePrev: () => void
  handleSave: () => void
  handleCancel: () => void
  formData: {
    firstName: string
    lastName: string
    mobile?: string
    telefonoPrincipal?: string
    street: string
    number: string
    zone: string
    neighborhood: string
    landmark: string
    city: string
    state: string
    countryId?: number
    departmentId?: number
    municipalityId?: number
    phones?: PhoneContact[]
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      firstName: string
      lastName: string
      mobile?: string
      telefonoPrincipal?: string
      street: string
      number: string
      zone: string
      neighborhood: string
      landmark: string
      city: string
      state: string
      countryId?: number
      departmentId?: number
      municipalityId?: number
      phones?: PhoneContact[]
    }>
  >
}

const StepPersonalInfo = ({ handlePrev, handleSave, handleCancel, formData, setFormData }: StepPersonalInfoProps) => {
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
        console.error('❌ Error cargando datos de ubicación', err)
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
      <div className='mbe-5'>
        <Typography variant='h4'>Información Personal</Typography>
        <Typography>Ingresa tu información personal</Typography>
      </div>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Nombres'
            placeholder='Ingrese sus nombres'
            value={formData.firstName}
            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Apellidos'
            placeholder='Ingrese sus apellidos'
            value={formData.lastName}
            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Teléfono Principal'
            placeholder='0000 0000'
            value={formData.telefonoPrincipal || ''}
            onChange={e => setFormData({ ...formData, telefonoPrincipal: e.target.value })}
          />
        </Grid>

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

        {/* Dirección desglosada */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Calle'
            placeholder='Ej. 3ra Avenida'
            value={formData.street}
            onChange={e => setFormData({ ...formData, street: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Número'
            placeholder='Ej. 12-34'
            value={formData.number}
            onChange={e => setFormData({ ...formData, number: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Zona'
            placeholder='Ej. Zona 9'
            value={formData.zone}
            onChange={e => setFormData({ ...formData, zone: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Colonia / Barrio'
            placeholder='Ej. Colonia Centro'
            value={formData.neighborhood}
            onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomTextField
            fullWidth
            label='Referencia'
            placeholder='Ej. Frente a un parque, cerca de una tienda'
            value={formData.landmark}
            onChange={e => setFormData({ ...formData, landmark: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Ciudad'
            placeholder='Ej. Guatemala'
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Departamento/Estado'
            placeholder='Ej. Jalapa'
            value={formData.state}
            onChange={e => setFormData({ ...formData, state: e.target.value })}
          />
        </Grid>

        {/* Tabla de teléfonos adicionales */}
        <Grid size={{ xs: 12 }}>
          <PhoneTable
            phones={formData.phones || []}
            onPhonesChange={(phones) => setFormData({ ...formData, phones })}
          />
        </Grid>

        <Grid size={{ xs: 12 }} className='flex justify-between'>
          <Button
            variant='outlined'
            color='error'
            onClick={handleCancel}
            startIcon={<DirectionalIcon ltrIconClass='tabler-x' rtlIconClass='tabler-x' />}
          >
            Cancelar
          </Button>
          <div className='flex gap-3'>
            <Button
              variant='tonal'
              color='secondary'
              onClick={handlePrev}
              startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
            >
              Anterior
            </Button>
            <Button
              variant='contained'
              onClick={handleSave}
              endIcon={<DirectionalIcon ltrIconClass='tabler-device-floppy' rtlIconClass='tabler-device-floppy' />}
            >
              Guardar
            </Button>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default StepPersonalInfo

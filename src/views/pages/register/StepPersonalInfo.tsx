import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import DirectionalIcon from '@components/DirectionalIcon'
import CustomTextField from '@core/components/mui/TextField'

type StepPersonalInfoProps = {
  handlePrev: () => void
  handleSave: () => void
  handleCancel: () => void
  formData: {
    firstName: string
    lastName: string
    mobile: string
    street: string
    number: string
    zone: string
    neighborhood: string
    landmark: string
    city: string
    state: string
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      firstName: string
      lastName: string
      mobile: string
      street: string
      number: string
      zone: string
      neighborhood: string
      landmark: string
      city: string
      state: string
    }>
  >
}

const StepPersonalInfo = ({ handlePrev, handleSave, handleCancel, formData, setFormData }: StepPersonalInfoProps) => {
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
            type='number'
            label='Teléfono móvil'
            placeholder='0000 0000'
            value={formData.mobile}
            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
          />
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

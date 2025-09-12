import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'

type StepPersonaInfoProps = {
  handleNext: () => void
  handleCancel: () => void
  formData: {
    nombres: string
    apellidos: string
    dpi: string
    telefono: string
    [key: string]: any
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      nombres: string
      apellidos: string
      dpi: string
      telefono: string
      [key: string]: any
    }>
  >
}

const StepPersonaInfo = ({ handleNext, handleCancel, formData, setFormData }: StepPersonaInfoProps) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Información de la Persona
      </Typography>

      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Nombres"
            placeholder="Ingrese nombres"
            value={formData.nombres}
            onChange={e => setFormData({ ...formData, nombres: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Apellidos"
            placeholder="Ingrese apellidos"
            value={formData.apellidos}
            onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="DPI"
            placeholder="0000 00000 0000"
            value={formData.dpi}
            onChange={e => setFormData({ ...formData, dpi: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Teléfono"
            placeholder="0000 0000"
            value={formData.telefono}
            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12 }} className="flex justify-between">
          <Button variant="outlined" color="error" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleNext}>
            Siguiente
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default StepPersonaInfo

/* eslint-disable @typescript-eslint/consistent-type-imports */
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'

import PhoneTable, { PhoneContact } from '@/components/ui/PhoneTable'

type StepPersonaInfoProps = {
  handleNext: () => void
  handleCancel: () => void
  formData: {
    nombres: string
    apellidos: string
    dpi?: string // Comentado para futuro
    telefono?: string // Mantenido por compatibilidad
    telefonoPrincipal?: string // Nuevo campo para teléfono principal
    telefonoSecundario?: string // Nuevo campo para teléfono secundario
    correo: string
    phones?: PhoneContact[]
    [key: string]: any
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      nombres: string
      apellidos: string
      dpi?: string // Comentado para futuro
      telefono?: string // Mantenido por compatibilidad
      telefonoPrincipal?: string // Nuevo campo para teléfono principal
      telefonoSecundario?: string // Nuevo campo para teléfono secundario
      correo: string
      phones?: PhoneContact[]
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
        {/* Comentado para futuro - Campo DPI */}
        {/* <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="DPI"
            placeholder="0000 00000 0000"
            value={formData.dpi}
            onChange={e => setFormData({ ...formData, dpi: e.target.value })}
          />
        </Grid> */}

        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Teléfono Principal"
            placeholder="0000 0000"
            value={formData.telefonoPrincipal || ''}
            onChange={e => setFormData({ ...formData, telefonoPrincipal: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="Correo"
            placeholder="ejemplo@correo.com"
            type="email"
            value={formData.correo}
            onChange={e => setFormData({ ...formData, correo: e.target.value })}
          />
        </Grid>

        {/* Tabla de teléfonos adicionales */}
        <Grid size={{ xs: 12 }}>
          <PhoneTable
            phones={formData.phones || []}
            onPhonesChange={(phones) => setFormData({ ...formData, phones })}
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

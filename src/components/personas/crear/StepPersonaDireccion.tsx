import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'

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
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Dirección de la Persona
      </Typography>

      <Grid container spacing={6}>
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

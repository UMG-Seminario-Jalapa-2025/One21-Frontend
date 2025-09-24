import { useState } from 'react'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import DirectionalIcon from '@components/DirectionalIcon'
import CustomTextField from '@core/components/mui/TextField'

type StepAccountDetailsProps = {
  handleNext: () => void
  handleCancel: () => void
  formData: {
    username: string
    email: string
    confirmEmail: string
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      username: string
      email: string
      confirmEmail: string
    }>
  >
}

const StepAccountDetails = ({ handleNext, handleCancel, formData, setFormData }: StepAccountDetailsProps) => {
  const [errors, setErrors] = useState<{ username?: string; email?: string; confirmEmail?: string }>({})

  const validate = (): boolean => {
    const newErrors: { username?: string; email?: string; confirmEmail?: string } = {}

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido'
    }

    if (!formData.confirmEmail.trim()) {
      newErrors.confirmEmail = 'La confirmación de correo es obligatoria'
    } else if (formData.confirmEmail !== formData.email) {
      newErrors.confirmEmail = 'Los correos no coinciden'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const onNext = () => {
    if (validate()) {
      handleNext()
    }
  }

  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h4'>Información de la Cuenta</Typography>
        <Typography>Ingresa los datos de tu cuenta</Typography>
      </div>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='Nombre de usuario'
            placeholder='usuario123'
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            error={!!errors.username}
            helperText={errors.username}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            type='email'
            label='Correo electrónico'
            placeholder='correo@ejemplo.com'
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            type='email'
            label='Confirmar correo electrónico'
            placeholder='confirma@ejemplo.com'
            value={formData.confirmEmail}
            onChange={e => setFormData({ ...formData, confirmEmail: e.target.value })}
            error={!!errors.confirmEmail}
            helperText={errors.confirmEmail}
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
          <Button
            variant='contained'
            onClick={onNext}
            endIcon={<DirectionalIcon ltrIconClass='tabler-arrow-right' rtlIconClass='tabler-arrow-left' />}
          >
            Siguiente
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default StepAccountDetails

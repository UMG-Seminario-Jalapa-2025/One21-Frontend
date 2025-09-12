'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'

import StepPersonaInfo from './StepPersonaInfo'
import StepPersonaDireccion from './StepPersonaDireccion'

const steps = ['Información de la Persona', 'Dirección']

const StepperCrearPersona = () => {
  const [activeStep, setActiveStep] = useState(0)
  const router = useRouter()

  const [personaFormData, setPersonaFormData] = useState<any>({
    nombres: '',
    apellidos: '',
    dpi: '',
    telefono: '',
    calle: '',
    numero: '',
    zona: '',
    colonia: '',
    referencia: '',
    ciudad: '',
    estado: ''
  })

  const handleNext = () => setActiveStep(prev => prev + 1)
  const handlePrev = () => setActiveStep(prev => prev - 1)

  const handleCancel = () => {
    router.push('/personas')
  }

  const handleSave = () => {
    console.log('✅ Guardando persona...', personaFormData)

    // Aquí iría tu lógica para POST a la API
    // await fetch('/api/personas', { method: 'POST', body: JSON.stringify(personaFormData) })

    router.push('/personas')
  }

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>
        Crear Persona
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="mt-6">
        {activeStep === 0 && (
          <StepPersonaInfo
            formData={personaFormData}
            setFormData={setPersonaFormData}
            handleNext={handleNext}
            handleCancel={handleCancel}
          />
        )}
        {activeStep === 1 && (
          <StepPersonaDireccion
            formData={personaFormData}
            setFormData={setPersonaFormData}
            handlePrev={handlePrev}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />
        )}
      </div>
    </div>
  )
}

export default StepperCrearPersona

'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'

import StepPersonaInfo from './StepPersonaInfo'
import StepPersonaDireccion from './StepPersonaDireccion'

import { useLoading } from "@/components/ui/LoadingModal"

import { showAlert } from "@/components/ui/AlertProvider"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const steps = ['Información de la Persona', 'Dirección']

const StepperCrearPersona = () => {

  const { esperar, finEspera } = useLoading()
  const [activeStep, setActiveStep] = useState(0)
  const router = useRouter()

  const [personaFormData, setPersonaFormData] = useState<any>({
    nombres: '',
    apellidos: '',
    dpi: '', // Comentado para futuro
    telefono: '',
    telefonoPrincipal: '',
    calle: '',
    correo: '',
    numero: '',
    zona: '',
    colonia: '',
    referencia: '',
    estado: '',
    municipalityId: null,
    phones: [], // Para contactos adicionales
  })

  // ✅ Validación de campos antes de continuar o guardar
  const validarCampos = (etapa: number) => {
    if (etapa === 0) {
      // Validar datos personales
      const requeridos = ['nombres', 'apellidos', 'telefonoPrincipal', 'correo']

      for (const campo of requeridos) {

        if (!personaFormData[campo] || personaFormData[campo].toString().trim() === '') {
          showAlert('error', `El campo "${campo}" es obligatorio.`)

          return false
        }
      }
    }

    if (etapa === 1) {
      // Validar dirección
      const requeridosDireccion = ['calle', 'numero', 'zona', 'colonia', 'referencia', 'municipalityId']

      for (const campo of requeridosDireccion) {

        if (!personaFormData[campo] || personaFormData[campo].toString().trim() === '') {
          showAlert('error', `El campo "${campo}" es obligatorio.`)

          return false
        }
      }
    }

    return true
  }

  const handleNext = () => {
    if (!validarCampos(activeStep)) return
    setActiveStep(prev => prev + 1)
  }

  const handlePrev = () => setActiveStep(prev => prev - 1)

  const handleCancel = () => {
    router.push('/personas')
  }

  const handleSave = async () => {
    if (!validarCampos(activeStep)) return

    try {
      esperar()

      const res = await fetch('/api/business-partner/pather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaFormData)
      })

      const data = await res.json()

      if (!res.ok) {
        showAlert('error', data?.message || 'Error al guardar persona')

        return
      }

      showAlert('success', 'Persona creada con éxito')
      router.push('/personas')
    } catch (err) {
      console.error(err)
      showAlert('error', 'Error interno al guardar persona')
    } finally {
      finEspera()
    }
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

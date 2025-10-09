'use client'

import { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'

import StepPersonaInfo from '../crear/StepPersonaInfo'
import StepPersonaDireccion from '../crear/StepPersonaDireccion'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PhoneContact } from '@/components/ui/PhoneTable'

import { useLoading } from '@/components/ui/LoadingModal'
import { showAlert } from '@/components/ui/AlertProvider'

const steps = ['Información de la Persona', 'Dirección']

const StepperEditarPersona = () => {
  const router = useRouter()
  const { esperar, finEspera } = useLoading()
  const { id } = useParams()
  const partnerId = Number(id)

  const [activeStep, setActiveStep] = useState(0)
  const [personaFormData, setPersonaFormData] = useState<any>(null)

  // FUNCIONES PARA AVANZAR Y RETROCEDER EN EL STEPPER
  const handleNext = () => setActiveStep(prev => prev + 1)
  const handlePrev = () => setActiveStep(prev => prev - 1)

  // FUNCION PARA CANCELAR Y VOLVER A LA LISTA
  const handleCancel = () => router.push('/personas')

  // FUNCION PARA GUARDAR LOS CAMBIOS
  const handleSave = async () => {
    try {
      esperar()

      // RECONSTRUIMOS EL OBJETO COMPLETO QUE ESPERA EL BACKEND
      const payload = {
        ...personaFormData._raw,
        street: personaFormData.calle,
        street2: personaFormData.numero,
        neighborhood: personaFormData.colonia,
        postalCode: personaFormData.zona,
        businessPartner: {
          ...personaFormData._raw.businessPartner,
          name: `${personaFormData.nombres} ${personaFormData.apellidos}`,
          taxId: personaFormData.dpi, // Comentado para futuro
          email: personaFormData.correo,
          notes: personaFormData.referencia
        },
        municipality: { id: personaFormData.municipalityId }
      }

      // Actualizar contactos si hay teléfonos adicionales
      if (personaFormData.phones && personaFormData.phones.length > 0) {
        try {
          await fetch('/api/business-partner/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessPartnerId: personaFormData._raw.businessPartner.id,
              phones: personaFormData.phones.map((phone: PhoneContact) => ({
                phone: phone.phone,
                firstName: '',
                lastName: '',
                is_active: phone.is_active !== undefined ? phone.is_active : true
              }))
            })
          })
        } catch (contactsError) {
          console.warn('Error actualizando contactos:', contactsError)
        }
      }

      const res = await fetch(`/api/business-partner/personas/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        showAlert('error', data?.message || 'ERROR AL ACTUALIZAR PERSONA')

        return
      }

      showAlert('success', 'PERSONA ACTUALIZADA CON ÉXITO')
      router.push('/personas')
    } catch (err) {
      console.error(err)
      showAlert('error', 'ERROR INTERNO AL ACTUALIZAR PERSONA')
    } finally {
      finEspera()
    }
  }

  // FUNCION PARA OBTENER LOS DATOS DESDE EL BACKEND Y MAPEARLOS AL FORMATO DEL FORMULARIO
  const fetchPersona = async () => {
    try {
      esperar()

      const res = await fetch(`/api/business-partner/personas/${partnerId}`)
      const data = await res.json()

      if (!res.ok) {
        showAlert('error', data?.message || 'NO SE PUDO OBTENER LA PERSONA')
        router.push('/personas')

        return
      }

      const address = data[0]

      // NORMALIZAMOS LOS DATOS DE PERSONA Y DIRECCION PARA LOS STEPS
      setPersonaFormData({
        // DATOS DE PERSONA
        nombres: address.businessPartner.name?.split(' ')[0] ?? '',
        apellidos: address.businessPartner.name?.split(' ').slice(1).join(' ') ?? '',
        dpi: address.businessPartner.taxId ?? '', // Comentado para futuro
        telefono: '',
        telefonoPrincipal: '',
        correo: address.businessPartner.email ?? '',
        phones: [], // Inicialmente vacío, se cargará después

        // DATOS DE DIRECCION
        calle: address.street ?? '',
        numero: address.street2 ?? '',
        zona: address.postalCode ?? '',
        colonia: address.neighborhood ?? '',
        referencia: address.businessPartner.notes ?? '',
        ciudad: '',
        estado: '',
        countryId: address.municipality?.departments?.country?.id,
        departmentId: address.municipality?.departments?.id,
        municipalityId: address.municipality?.id,

        // OBJETO CRUDO PARA RECONSTRUIR EN EL SAVE
        _raw: address
      })

      // Cargar contactos adicionales después de establecer los datos básicos
      try {
        const contactsRes = await fetch(`/api/business-partner/contacts?businessPartnerId=${address.businessPartner.id}`)

        if (contactsRes.ok) {
          const contactsData = await contactsRes.json()

          if (contactsData.contacts && contactsData.contacts.length > 0) {

            setPersonaFormData((prev: any) => ({
              ...prev,
              phones: contactsData.contacts.map((contact: any) => ({
                id: contact.id,
                phone: contact.phone,
                is_active: contact.is_active
              }))
            }))
          }
        }
      } catch (contactsError) {
        console.warn('Error cargando contactos:', contactsError)
      }
    } catch (err) {
      console.error(err)
      showAlert('error', 'ERROR CARGANDO DATOS DE PERSONA')
    } finally {
      finEspera()
    }
  }

  // USEEFFECT PARA EJECUTAR EL FETCH AL MONTAR EL COMPONENTE
  useEffect(() => {
    if (partnerId) fetchPersona()
  }, [partnerId])

  // SI NO TENEMOS FORM DATA RETORNAMOS NULL PARA EVITAR ERRORES
  if (!personaFormData) {
    return null
  }

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>
        Editar Persona
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

export default StepperEditarPersona

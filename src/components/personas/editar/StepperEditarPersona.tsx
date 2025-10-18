'use client'

import { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'

import StepPersonaInfo from '../crear/StepPersonaInfo'
import StepPersonaDireccion from '../crear/StepPersonaDireccion'

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
  const [phonesOriginal, setPhonesOriginal] = useState<any[]>([])

  const handleNext = () => setActiveStep(prev => prev + 1)
  const handlePrev = () => setActiveStep(prev => prev - 1)
  const handleCancel = () => router.push('/personas')

  // ========================== GUARDAR CAMBIOS ==========================
  const handleSave = async () => {
    try {
      esperar()

      const payload = {
        ...personaFormData._raw,
        street: personaFormData.calle,
        street2: personaFormData.numero,
        neighborhood: personaFormData.colonia,
        postalCode: personaFormData.zona,
        businessPartner: {
          ...personaFormData._raw.businessPartner,
          name: `${personaFormData.nombres} ${personaFormData.apellidos}`,
          taxId: personaFormData.dpi,
          email: personaFormData.correo,
          notes: personaFormData.referencia,
        },
        municipality: { id: personaFormData.municipalityId },
      }

      // ======== 1️⃣  Procesar contactos ========
      const currentPhones: any[] = personaFormData.phones || []
      const created: any[] = []
      const updated: any[] = []
      const deleted: any[] = []

      // Detectar nuevos y modificados
      for (const p of currentPhones) {
        const original = phonesOriginal.find(o => o.id === p.id)

        if (!original) {
          created.push(p)
        } else if (original.phone !== p.phone || original.isActive !== p.isActive) {
          updated.push(p)
        }
      }

      // Detectar eliminados
      for (const o of phonesOriginal) {
        if (!currentPhones.find(p => p.id === o.id)) {
          deleted.push(o)
        }
      }

      const contactOps: Promise<any>[] = []
      const businessPartner = personaFormData._raw.businessPartner

      // ➕ Crear nuevos
      for (const c of created) {
        const now = new Date().toISOString()

        const contactPayload = {
          firstName: personaFormData.nombres,
          lastName: personaFormData.apellidos,
          phone: c.phone,
          isActive: c.is_active ?? true,
          birthDate: now.split('T')[0],
          createdAt: now,
          updatedAt: now,
          businessPartner,
        }

        contactOps.push(
          fetch('/api/business-partner/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessPartnerId: businessPartner.id,
              phones: [contactPayload],
            }),
          })
        )
      }

      // ✏️ Actualizar existentes
      for (const u of updated) {
        const original = phonesOriginal.find(o => o.id === u.id)

        if (!original) continue

        const contactPayload = {
          id: u.id,
          firstName: personaFormData.nombres,
          lastName: personaFormData.apellidos,
          phone: u.phone,
          isActive: u.is_active ?? true,
          birthDate: personaFormData.fechaNacimiento ?? '2025-10-07', // o el campo real si existe
          businessPartner: { id: personaFormData._raw.businessPartner.id },
        }

        console.log('Body final de actualización:', contactPayload)

        contactOps.push(
          fetch('/api/business-partner/contacts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactPayload),
          })
        )
      }


      // ❌ Eliminar removidos
      for (const d of deleted) {
        contactOps.push(fetch(`/api/business-partner/contacts?id=${d.id}`, { method: 'DELETE' }))
      }

      await Promise.all(contactOps)

      // ======== 2️⃣  Actualizar dirección + partner ========
      const res = await fetch(`/api/business-partner/personas/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        showAlert('error', data?.message || 'ERROR AL ACTUALIZAR PERSONA')

        return
      }

      showAlert('success', 'PERSONA ACTUALIZADA CON ÉXITO')
      router.push('/personas')
    } catch (err) {
      console.error('❌ Error en handleSave:', err)
      showAlert('error', 'ERROR INTERNO AL ACTUALIZAR PERSONA')
    } finally {
      finEspera()
    }
  }

  // ========================== CARGAR PERSONA ==========================
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

      const address = Array.isArray(data.address) ? data.address[0] : data.address
      const phone = data.phone || []

      setPersonaFormData({
        nombres: address.businessPartner?.name?.split(' ')[0] ?? '',
        apellidos: address.businessPartner?.name?.split(' ').slice(1).join(' ') ?? '',
        dpi: address.businessPartner?.taxId ?? '',
        telefono: '',
        telefonoPrincipal: phone.length > 0 ? phone[0].phone : '',
        correo: address.businessPartner?.email ?? '',
        phones: phone.map((p: any) => ({
          id: p.id,
          phone: p.phone,
          is_active: p.isActive ?? true,
        })),
        calle: address.street ?? '',
        numero: address.street2 ?? '',
        zona: address.postalCode ?? '',
        colonia: address.neighborhood ?? '',
        referencia: address.businessPartner?.notes ?? '',
        countryId: address.municipality?.departments?.country?.id,
        departmentId: address.municipality?.departments?.id,
        municipalityId: address.municipality?.id,
        _raw: address,
      })

      // Guardamos copia completa para comparar después
      setPhonesOriginal(
        phone.map((p: any) => ({
          ...p, // incluye firstName, lastName, birthDate, createdAt, updatedAt, businessPartner, etc.
          isActive: p.isActive ?? true,
        }))
      )
    } catch (err) {
      console.error('❌ Error en fetchPersona:', err)
      showAlert('error', 'ERROR CARGANDO DATOS DE PERSONA')
    } finally {
      finEspera()
    }
  }

  useEffect(() => {
    if (partnerId) fetchPersona()
  }, [partnerId])

  if (!personaFormData) return null

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

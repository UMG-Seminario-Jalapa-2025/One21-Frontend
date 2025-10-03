'use client'

import { useState } from 'react'

import Link from 'next/link'
import {  useRouter } from 'next/navigation'

import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Stepper from '@mui/material/Stepper'
import MuiStep from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import type { StepProps } from '@mui/material/Step'

import classnames from 'classnames'

import type { SystemMode } from '@core/types'

import CustomAvatar from '@core/components/mui/Avatar'
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
import StepperWrapper from '@core/styles/stepper'
import StepAccountDetails from './StepAccountDetails'
import StepPersonalInfo from './StepPersonalInfo'

import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

import { getLocalizedUrl } from '@/utils/i18n'

import { useLoading } from "@/components/ui/LoadingModal"

import { showAlert } from "@/components/ui/AlertProvider"




// Imagen ilustrativa
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxBlockSize: 550,
  marginBlock: theme.spacing(12)
}))

// Pasos visibles en el Stepper
const steps = [
  { title: 'Cuenta', icon: 'tabler-file-analytics', subtitle: 'Ingresa los datos de tu cuenta' },
  { title: 'Información Personal', icon: 'tabler-user', subtitle: 'Completa tu información personal' }
]

// Datos iniciales centralizados
const initialFormData = {
  // Paso 1
  username: '',
  email: '',
  confirmEmail: '',

  // Paso 2
  firstName: '',
  lastName: '',
  mobile: '',
  street: '',
  number: '',
  zone: '',
  neighborhood: '',
  landmark: '',
  city: '',
  state: ''
}

const Step = styled(MuiStep)<StepProps>(({ theme }) => ({
  paddingInline: theme.spacing(7),
  paddingBlock: theme.spacing(1),
  '& + i': {
    color: 'var(--mui-palette-text-secondary)'
  },
  '&:first-of-type': { paddingInlineStart: 0 },
  '&:last-of-type': { paddingInlineEnd: 0 },
  '& .MuiStepLabel-iconContainer': { display: 'none' },
  '&.Mui-completed .step-title, &.Mui-completed .step-subtitle': {
    color: 'var(--mui-palette-text-disabled)'
  },
  '&.Mui-completed + i': {
    color: 'var(--mui-palette-primary-main)'
  },
  [theme.breakpoints.down('md')]: {
    padding: 0,
    ':not(:last-of-type)': {
      marginBlockEnd: theme.spacing(6)
    }
  }
}))

const RegisterMultiSteps = ({ mode }: { mode: SystemMode }) => {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [formData, setFormData] = useState<any>(initialFormData)
  const { esperar, finEspera } = useLoading()
  const lightImg = '/images/project/logo.png'
  const darkImg = '/images/project/logoWhite.png'

  const { settings } = useSettings()
  const theme = useTheme()
  const router = useRouter()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleNext = () => setActiveStep(prev => prev + 1)
  const handlePrev = () => setActiveStep(prev => (prev !== 0 ? prev - 1 : prev))

  const handleCancel = () => {
    router.push('/login')
  }

  const handleSave = async () => {
  try {
    esperar()

    // Adaptar payload a lo que espera la API
    const payload = {
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      realmRoles: ["client-one21"], // 🔥 fijo
    }

    console.log("Guardando datos...", payload)

    const res = await fetch("/api/externos/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("Error:", data)
      finEspera()

      if (data.step === "user") {
        showAlert("error", `Error en Usuario: ${data.message}`)
      } else if (data.step === "partner") {
        showAlert("error", `Error en Socio de negocio: ${data.message}`)
      } else if (data.step === "address") {
        showAlert("error", `Error en Dirección: ${data.message}`)
      } else {
        showAlert("error", `Error: ${data.message || 'Error desconocido'}`)
      }

      return
    }


    console.log("Usuario creado con éxito:", data)
    finEspera()
    showAlert("success", "Usuario registrado con éxito. Revisa tu email para más instrucciones.")

    router.push("/register/confirmation")
  } catch (error) {
    console.error("Error en handleSave:", error)
    showAlert("error", "Error inesperado al guardar usuario")
  }
}


  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepAccountDetails
            handleNext={handleNext}
            handleCancel={handleCancel}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 1:
        return (
          <StepPersonalInfo
            handlePrev={handlePrev}
            handleSave={handleSave}
            handleCancel={handleCancel}
            formData={formData}
            setFormData={setFormData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex bs-full justify-between items-center">
      <div
        className={classnames(
          'flex bs-full items-center justify-center is-[29rem] lg:is-[38rem] relative p-6 max-lg:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <RegisterIllustration
          src={authBackground}
          alt="auth-background"
          className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
        />
      </div>

      <div className="flex flex-1 justify-center items-center bs-full bg-backgroundPaper">
        <Link
          href={getLocalizedUrl()}
          className="absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]"
        >
          <Logo />
        </Link>
        <StepperWrapper className="p-6 sm:p-8 max-is-[46.25rem] mbs-11 sm:mbs-14 lg:mbs-0">
          <Stepper
            activeStep={activeStep}
            connector={
              !isSmallScreen ? (
                <DirectionalIcon
                  ltrIconClass="tabler-chevron-right"
                  rtlIconClass="tabler-chevron-left"
                  className="text-xl"
                />
              ) : null
            }
            className="mbe-6 md:mbe-12"
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>
                  <div className="step-label">
                    <CustomAvatar
                      variant="rounded"
                      skin={activeStep === index ? 'filled' : 'light'}
                      {...(activeStep >= index && { color: 'primary' })}
                      {...(activeStep === index && { className: 'shadow-primarySm' })}
                      size={38}
                    >
                      <i className={classnames(step.icon, 'text-[22px]')} />
                    </CustomAvatar>
                    <div>
                      <Typography className="step-title">{step.title}</Typography>
                      <Typography className="step-subtitle">{step.subtitle}</Typography>
                    </div>
                  </div>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
        </StepperWrapper>
      </div>
    </div>
  )
}

export default RegisterMultiSteps

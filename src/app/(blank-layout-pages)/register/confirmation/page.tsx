'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { getLocalizedUrl } from '@/utils/i18n'

const ConfirmationPage = () => {
  const router = useRouter()
  const [countdown, setCountdown] = useState(30)

  // Disminuir el contador cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push(getLocalizedUrl())
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-backgroundPaper text-center p-6">
      <Typography variant="h4" gutterBottom>
        Verifica tu correo electrónico
      </Typography>
      <Typography variant="body1" className="mb-6">
        Hemos enviado un enlace de verificación a tu bandeja de entrada.
        Esta pantalla desaparecerá automáticamente en {countdown} segundos.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push(getLocalizedUrl())}
      >
        Ir a login ahora
      </Button>
    </div>
  )
}

export default ConfirmationPage

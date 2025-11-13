'use client'

import { useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

// Lista de rutas que no queremos proteger con esta lógica.
const unprotectedPaths = ['/login', '/forgot-password']

export function NavigationGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // No hacer nada si estamos en una ruta no protegida.
    if (unprotectedPaths.includes(pathname)) {
      return
    }

    // Obtener el dominio de la página anterior (referrer).
    const referrer = document.referrer ? new URL(document.referrer).hostname : null
    const currentHost = window.location.hostname

    // Si el referrer no es el mismo host, redirigir a /inicio.
    // Esto bloquea la navegación directa, recargas (F5) y bookmarks.
    if (referrer !== currentHost) {
      router.replace('/inicio')
    }
  }, [pathname, router])

  return <>{children}</>
}

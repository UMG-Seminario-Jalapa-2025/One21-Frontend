'use client'

import { useEffect, useState } from 'react'

import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// =================== Tipos ===================
export type UserRole = 'admin' | 'manager' | 'employee' | 'client'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions?: string[]
  empleadoId?: number
}

interface RoleBasedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]        // roles permitidos
  requiredPermissions?: string[]   // permisos necesarios
  fallbackPath?: string            // ruta de redirección (opcional)
  showFallback?: boolean           // mostrar pantalla de acceso denegado
}

// =================== Componente ===================
const RoleBasedRoute = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  showFallback = true
}: RoleBasedRouteProps) => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // 🔹 Obtener token del almacenamiento local
        const token =
          localStorage.getItem('auth_token') ||
          sessionStorage.getItem('auth_token')

        if (!token) {
          setAuthorized(false)
          setLoading(false)

          return
        }

        // 🔹 Simulación de usuario (aquí podrías hacer un fetch a tu API)
        const userData: User = {
          id: '1',
          name: 'Empleado Actual',
          email: 'empleado@empresa.com',
          role: 'employee',
          empleadoId: 1,
          permissions: ['tickets.read', 'kanban.access']
        }

        setUser(userData)

        // 🔹 Verificar roles permitidos
        const hasRole =
          allowedRoles.length === 0 || allowedRoles.includes(userData.role)

        // 🔹 Verificar permisos
        const hasPermissions =
          requiredPermissions.length === 0 ||
          requiredPermissions.every(permission =>
            userData.permissions?.includes(permission)
          )

        // 🔹 Establecer si el usuario está autorizado
        setAuthorized(hasRole && hasPermissions)
      } catch (error) {
        console.error('Error verificando autorización:', error)
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [allowedRoles, requiredPermissions])

  // =================== Estados visuales ===================

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando permisos...
        </Typography>
      </Box>
    )
  }

  if (!authorized) {
    if (showFallback) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          textAlign="center"
        >
          <Typography variant="h4" color="error" gutterBottom>
            Acceso Denegado
          </Typography>
          <Typography variant="body1">
            No tienes permisos suficientes para acceder a esta página.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Contacta al administrador si crees que esto es un error.
          </Typography>
        </Box>
      )
    }

    return null
  }

  // =================== Si está autorizado ===================
  return <>{children}</>
}

export default RoleBasedRoute

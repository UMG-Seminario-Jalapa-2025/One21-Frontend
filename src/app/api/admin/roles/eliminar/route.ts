import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to parse response data
async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type')
  
  if (contentType?.includes('application/json')) {
    return await response.json()
  }
  
  return { message: await response.text() }
}

// Helper function to validate token from cookies
function getTokenFromCookies(req: NextRequest) {
  const token = req.cookies.get('one21_token')?.value
  
  if (!token) {
    return NextResponse.json(
      { step: 'auth', message: 'Token no encontrado. Por favor inicia sesión.' },
      { status: 401 }
    )
  }
  
  return token
}

// Helper function to delete role
async function deleteRole(baseUrl: string, token: string, roleName: string) {
  return await fetch(`${baseUrl}admin/roles/${roleName}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle role deletion error
function handleRoleError(roleData: any, status: number) {
  return NextResponse.json(
    {
      step: 'role',
      error: roleData?.error || 'role_error',
      message: roleData?.detail || roleData?.message || 'Error al eliminar rol'
    },
    { status }
  )
}

export async function DELETE(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)
    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }
    const token = tokenResult

    // Get role name from query params
    const { searchParams } = new URL(req.url)
    const roleName = searchParams.get('name')

    // Validate role name
    if (!roleName) {
      return NextResponse.json(
        { step: 'validation', message: 'El nombre del rol es requerido' },
        { status: 400 }
      )
    }

    // Delete role
    const roleRes = await deleteRole(baseUrl, token, roleName)
    const roleResData = await parseResponse(roleRes)

    // Handle error response
    if (!roleRes.ok) {
      return handleRoleError(roleResData, roleRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Rol eliminado con éxito', data: roleResData },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/admin/roles/eliminar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

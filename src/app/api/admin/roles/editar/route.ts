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

// Helper function to update role
async function updateRole(baseUrl: string, token: string, roleName: string, roleData: any) {
  return await fetch(`${baseUrl}admin/roles/${roleName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(roleData)
  })
}

// Helper function to handle role update error
function handleRoleError(roleData: any, status: number) {
  return NextResponse.json(
    {
      step: 'role',
      error: roleData?.error || 'role_error',
      message: roleData?.detail || roleData?.message || 'Error al editar rol'
    },
    { status }
  )
}

// Helper function to get role name from query params
function getRoleNameFromQuery(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const roleName = searchParams.get('name')

  if (!roleName) {
    return NextResponse.json(
      { step: 'validation', message: 'El nombre del rol es requerido' },
      { status: 400 }
    )
  }

  return roleName
}

// Helper function to prepare role data from request body
function prepareRoleData(body: any) {
  const roleData: any = {}

  if (body.newName) {
    roleData.newName = body.newName
  }

  if (body.description !== undefined) {
    roleData.description = body.description
  }

  return roleData
}

// Helper function to validate role data
function validateRoleData(roleData: any) {
  if (Object.keys(roleData).length === 0) {
    return NextResponse.json(
      { step: 'validation', message: 'Debe proporcionar al menos un campo para actualizar' },
      { status: 400 }
    )
  }

  return null
}

export async function PUT(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    // Get role name from query params
    const roleNameResult = getRoleNameFromQuery(req)

    if (roleNameResult instanceof NextResponse) {
      return roleNameResult
    }

    const roleName = roleNameResult

    // Get request body and prepare role data
    const body = await req.json()
    const roleData = prepareRoleData(body)

    // Validate role data
    const validationError = validateRoleData(roleData)
    
    if (validationError) {
      return validationError
    }

    // Update role
    const roleRes = await updateRole(baseUrl, token, roleName, roleData)
    const roleResData = await parseResponse(roleRes)

    // Handle error response
    if (!roleRes.ok) {
      return handleRoleError(roleResData, roleRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Rol editado con éxito', data: roleResData },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/admin/roles/editar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

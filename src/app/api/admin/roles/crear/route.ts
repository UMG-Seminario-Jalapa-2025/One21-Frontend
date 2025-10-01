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

// Helper function to create role
async function createRole(baseUrl: string, token: string, roleData: any) {
  return await fetch(`${baseUrl}admin/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(roleData)
  })
}

// Helper function to handle role creation error
function handleRoleError(roleData: any, status: number) {
  return NextResponse.json(
    {
      step: 'role',
      error: roleData?.error || 'role_error',
      message: roleData?.detail || roleData?.message || 'Error al crear rol'
    },
    { status }
  )
}

export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)
    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }
    const token = tokenResult

    // Get request body
    const body = await req.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { step: 'validation', message: 'El nombre del rol es requerido' },
        { status: 400 }
      )
    }

    // Prepare role data
    const roleData = {
      name: body.name,
      description: body.description || ''
    }

    // Create role
    const roleRes = await createRole(baseUrl, token, roleData)
    const roleResData = await parseResponse(roleRes)

    // Handle error response
    if (!roleRes.ok) {
      return handleRoleError(roleResData, roleRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Rol creado con éxito', data: roleResData },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error en /api/admin/roles/crear:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

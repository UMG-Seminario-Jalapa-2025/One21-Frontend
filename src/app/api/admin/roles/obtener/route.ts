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

// Helper function to fetch roles
async function fetchRoles(baseUrl: string, token: string) {
  return await fetch(`${baseUrl}admin/roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle roles response error
function handleRolesError(rolesData: any, status: number) {
  return NextResponse.json(
    {
      step: 'roles',
      error: rolesData?.error || 'roles_error',
      message: rolesData?.detail || rolesData?.message || 'Error al obtener roles'
    },
    { status }
  )
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }
    
    const token = tokenResult

    // Fetch roles
    const rolesRes = await fetchRoles(baseUrl, token)
    const rolesData = await parseResponse(rolesRes)

    // Handle error response
    if (!rolesRes.ok) {
      return handleRolesError(rolesData, rolesRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Roles obtenidos con éxito', data: rolesData },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/admin/roles/obtener:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

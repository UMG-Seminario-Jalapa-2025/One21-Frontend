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

// Helper function to fetch categories
async function fetchCategories(baseUrl: string, token: string) {
  return await fetch(`${baseUrl}categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle categories error
function handleCategoriesError(categoriesData: any, status: number) {
  return NextResponse.json(
    {
      step: 'categories',
      error: categoriesData?.error || 'categories_error',
      message: categoriesData?.detail || categoriesData?.message || 'Error al obtener categorías'
    },
    { status }
  )
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    // Fetch categories
    const categoriesRes = await fetchCategories(baseUrl, token)
    const categoriesData = await parseResponse(categoriesRes)

    // Handle error response
    if (!categoriesRes.ok) {
      return handleCategoriesError(categoriesData, categoriesRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Categorías obtenidas con éxito', data: categoriesData },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/tickets/categorias/obtener:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

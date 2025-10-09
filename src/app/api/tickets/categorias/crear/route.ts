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

// Helper function to validate category data
function validateCategoryData(body: any) {
  if (!body.code || !body.code.trim()) {
    return NextResponse.json(
      { step: 'validation', message: 'El código es requerido' },
      { status: 400 }
    )
  }

  if (!body.name || !body.name.trim()) {
    return NextResponse.json(
      { step: 'validation', message: 'El nombre es requerido' },
      { status: 400 }
    )
  }

  if (!body.description || !body.description.trim()) {
    return NextResponse.json(
      { step: 'validation', message: 'La descripción es requerida' },
      { status: 400 }
    )
  }

  if (body.isActive === undefined || body.isActive === null) {
    return NextResponse.json(
      { step: 'validation', message: 'El estado es requerido' },
      { status: 400 }
    )
  }

  return null
}

// Helper function to prepare category data
function prepareCategoryData(body: any) {
  const now = new Date().toISOString()

  return {
    code: body.code.trim(),
    name: body.name.trim(),
    description: body.description.trim(),
    isActive: Boolean(body.isActive),
    createdAt: now,
    updatedAt: now
  }
}

// Helper function to create category
async function createCategory(baseUrl: string, token: string, categoryData: any) {
  return await fetch(`${baseUrl}categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  })
}

// Helper function to handle category error
function handleCategoryError(categoryData: any, status: number) {
  return NextResponse.json(
    {
      step: 'category',
      error: categoryData?.error || 'category_error',
      message: categoryData?.detail || categoryData?.message || 'Error al crear categoría'
    },
    { status }
  )
}

export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    // Get request body
    const body = await req.json()

    // Validate category data
    const validationError = validateCategoryData(body)
    
    if (validationError) {
      return validationError
    }

    // Prepare category data
    const categoryData = prepareCategoryData(body)

    // Create category
    const categoryRes = await createCategory(baseUrl, token, categoryData)
    const categoryResData = await parseResponse(categoryRes)

    // Handle error response
    if (!categoryRes.ok) {
      return handleCategoryError(categoryResData, categoryRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Categoría creada con éxito', data: categoryResData },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error en /api/tickets/categorias/crear:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

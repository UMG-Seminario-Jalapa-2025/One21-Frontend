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

// Helper function to get category ID from query params
function getCategoryIdFromQuery(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('id')

  if (!categoryId) {
    return NextResponse.json(
      { step: 'validation', message: 'El ID de la categoría es requerido' },
      { status: 400 }
    )
  }

  return categoryId
}

// Helper function to delete category
async function deleteCategory(baseUrl: string, token: string, categoryId: string) {
  return await fetch(`${baseUrl}categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

// Helper function to handle category error
function handleCategoryError(categoryData: any, status: number) {
  return NextResponse.json(
    {
      step: 'category',
      error: categoryData?.error || 'category_error',
      message: categoryData?.detail || categoryData?.message || 'Error al eliminar categoría'
    },
    { status }
  )
}

export async function DELETE(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_TICKETS_URL || 'http://localhost:8081/tickets/'

    // Validate and get token
    const tokenResult = getTokenFromCookies(req)

    if (tokenResult instanceof NextResponse) {
      return tokenResult
    }

    const token = tokenResult

    // Get category ID from query params
    const categoryIdResult = getCategoryIdFromQuery(req)

    if (categoryIdResult instanceof NextResponse) {
      return categoryIdResult
    }
    
    const categoryId = categoryIdResult

    // Delete category
    const categoryRes = await deleteCategory(baseUrl, token, categoryId)
    const categoryResData = await parseResponse(categoryRes)

    // Handle error response
    if (!categoryRes.ok) {
      return handleCategoryError(categoryResData, categoryRes.status)
    }

    // Success response
    return NextResponse.json(
      { message: 'Categoría eliminada con éxito', data: categoryResData },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/tickets/categorias/eliminar:', err)

    return NextResponse.json(
      { step: 'server', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

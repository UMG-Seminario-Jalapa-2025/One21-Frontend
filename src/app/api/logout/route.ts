import { NextResponse } from 'next/server'

import { serialize } from 'cookie'

export async function POST() {
  const cookiesToDelete = ['one21_token', 'one21_email', 'one21_partner', 'one21_roles']

  const response = NextResponse.json({ message: 'Sesión cerrada correctamente' })

  cookiesToDelete.forEach(cookieName => {
    response.headers.append(
      'Set-Cookie',
      serialize(cookieName, '', {
        httpOnly: true,
        secure: false, 
        maxAge: 0,
        path: '/',
        sameSite: 'lax'
      })
    )
  })

  return response
}

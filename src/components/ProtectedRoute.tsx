import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedRouteServer({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(process.env.AUTH_COOKIE_NAME || 'one21_token')


  if (!token?.value) {
    redirect('/login')
  }

  return <>{children}</>
}

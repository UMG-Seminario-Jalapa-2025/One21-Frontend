// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// 🔹 NUEVOS IMPORTS
import { LoadingProvider } from '@/components/ui/LoadingModal'
import AlertProvider from '@/components/ui/AlertProvider'

export const metadata = {
  title: 'One21 ERP - Bienvenido',
  description:
    'One21 ERP - Bienvenido - es la plantilla de panel de administración más amigable para desarrolladores y altamente personalizable basada en MUI v5.'
}

const RootLayout = async (props: ChildrenType) => {
  const { children } = props

  // Vars
  const systemMode = await getSystemMode()
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <LoadingProvider>
          {children}
          <AlertProvider />
        </LoadingProvider>
      </body>
    </html>
  )
}

export default RootLayout

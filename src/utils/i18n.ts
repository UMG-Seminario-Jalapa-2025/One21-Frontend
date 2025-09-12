// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { ensurePrefix } from '@/utils/string'

// Check if the url is missing the locale
export const isUrlMissingLocale = (url: string) => {
  return i18n.locales.every(
    locale => !(url.startsWith(`/${locale}/`) || url === `/${locale}`)
  )
}

// Get the localized url (SIN idiomas)
export const getLocalizedUrl = (url: string): string => {
  // Excepción: siempre redirigir a /login si no hay ruta o si es home
  if (!url || url === '/' || url === '/home') {
    return '/login'
  }

  // 🔹 Ya no agregamos locale
  return ensurePrefix(url, '/')
}

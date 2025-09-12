// Config Imports
import { i18n } from '@configs/i18n'

// Check if the url is missing the locale
export const isUrlMissingLocale = (url: string) => {
  return i18n.locales.every(
    locale => !(url.startsWith(`/${locale}/`) || url === `/${locale}`)
  )
}

export const getLocalizedUrl = (): string => {
  // Siempre redirigir a /login
  return '/login'
}

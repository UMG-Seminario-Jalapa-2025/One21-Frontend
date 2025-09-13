// utils/i18n.ts

import { i18n } from '@configs/i18n'

// Verifica si falta el locale en la URL
export const isUrlMissingLocale = (url: string) => {
  return i18n.locales.every(
    locale => !(url.startsWith(`/${locale}/`) || url === `/${locale}`)
  )
}

// Siempre redirigir a /login
export const getLocalizedUrl = (): string => '/login'

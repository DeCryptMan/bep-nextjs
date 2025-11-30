import 'server-only'
import type { Locale } from '@/i18n-config'
import { i18n } from '@/i18n-config'

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  hy: () => import('@/dictionaries/hy.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale | string) => {
  // Если пришел неизвестный язык (например "404" или "admin"), отдаем язык по умолчанию (hy)
  // @ts-ignore
  if (!i18n.locales.includes(locale)) {
    console.warn(`⚠️ Unknown locale requested: "${locale}". Fallback to default.`)
    return dictionaries[i18n.defaultLocale]()
  }
  
  // @ts-ignore
  return dictionaries[locale]()
}
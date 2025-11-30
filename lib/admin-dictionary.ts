import 'server-only'
import { cookies } from 'next/headers'

// 1. Статический импорт (Самый надежный способ)
import hy from '@/dictionaries/hy.json'
import en from '@/dictionaries/en.json'

// Типизация для словарей
type Dictionary = typeof hy

const dictionaries: Record<string, Dictionary> = {
  hy,
  en
}

export async function getAdminDictionary() {
  const cookieStore = await cookies()
  const localeValue = cookieStore.get('admin_locale')?.value
  
  // 2. Жесткая логика выбора языка
  // Если куки нет или она левая - берем 'hy'
  const lang = (localeValue === 'en') ? 'en' : 'hy'
  
  // 3. Получаем словарь синхронно
  const dict = dictionaries[lang]

  // 4. Проверка на случай ядерной войны (если JSON пустой)
  if (!dict) {
    console.error("🔥 CRITICAL: Dictionary not found for lang:", lang)
    return { dict: dictionaries['hy'], lang: 'hy' }
  }

  return { dict, lang }
}
import { prisma } from '@/lib/db'
import EventsClient from '@/components/admin/EventsClient'
import { getAdminDictionary } from '@/lib/admin-dictionary'

export const revalidate = 0

export default async function EventsPage() {
  // 1. Загружаем словарь
  const { dict } = await getAdminDictionary()
  
  // 2. ОТЛАДКА: Проверяем в консоли сервера (терминале), есть ли данные
  if (!dict?.admin?.events) {
    console.error("❌ SERVER ERROR: dict.admin.events is MISSING in EventsPage", JSON.stringify(dict).substring(0, 100))
  } else {
    console.log("✅ SERVER SUCCESS: Dictionary loaded correctly for EventsPage")
  }

  // 3. Загружаем события
  const events = await prisma.event.findMany({ orderBy: { event_date: 'desc' } })
  
  // 4. Передаем клиенту
  return <EventsClient events={JSON.parse(JSON.stringify(events))} dict={dict} />
}
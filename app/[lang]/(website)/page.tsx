import { prisma } from '@/lib/db'
import HomeClient from '@/components/HomeClient'
import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/i18n-config'

// Отключаем кеширование
export const revalidate = 0 

export default async function Home({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}) {
  const { lang } = await params

  const [events, news, gallery, dict, settings] = await Promise.all([
    prisma.event.findMany({ 
      where: { event_date: { gte: new Date() } }, 
      orderBy: { event_date: 'asc' }, 
      take: 10 
    }),
    prisma.news.findMany({ 
      orderBy: { publish_date: 'desc' }, 
      take: 3 
    }),
    prisma.gallery.findMany({ 
      orderBy: { created_at: 'desc' }, 
      take: 6 
    }),
    getDictionary(lang as Locale),
    prisma.homeSettings.findFirst()
  ])

  return (
    <HomeClient 
      initialEvents={JSON.parse(JSON.stringify(events))} 
      initialNews={JSON.parse(JSON.stringify(news))} 
      initialGallery={JSON.parse(JSON.stringify(gallery))}
      dict={dict} 
      lang={lang}
      settings={settings ? JSON.parse(JSON.stringify(settings)) : null}
    />
  )
}
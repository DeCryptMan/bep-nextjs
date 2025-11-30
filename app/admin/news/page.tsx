import { prisma } from '@/lib/db'
import NewsClient from '@/components/admin/NewsClient'
import { getAdminDictionary } from '@/lib/admin-dictionary'

export const revalidate = 0

export default async function NewsPage() {
  const { dict } = await getAdminDictionary()
  const news = await prisma.news.findMany({ orderBy: { publish_date: 'desc' } })
  return <NewsClient news={JSON.parse(JSON.stringify(news))} dict={dict} />
}
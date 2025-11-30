import { prisma } from '@/lib/db'
import GalleryClient from '@/components/GalleryClient'
import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/i18n-config'

export const revalidate = 0 

export default async function GalleryPage({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}) {
  const { lang } = await params

  const [gallery, dict] = await Promise.all([
    prisma.gallery.findMany({ 
      orderBy: { created_at: 'desc' } 
    }),
    getDictionary(lang as Locale)
  ])

  return (
    <GalleryClient 
      initialGallery={JSON.parse(JSON.stringify(gallery))}
      dict={dict}
    />
  )
}
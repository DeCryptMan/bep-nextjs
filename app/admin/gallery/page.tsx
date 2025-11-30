import { prisma } from '@/lib/db'
import GalleryAdminClient from '@/components/admin/GalleryAdminClient'
import { getAdminDictionary } from '@/lib/admin-dictionary'

export const revalidate = 0

export default async function GalleryAdmin() {
  const { dict } = await getAdminDictionary()
  const gallery = await prisma.gallery.findMany({ 
    orderBy: { created_at: 'desc' } 
  })
  return <GalleryAdminClient gallery={JSON.parse(JSON.stringify(gallery))} dict={dict} />
}
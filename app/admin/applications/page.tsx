import { prisma } from '@/lib/db'
import { getAdminDictionary } from '@/lib/admin-dictionary'
import ApplicationTable from '@/components/admin/ApplicationTable'

export const revalidate = 0

export default async function ApplicationsPage() {
  const { dict } = await getAdminDictionary()
  const apps = await prisma.application.findMany({ 
    orderBy: { created_at: 'desc' } 
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#0f172a]">{dict.admin.applications.title}</h1>
        <p className="text-gray-500">{dict.admin.applications.subtitle}</p>
      </div>
      
      <ApplicationTable applications={JSON.parse(JSON.stringify(apps))} dict={dict} />
    </div>
  )
}
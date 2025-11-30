import { prisma } from '@/lib/db'
import Link from 'next/link'
import { getAdminDictionary } from '@/lib/admin-dictionary'
import { ArrowUpRight, Users, Calendar, FileText, Image as ImageIcon } from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboard() {
  const { dict } = await getAdminDictionary()
  const t = dict.admin.dashboard

  const [eventsCount, newsCount, galleryCount, appsCount, recentApps, upcomingEvents] = await Promise.all([
    prisma.event.count(),
    prisma.news.count(),
    prisma.gallery.count(),
    prisma.application.count(),
    prisma.application.findMany({ orderBy: { created_at: 'desc' }, take: 5 }),
    prisma.event.findMany({ where: { event_date: { gte: new Date() } }, orderBy: { event_date: 'asc' }, take: 3 })
  ])

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-extrabold text-[#0f172a]">{t.title}</h1>
            <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t.stats.apps} count={appsCount} icon={FileText} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title={t.stats.events} count={eventsCount} icon={Calendar} color="text-green-600" bg="bg-green-50" />
        <StatCard title={t.stats.news} count={newsCount} icon={ArrowUpRight} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title={t.stats.media} count={galleryCount} icon={ImageIcon} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Apps */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">{t.new_apps}</h3>
                <Link href="/admin/applications" className="text-sm text-[#253894] font-bold hover:underline">{t.all_apps_link}</Link>
            </div>
            <div className="space-y-4">
                {recentApps.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">{t.no_new_apps}</p>
                ) : (
                    recentApps.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50/50 transition cursor-default group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-[#253894] shadow-sm border border-gray-100">
                                    {app.full_name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm group-hover:text-[#253894] transition">{app.full_name}</p>
                                    <p className="text-xs text-gray-500">{app.college}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono text-gray-400 block mb-1">{new Date(app.created_at).toLocaleDateString()}</span>
                                <span className="inline-block px-2 py-1 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-500">{t.new_badge}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Events */}
        <div className="bg-[#253894] rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h3 className="font-bold text-lg mb-6 relative z-10">{t.upcoming_events}</h3>
            <div className="space-y-6 relative z-10">
                {upcomingEvents.length === 0 ? (
                    <p className="text-blue-200/60">{t.no_events}</p>
                ) : (
                    upcomingEvents.map(event => (
                        <div key={event.id} className="flex gap-4 items-start">
                            <div className="bg-white/20 rounded-xl p-2 text-center min-w-[50px] backdrop-blur-sm">
                                <span className="block text-xl font-bold">{new Date(event.event_date).getDate()}</span>
                                <span className="block text-[10px] uppercase opacity-80">{new Date(event.event_date).toLocaleDateString('ru', { month: 'short' })}</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm leading-tight mb-1">{event.title}</p>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-blue-100 uppercase tracking-wide">{event.type}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Link href="/admin/events" className="mt-8 block w-full py-3 bg-white text-[#253894] text-center rounded-xl font-bold text-sm hover:bg-gray-100 transition relative z-10">
                {t.manage_calendar}
            </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, count, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:translate-y-[-2px] transition-transform">
            <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-extrabold text-gray-800">{count}</p>
            </div>
        </div>
    )
}
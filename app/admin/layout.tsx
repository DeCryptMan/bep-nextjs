import Link from 'next/link'
import { logoutAction, setAdminLocale } from './actions'
import { getSession } from '@/lib/session'
import { getAdminDictionary } from '@/lib/admin-dictionary'
import { LayoutDashboard, FileText, Calendar, Image as ImageIcon, Newspaper, LogOut, Settings } from 'lucide-react'

// Клиентский компонент для переключателя языка
function LangSwitcher({ current }: { current: string }) {
  return (
    <form className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
      <button 
        formAction={async () => { "use server"; await setAdminLocale('hy') }}
        className={`px-2 py-1 text-xs font-bold rounded-md transition ${current === 'hy' ? 'bg-white text-[#63A900] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
      >
        HY
      </button>
      <button 
        formAction={async () => { "use server"; await setAdminLocale('en') }}
        className={`px-2 py-1 text-xs font-bold rounded-md transition ${current === 'en' ? 'bg-white text-[#253894] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
      >
        EN
      </button>
    </form>
  )
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) return <>{children}</>

  const { dict, lang } = await getAdminDictionary()
  const t = dict.admin.sidebar

  const menu = [
    { name: t.dashboard, href: '/admin', icon: LayoutDashboard },
    { name: t.applications, href: '/admin/applications', icon: FileText },
    { name: t.events, href: '/admin/events', icon: Calendar },
    { name: t.news, href: '/admin/news', icon: Newspaper },
    { name: t.gallery, href: '/admin/gallery', icon: ImageIcon },
  ]

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col z-20 fixed h-full shadow-soft">
        <div className="h-24 flex items-center justify-between px-6 border-b border-gray-50">
           <div className="flex items-center">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#253894] to-[#63A900] flex items-center justify-center text-white font-bold text-lg mr-2 shadow-lg">S</div>
             <div>
               <span className="block font-extrabold text-[#0f172a] text-base tracking-tight">Student<span className="text-[#63A900]">Biz</span></span>
             </div>
           </div>
           {/* Lang Switcher */}
           <LangSwitcher current={lang} />
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-4 tracking-wider">{t.title_main}</p>
          {menu.map((item) => (
            <Link key={item.href} href={item.href} className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-500 hover:bg-[#253894]/5 hover:text-[#253894] transition-all font-medium">
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              {item.name}
            </Link>
          ))}
          
          <p className="text-xs font-bold text-gray-400 uppercase px-4 mt-8 mb-4 tracking-wider">{t.title_settings}</p>
          <Link href="/admin/settings" className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-500 hover:bg-[#253894]/5 hover:text-[#253894] transition-all font-medium">
              <Settings size={20} /> {t.settings}
          </Link>
        </nav>

        <div className="p-6 border-t border-gray-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">A</div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-700 truncate">{t.role}</p>
                <p className="text-xs text-gray-400 truncate">{t.sub_role}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button className="flex w-full items-center justify-center gap-2 px-4 py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition font-bold text-sm">
              <LogOut size={18} /> {t.logout}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-8 lg:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
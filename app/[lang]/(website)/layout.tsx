import Navbar from '@/components/Navbar'
import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/i18n-config'

export default async function WebsiteLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }> // Используем string вместо Locale для совместимости с Next.js build
}) {
  // Ждем параметры
  const { lang } = await params
  
  // Приводим к типу Locale (мы уверены в этом благодаря middleware)
  const dict = await getDictionary(lang as Locale)

  return (
    <>
      <Navbar dict={dict} lang={lang} />
      <div className="min-h-screen">
        {children}
      </div>
      
      <footer className="bg-[#253894] text-white py-16 border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#63A900] rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#253894] flex items-center justify-center font-bold text-2xl mb-6 shadow-2xl">S</div>
            <span className="text-3xl font-serif font-bold mb-4 tracking-tight">StudentBiz</span>
            <p className="text-blue-200 text-sm opacity-80 max-w-md text-center mb-8">
              {dict.footer.desc}
            </p>
            <div className="border-t border-blue-800/50 w-full pt-8 text-center text-blue-300/60 text-xs">
                &copy; 2025 Student Business Companies. {dict.footer.rights}
            </div>
        </div>
      </footer>
    </>
  )
}
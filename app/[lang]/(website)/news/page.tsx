import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { Locale } from '@/i18n-config'

const parseImages = (raw: any) => {
  let images: string[] = []
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(parsed)) {
      images = parsed
    } else {
      images = [raw as string]
    }
  } catch (e) {
    if (typeof raw === 'string') images = raw.split(',')
  }
  return images.filter(Boolean).map(img => {
      let url = img.trim()
      if (url.startsWith('http')) return url
      return `/${url.replace(/^\//, '')}`
    })
}

export const revalidate = 0 

export default async function NewsPage({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}) {
  const { lang } = await params

  const news = await prisma.news.findMany({
    orderBy: { publish_date: 'desc' }
  })

  const featured = news.length > 0 ? news[0] : null
  const others = news.length > 1 ? news.slice(1) : []

  return (
    <div className="flex flex-col min-h-screen bg-white">
        <header className="pt-32 pb-12 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-[#63A900] font-bold text-xs uppercase mb-2">Student Business Incubator</p>
                <h1 className="text-5xl font-serif font-bold text-[#253894]">Newsroom</h1>
                <div className="mt-6 h-1 w-[60px]" style={{ background: 'linear-gradient(90deg, #253894 0%, #63A900 100%)' }}></div>
            </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
            {news.length === 0 ? (
                <div className="text-center py-32 text-gray-400">
                    <p>No news yet / Նորություններ դեռ չկան</p>
                </div>
            ) : (
                <>
                    {featured && (() => {
                        const imgs = parseImages(featured.image_url)
                        const thumb = imgs[0] || '/placeholder.jpg'
                        const date = new Date(featured.publish_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        const item = featured as any
                        const title = lang === 'hy' ? item.title_hy : item.title_en
                        const content = lang === 'hy' ? item.content_hy : item.content_en
                        
                        return (
                            <Link href={`/${lang}/news/${featured.id}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20 cursor-pointer">
                                <div className="lg:col-span-7 h-[400px] rounded-xl overflow-hidden relative bg-gray-100">
                                    <Image src={thumb} alt={title || 'Featured News'} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute top-6 left-6 bg-[#63A900] text-white text-xs font-bold px-3 py-1.5 rounded uppercase">Featured</div>
                                </div>
                                <div className="lg:col-span-5 pr-4">
                                    <div className="text-sm text-gray-400 mb-4 font-bold">{date}</div>
                                    <h2 className="text-3xl font-bold text-[#253894] mb-4 group-hover:text-[#63A900] transition-colors">{title}</h2>
                                    <p className="text-gray-600 text-lg line-clamp-3 mb-8">{content}</p>
                                    <span className="text-[#253894] font-bold border-b-2 border-[#253894] pb-1 group-hover:border-[#63A900] group-hover:text-[#63A900] transition-all">
                                        {lang === 'hy' ? 'Կարդալ Ավելին' : 'Read More'}
                                    </span>
                                </div>
                            </Link>
                        )
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {others.map((rawItem) => {
                            const item = rawItem as any
                            const imgs = parseImages(item.image_url)
                            const thumb = imgs[0] || '/placeholder.jpg'
                            const title = lang === 'hy' ? item.title_hy : item.title_en
                            const content = lang === 'hy' ? item.content_hy : item.content_en

                            return (
                                <Link key={item.id} href={`/${lang}/news/${item.id}`} className="group flex flex-col h-full">
                                    <div className="h-56 rounded-lg overflow-hidden mb-6 relative bg-gray-100">
                                        <Image src={thumb} alt={title || 'News Image'} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#253894] mb-3 group-hover:text-[#63A900] transition-colors line-clamp-2">{title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 flex-1">{content}</p>
                                    <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400">NEWS</span>
                                        <span className="text-[#63A900] text-sm font-bold group-hover:translate-x-1 transition-transform">{lang === 'hy' ? 'Կարդալ' : 'Read'} &rarr;</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </>
            )}
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-400">
            &copy; 2025 StudentBiz Newsroom.
        </footer>
    </div>
  )
}
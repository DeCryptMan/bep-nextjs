import { prisma } from '@/lib/db'
import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/i18n-config'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Share2 } from 'lucide-react'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function SingleNewsPage({ 
  params 
}: { 
  params: Promise<{ lang: Locale, id: string }> 
}) {
  const { lang, id } = await params
  const dict = await getDictionary(lang)

  // Получаем новость
  const newsItem = await prisma.news.findUnique({
    where: { id: parseInt(id) }
  })

  if (!newsItem) return notFound()

  // Выбираем язык
  const title = lang === 'hy' ? newsItem.title_hy : newsItem.title_en
  const content = lang === 'hy' ? newsItem.content_hy : newsItem.content_en
  
  // Парсим картинки
  let images = []
  try {
    images = JSON.parse(newsItem.image_url as string)
    if(!Array.isArray(images)) images = [newsItem.image_url]
  } catch(e) { images = [] }
  
  if (images.length === 0) images = ['/placeholder.jpg']

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Breadcrumb */}
        <Link href={`/${lang}/news`} className="inline-flex items-center text-gray-500 hover:text-[#253894] transition mb-8 font-bold text-sm">
            <ArrowLeft size={16} className="mr-2"/> {dict.news.all_news}
        </Link>

        {/* Header */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#253894] mb-6 leading-tight">
            {title}
        </h1>

        <div className="flex items-center gap-4 text-gray-400 text-sm mb-10 border-b border-gray-100 pb-8">
            <span className="flex items-center gap-2"><Calendar size={16}/> {new Date(newsItem.publish_date).toLocaleDateString()}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-[#63A900] font-bold">News</span>
        </div>

        {/* Main Image / Slider */}
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 bg-gray-100 shadow-lg">
             {/* Если картинок много, можно сделать тут слайдер, но пока покажем первую */}
             <Image 
                src={images[0].startsWith('http') ? images[0] : images[0]} 
                alt={title} 
                fill 
                className="object-cover"
             />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
            {content}
        </div>

        {/* Gallery Grid (если картинок больше одной) */}
        {images.length > 1 && (
            <div className="mt-16 pt-16 border-t border-gray-100">
                <h3 className="font-bold text-2xl mb-6 text-[#0f172a]">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.slice(1).map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                            <Image 
                                src={img.startsWith('http') ? img : img} 
                                alt="" 
                                fill 
                                className="object-cover transition duration-500 group-hover:scale-110"
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  )
}
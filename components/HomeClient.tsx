"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { hy, enUS } from 'date-fns/locale'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ArrowRight, Calendar, ExternalLink, ChevronRight, ChevronLeft, Play, X } from 'lucide-react'

// --- Types ---
type Event = { id: number; title: string; event_date: string; type: string }
// Обновленный тип для новостей с учетом мультиязычности
type News = { 
  id: number; 
  title_en: string; 
  title_hy: string; 
  image_url: string; 
  content_en: string; 
  content_hy: string; 
  publish_date: string 
}
type Gallery = { id: number; type: string; media_url: string; caption: string }

// --- Helper: Parse Media ---
const parseMedia = (raw: string | any) => {
  let items: any[] = []
  try {
    items = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(items)) items = [items]
  } catch (e) {
    if (typeof raw === 'string') items = raw.split(',').map(s => s.trim())
  }

  return items.map(item => {
    let url = typeof item === 'string' ? item : item.url
    let type = typeof item === 'object' ? item.type : 'image'
    
    if (url && typeof url === 'string') {
        url = url.trim()
        if (!url.startsWith('http')) url = `/${url.replace(/^\/+/, '')}`
        
        if (/\.(mp4|mov|webm|avi)$/i.test(url)) type = 'video'
        else if (type !== 'video') type = 'image'
    } else {
        url = '/placeholder.jpg'
    }
    return { url, type }
  })
}

// --- Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

// --- Компонент карточки новости со слайдером ---
function NewsCardSlider({ item, lang, dict, dateLocale }: { item: News, lang: string, dict: any, dateLocale: any }) {
  const [index, setIndex] = useState(0)
  
  // Парсим картинки
  const images = parseMedia(item.image_url).map(m => m.url) // Берем только URL
  const displayImages = images.length > 0 ? images : ['/placeholder.jpg']

  // Авто-скролл
  useEffect(() => {
    if (displayImages.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayImages.length)
    }, 3000) // каждые 3 секунды
    return () => clearInterval(timer)
  }, [displayImages.length])

  // Выбор языка
  const title = lang === 'hy' ? item.title_hy : item.title_en
  const content = lang === 'hy' ? item.content_hy : item.content_en

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
        <div className="h-48 md:h-56 relative overflow-hidden bg-gray-100">
            {/* Картинки */}
            {displayImages.map((img: string, i: number) => (
                <Image 
                  key={i}
                  src={img} 
                  alt={title || 'News'}
                  fill
                  className={`object-cover transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}
            
            {/* Индикаторы (точки) если картинок > 1 */}
            {displayImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {displayImages.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                </div>
            )}
            
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#253894] text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">NEWS</div>
        </div>
        <div className="p-6 md:p-8 flex flex-col flex-1">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2">
                {format(new Date(item.publish_date), 'dd MMM yyyy', { locale: dateLocale })}
            </p>
            <h3 className="text-lg md:text-xl font-bold text-[#253894] mb-3 line-clamp-2 group-hover:text-[#63A900] transition-colors">
                <Link href={`/${lang}/news/${item.id}`}>{title}</Link>
            </h3>
            <p className="text-gray-500 text-xs md:text-sm line-clamp-3 mb-6 flex-1">
                {content}
            </p>
            <Link href={`/${lang}/news/${item.id}`} className="inline-flex items-center text-[#253894] font-bold text-xs md:text-sm hover:text-[#63A900]">
                {dict.news.read_more} <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
            </Link>
        </div>
    </motion.div>
  )
}

export default function HomeClient({ 
  initialEvents, 
  initialNews, 
  initialGallery, 
  dict, 
  lang,
  settings
}: { 
  initialEvents: Event[], 
  initialNews: News[], 
  initialGallery: Gallery[], 
  dict: any, 
  lang: string,
  settings: any
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentAlbum, setCurrentAlbum] = useState<{url: string, type: string}[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // --- CMS DATA ---
  const heroTitleStart = lang === 'hy' 
    ? (settings?.hero_title_hy || dict.hero.title_start) 
    : (settings?.hero_title_en || dict.hero.title_start)

  const heroTitleEnd = lang === 'hy' 
    ? (settings?.hero_subtitle_hy || dict.hero.title_end) 
    : (settings?.hero_subtitle_en || dict.hero.title_end)

  const heroDesc = lang === 'hy' 
    ? (settings?.hero_desc_hy || dict.hero.desc) 
    : (settings?.hero_desc_en || dict.hero.desc)

  const stat1Value = settings?.stat_1_value || "50+"
  const stat1Label = lang === 'hy' ? (settings?.stat_1_label_hy || dict.hero.stats_colleges) : (settings?.stat_1_label_en || dict.hero.stats_colleges)

  const stat2Value = settings?.stat_2_value || "120+"
  const stat2Label = lang === 'hy' ? (settings?.stat_2_label_hy || dict.hero.stats_startups) : (settings?.stat_2_label_en || dict.hero.stats_startups)

  const stat3Value = settings?.stat_3_value || "∞"
  const stat3Label = lang === 'hy' ? (settings?.stat_3_label_hy || dict.hero.stats_opps) : (settings?.stat_3_label_en || dict.hero.stats_opps)

  let sliderImages = parseMedia(settings?.slider_images || ['/uploads/1.jpg', '/uploads/2.jpg'])

  const dateLocale = lang === 'hy' ? hy : enUS

  // --- EFFECTS ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [sliderImages.length])

  // --- LIGHTBOX ---
  const openAlbum = (mediaRaw: string) => {
    const items = parseMedia(mediaRaw)
    setCurrentAlbum(items)
    setCurrentIndex(0)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setTimeout(() => setCurrentAlbum([]), 300)
    document.body.style.overflow = 'auto'
  }

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % currentAlbum.length)
  }

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + currentAlbum.length) % currentAlbum.length)
  }

  // --- CALENDAR ---
  const today = new Date()
  const currentMonthName = format(today, 'MMMM yyyy', { locale: dateLocale })
  const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, i + 1) 
      return format(d, 'EEEEEE', { locale: dateLocale }) 
  })

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstDayIndex = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
  const startPadding = firstDayIndex === 0 ? 6 : firstDayIndex - 1
  const calendarDays = [...Array(startPadding).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="overflow-x-hidden bg-[#f8fafc]">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[100dvh] md:min-h-[90vh] flex items-center pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 md:gap-12 items-center relative z-10">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 md:space-y-8 text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs md:text-sm font-bold text-[#253894] mx-auto lg:mx-0">
              <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#63A900] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-[#63A900]"></span>
              </span>
              {dict.hero.badge}
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0f172a] leading-[1.1] tracking-tight">
              {heroTitleStart} <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#253894] to-[#63A900]">
                {heroTitleEnd}
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed whitespace-pre-wrap mx-auto lg:mx-0">
              {heroDesc}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
              <Link href={`/${lang}/apply`} className="px-8 py-4 bg-[#253894] text-white rounded-xl md:rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:bg-[#1a2b7a] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                {dict.hero.btn_apply} <ArrowRight size={20} />
              </Link>
              <Link href={`/${lang}/news`} className="px-8 py-4 bg-white text-[#253894] border border-gray-200 rounded-xl md:rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                {dict.hero.btn_more} <ExternalLink size={18} />
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-8 border-t border-gray-200 grid grid-cols-3 gap-2 md:gap-8">
                <div><p className="text-2xl md:text-3xl font-bold text-[#253894]">{stat1Value}</p><p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">{stat1Label}</p></div>
                <div><p className="text-2xl md:text-3xl font-bold text-[#63A900]">{stat2Value}</p><p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">{stat2Label}</p></div>
                <div><p className="text-2xl md:text-3xl font-bold text-gray-800">{stat3Value}</p><p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">{stat3Label}</p></div>
            </motion.div>
          </motion.div>

          {/* Hero Slider */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/3] md:h-[600px] w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-[4px] md:border-[8px] border-white ring-1 ring-gray-100"
          >
             <div className="absolute inset-0 bg-gradient-to-t from-[#253894]/80 to-transparent z-10" />
             <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-20 text-white text-left">
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2 opacity-80">{dict.hero.slider_sub}</p>
                <h3 className="text-2xl md:text-4xl font-bold">{dict.hero.slider_caption}</h3>
             </div>

             <div className="relative w-full h-full bg-gray-200">
               {sliderImages.map((item: any, idx: number) => (
                 <Image 
                   key={idx}
                   src={item.url} 
                   fill
                   priority={idx === 0}
                   className={`object-cover transition-all duration-[1500ms] ease-in-out ${
                     idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                   }`}
                   alt="Hero Slide"
                   sizes="(max-width: 768px) 100vw, 50vw"
                 />
               ))}
             </div>
          </motion.div>

        </div>
      </section>

      {/* --- CALENDAR SECTION --- */}
      <section id="calendar" className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
             <div className="text-left">
                <span className="text-[#63A900] font-bold text-xs md:text-sm uppercase tracking-wider">{dict.calendar.title}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#253894] mt-2">{dict.calendar.subtitle}</h2>
             </div>
             <div className="flex flex-wrap gap-3 md:gap-4">
                <span className="flex items-center text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Deadline</span>
                <span className="flex items-center text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Meeting</span>
                <span className="flex items-center text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-[#63A900] mr-2"></span> Event</span>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Widget */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg md:text-xl font-bold text-gray-800 capitalize">{currentMonthName}</h3>
                 <span className="bg-blue-50 text-[#253894] px-3 py-1 rounded-full text-xs font-bold">{dict.calendar.today}</span>
               </div>
               <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                 {weekDays.map(d => <div key={d} className="text-[10px] md:text-xs font-bold text-gray-400 capitalize">{d}</div>)}
               </div>
               <div className="grid grid-cols-7 gap-1 md:gap-2">
                 {calendarDays.map((day, idx) => {
                    if (!day) return <div key={idx}></div>
                    const event = initialEvents.find(e => new Date(e.event_date).getDate() === day && new Date(e.event_date).getMonth() === today.getMonth())
                    let style = "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all mx-auto "
                    if(event) {
                       style += "text-white shadow-lg cursor-pointer hover:scale-110 "
                       style += event.type === 'deadline' ? 'bg-red-500' : event.type === 'meeting' ? 'bg-blue-500' : 'bg-[#63A900]'
                    } else if(day === today.getDate()) style += "border-2 border-[#253894] text-[#253894]"
                    else style += "text-gray-500 hover:bg-gray-50"
                    
                    return <div key={idx} className={style} title={event?.title}>{day}</div>
                 })}
               </div>
            </div>

            {/* Event List */}
            <div className="lg:col-span-2 space-y-4">
              {initialEvents.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl p-10 min-h-[200px]">
                    <Calendar size={40} className="mb-4 opacity-50"/>
                    <p>{dict.calendar.empty}</p>
                 </div>
              ) : (
                initialEvents.map((event, i) => (
                   <motion.div 
                     key={event.id}
                     initial={{ opacity: 0, x: 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     className="group flex items-center bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                   >
                      <div className={`w-1.5 h-12 rounded-full mr-4 md:mr-6 flex-shrink-0 ${
                         event.type === 'deadline' ? 'bg-red-500' : event.type === 'meeting' ? 'bg-blue-500' : 'bg-[#63A900]'
                      }`}></div>
                      <div className="text-center mr-4 md:mr-6 min-w-[50px] md:min-w-[60px]">
                         <div className="text-xl md:text-2xl font-bold text-gray-800">{new Date(event.event_date).getDate()}</div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">
                            {format(new Date(event.event_date), 'MMM', { locale: dateLocale })}
                         </div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-base md:text-lg font-bold text-[#253894] group-hover:text-[#63A900] transition-colors truncate">{event.title}</h4>
                         <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                            <span className="capitalize">{event.type}</span> • {format(new Date(event.event_date), 'EEEE', { locale: dateLocale })}
                         </p>
                      </div>
                      <ChevronRight className="text-gray-300 group-hover:text-[#253894] group-hover:translate-x-1 transition-all flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
                   </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- NEWS SECTION --- */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 md:mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-[#253894]">{dict.news.title} <span className="text-[#63A900]">{dict.news.subtitle}</span></h2>
             <Link href={`/${lang}/news`} className="hidden md:flex items-center text-[#253894] font-bold hover:text-[#63A900] transition">
               {dict.news.all_news} <ArrowRight size={18} className="ml-2"/>
             </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {initialNews.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-12">{dict.news.empty}</div>
            ) : (
                initialNews.map((item) => (
                    <NewsCardSlider 
                        key={item.id} 
                        item={item} 
                        lang={lang} 
                        dict={dict} 
                        dateLocale={dateLocale}
                    />
                ))
            )}
          </div>
          
          <div className="mt-8 md:mt-12 text-center md:hidden">
            <Link href={`/${lang}/news`} className="inline-block px-6 py-3 rounded-xl border border-gray-300 font-bold text-[#253894] active:bg-gray-50">
              {dict.news.all_news}
            </Link>
          </div>
        </div>
      </section>

      {/* --- GALLERY SECTION --- */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#253894]">{dict.gallery.title} <span className="text-[#63A900]">{dict.gallery.subtitle}</span></h2>
            <p className="text-gray-500 mt-4 text-base md:text-lg max-w-2xl mx-auto">{dict.gallery.desc}</p>
        </div>
        
        <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {initialGallery.map((item, i) => {
                const content = parseMedia(item.media_url)
                const cover = content[0] || { url: '/placeholder.jpg', type: 'image' }
                const isVideo = cover.type === 'video'
                const count = content.length

                return (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="relative aspect-[4/3] md:aspect-square rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-gray-100"
                        onClick={() => openAlbum(item.media_url)}
                    >
                        {isVideo ? (
                            <video src={cover.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" muted />
                        ) : (
                            <Image 
                              src={cover.url} 
                              alt="Gallery"
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {isVideo ? <Play className="text-white fill-current w-12 h-12"/> : <div className="text-white text-sm font-bold border border-white px-4 py-2 rounded-full backdrop-blur-md">View</div>}
                        </div>
                        {/* Counter Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[#253894] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm opacity-100 group-hover:opacity-0 transition-opacity">
                           {count > 1 ? `${count} items` : (isVideo ? 'VIDEO' : 'PHOTO')}
                        </div>
                    </motion.div>
                )
            })}
        </div>
        
        <div className="text-center mt-10 md:mt-12">
             <Link href={`/${lang}/gallery`} className="inline-block px-8 py-3 md:px-10 md:py-4 rounded-full border-2 border-[#253894] text-[#253894] font-bold hover:bg-[#253894] hover:text-white transition-all duration-300 shadow-lg transform hover:-translate-y-1">
                 {dict.gallery.view_all}
             </Link>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && currentAlbum.length > 0 && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                onClick={closeLightbox}
            >
                {/* Close Button */}
                <button className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white transition z-50 p-2">
                  <X className="w-8 h-8 md:w-10 md:h-10"/>
                </button>

                {/* Navigation Buttons */}
                {currentAlbum.length > 1 && (
                  <>
                    <button 
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 z-50 bg-black/20 hover:bg-black/50 rounded-full transition"
                    >
                      <ChevronLeft className="w-8 h-8 md:w-12 md:h-12"/>
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 z-50 bg-black/20 hover:bg-black/50 rounded-full transition"
                    >
                      <ChevronRight className="w-8 h-8 md:w-12 md:h-12"/>
                    </button>
                  </>
                )}

                {/* Counter */}
                {currentAlbum.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-bold bg-black/50 px-4 py-1 rounded-full">
                    {currentIndex + 1} / {currentAlbum.length}
                  </div>
                )}

                {/* Content */}
                <div className="max-w-6xl w-full h-full flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        {currentAlbum[currentIndex].type === 'video' ? (
                          <video controls autoPlay className="max-w-full max-h-[85vh] shadow-2xl rounded-lg outline-none bg-black">
                            <source src={currentAlbum[currentIndex].url} type="video/mp4" />
                          </video>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={currentAlbum[currentIndex].url} 
                            alt="Gallery Item" 
                            className="max-w-full max-h-[85vh] w-auto h-auto object-contain shadow-2xl rounded-lg select-none"
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

// --- Types ---
type GalleryItem = {
  id: number
  type: string
  media_url: string
  caption: string
}

// --- Helper: Parse Media (Возвращает массив объектов {url, type}) ---
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
        
        // Авто-определение видео по расширению, если тип не указан явно
        if (/\.(mp4|mov|webm|avi)$/i.test(url)) type = 'video'
        else if (type !== 'video') type = 'image'
    } else {
        url = '/placeholder.jpg'
    }

    return { url, type }
  })
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function GalleryClient({ 
  initialGallery, 
  dict 
}: { 
  initialGallery: GalleryItem[], 
  dict: any 
}) {
  const [filter, setFilter] = useState('all')
  
  // Состояние лайтбокса
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentAlbum, setCurrentAlbum] = useState<{url: string, type: string}[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const filteredGallery = initialGallery.filter(item => {
    if (filter === 'all') return true
    if (item.type === 'mixed') return true
    return item.type === filter
  })

  // Открытие альбома
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

  return (
    <div className="min-h-screen bg-[#f8fafc] py-32 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-bold text-[#253894]"
        >
           {dict.gallery.subtitle}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl md:text-6xl font-extrabold text-[#0f172a]"
        >
          {dict.gallery.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#253894] to-[#63A900]">{dict.gallery.subtitle}</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-2xl mx-auto text-lg"
        >
          {dict.gallery.desc}
        </motion.p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-4 mb-12">
        {['all', 'photo', 'video'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm ${
              filter === type 
                ? 'bg-[#253894] text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {type === 'all' ? dict.news.all_news : type === 'photo' ? 'Photo' : 'Video'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode='popLayout'>
          {filteredGallery.map((item) => {
            const content = parseMedia(item.media_url)
            const cover = content[0] || { url: '/placeholder.jpg', type: 'image' }
            const isVideoCover = cover.type === 'video'
            const count = content.length

            return (
              <motion.div
                layout
                key={item.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-gray-200 cursor-pointer"
                onClick={() => openAlbum(item.media_url)}
              >
                {isVideoCover ? (
                   <video src={cover.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" muted />
                ) : (
                   <Image 
                     src={cover.url} 
                     alt={item.caption}
                     fill
                     className="object-cover transition-transform duration-700 group-hover:scale-105"
                     sizes="(max-width: 768px) 100vw, 33vw"
                   />
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                   <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase mb-2">
                        {isVideoCover ? <Play size={12} fill="currentColor"/> : <Filter size={12}/>}
                        {item.type === 'mixed' ? 'ALBUM' : item.type}
                      </div>
                      <h3 className="text-white font-bold text-lg line-clamp-2">{item.caption}</h3>
                   </div>
                </div>

                {/* Counter Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[#253894] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm opacity-100 group-hover:opacity-0 transition-opacity">
                   {count > 1 ? `${count} items` : (isVideoCover ? 'VIDEO' : 'PHOTO')}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

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

                {/* Navigation Buttons (Show only if multiple items) */}
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
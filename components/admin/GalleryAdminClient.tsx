"use client"

import { useState } from 'react'
import { createGallery, deleteGallery } from '@/app/admin/actions'
import { Trash2, Upload, Film, Image as ImageIcon, Plus, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

type GalleryItem = {
  id: number
  type: string
  media_url: any
  caption: string
  created_at: string
}

export default function GalleryAdminClient({ gallery, dict }: { gallery: any[], dict: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const t = dict.admin.gallery

  const parseMedia = (item: any) => {
    let media = []
    if (Array.isArray(item.media_url)) {
        media = item.media_url
    } else {
        // Fallback for old format
        try { media = JSON.parse(item.media_url) } catch(e) {}
    }
    
    const first = media[0] || { url: '/placeholder.jpg', type: 'image' }
    let url = first.url || '/placeholder.jpg'
    if (url.startsWith('uploads')) url = '/' + url
    
    return { 
        url, 
        type: first.type || (item.type === 'video' ? 'video' : 'image'),
        count: media.length
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files)
        const urls = files.map(file => URL.createObjectURL(file))
        setPreviews(urls)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <div className="bg-white p-8 rounded-3xl shadow-lg shadow-blue-900/5 border border-gray-100 sticky top-8">
            <h3 className="font-extrabold text-2xl text-[#253894] mb-2 flex items-center gap-2">
                <Upload className="text-[#63A900]" /> {t.upload_title}
            </h3>
            <p className="text-sm text-gray-500 mb-8">{t.upload_desc}</p>
            
            <form action={async (formData) => {
                setIsUploading(true)
                await createGallery(formData)
                setIsUploading(false)
                setPreviews([])
                const form = document.getElementById('gallery-form') as HTMLFormElement
                form?.reset()
            }} id="gallery-form" className="space-y-6">
                
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.album_name_label}</label>
                    <input name="caption" placeholder={t.album_name_ph} className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#253894]/20 focus:bg-white transition font-medium text-gray-800 placeholder:text-gray-400" required />
                </div>
                
                <div className="relative group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.files_label}</label>
                    <input type="file" name="media" multiple accept="image/*,video/*" className="absolute inset-0 w-full h-48 opacity-0 cursor-pointer z-20 mt-6" onChange={handleFileSelect} required/>
                    <div className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${previews.length > 0 ? 'border-[#63A900] bg-green-50/30' : 'border-gray-300 group-hover:border-[#253894] group-hover:bg-blue-50/30'}`}>
                        {previews.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 p-2 w-full h-full overflow-hidden">
                                {previews.slice(0, 6).map((src, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                                        <img src={src} className="w-full h-full object-cover" alt="" />
                                        {i === 5 && previews.length > 6 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs">+{previews.length - 6}</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 group-hover:bg-white group-hover:text-[#253894] group-hover:shadow-md transition transform group-hover:scale-110"><Plus size={24} /></div>
                                <p className="text-sm font-bold text-gray-600 group-hover:text-[#253894]">{t.select_files}</p>
                                <p className="text-xs text-gray-400 mt-1">{t.drag_drop}</p>
                            </>
                        )}
                    </div>
                </div>

                <button disabled={isUploading} className="w-full py-4 bg-[#253894] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl hover:bg-[#1a2b7a] transition shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2">
                    {isUploading ? <Loader2 className="animate-spin" /> : t.publish_btn}
                </button>
            </form>
        </div>
      </div>

      <div className="xl:col-span-2 space-y-6">
        <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-gray-800 text-xl">{t.library_title} <span className="text-gray-400 text-sm ml-2 font-normal">{gallery.length} {t.albums_count}</span></h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
            {gallery.map((item) => {
               const preview = parseMedia(item)
               const isVideo = preview.type === 'video'

               return (
                <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={item.id} className="group relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100">
                   {isVideo ? <video src={preview.url} className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" /> : <Image src={preview.url} alt={item.caption} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw"/>}
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                      <p className="text-white text-sm font-bold line-clamp-2 mb-3 leading-snug">{item.caption}</p>
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/80 uppercase font-bold tracking-wider bg-white/20 px-2 py-1 rounded backdrop-blur-sm">{new Date(item.created_at).toLocaleDateString()}</span>
                          <form action={deleteGallery.bind(null, item.id)}>
                            <button className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-lg transform hover:scale-105 active:scale-95"><Trash2 size={16} /></button>
                          </form>
                      </div>
                   </div>
                   
                   <div className="absolute top-4 right-4 flex gap-2">
                      {preview.count > 1 && <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/10">{preview.count} {t.items_count}</span>}
                      <span className="bg-white/90 text-[#253894] p-1.5 rounded-lg shadow-sm">{isVideo ? <Film size={14} /> : <ImageIcon size={14} />}</span>
                   </div>
                </motion.div>
               )
            })}
            </AnimatePresence>
            
            {gallery.length === 0 && (
                <div className="col-span-full py-32 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                    <div className="bg-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-sm"><ImageIcon size={32} className="opacity-20 text-[#253894]" /></div>
                    <p className="font-medium text-lg text-gray-600">{t.empty_title}</p>
                    <p className="text-sm">{t.empty_desc}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
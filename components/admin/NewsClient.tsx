"use client"

import { useState } from 'react'
import { createNews, updateNews, deleteNews } from '@/app/admin/actions'
import { Plus, Trash2, X, Upload, FileText, Search, Calendar, Edit, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const parseImages = (raw: any) => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : []
  } catch (e) { return [] }
}

export default function NewsClient({ news, dict }: { news: any[], dict: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null) // Если есть, значит редактируем
  const [previews, setPreviews] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const t = dict.admin.news

  // Фильтрация
  const filteredNews = news.filter(item => 
    (item.title_en || item.title_hy || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files)
        const urls = files.map(file => URL.createObjectURL(file))
        setPreviews(prev => [...prev, ...urls])
    }
  }

  const openEdit = (item: any) => {
    setEditingItem(item)
    setPreviews(parseImages(item.image_url))
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    setPreviews([])
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-[#0f172a] flex items-center gap-3">
           <span className="bg-purple-100 p-2 rounded-xl text-purple-600"><FileText size={24}/></span>
           {t.title}
        </h1>
        <div className="flex gap-4">
            <input 
                placeholder={t.search_ph} 
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-4 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none"
            />
            <button onClick={openCreate} className="bg-[#253894] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                <Plus size={20} /> {t.create_btn}
            </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredNews.map((item) => {
            const imgs = parseImages(item.image_url)
            const thumb = imgs[0] ? (imgs[0].startsWith('http') ? imgs[0] : imgs[0]) : '/placeholder.jpg'
            
            return (
                <div key={item.id} className="flex flex-col md:flex-row gap-6 bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition">
                    <div className="w-full md:w-48 h-32 relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={thumb} alt="News" fill className="object-cover" />
                        {imgs.length > 1 && <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">+{imgs.length-1}</span>}
                    </div>
                    <div className="flex-1 py-2">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{new Date(item.publish_date).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                                <form action={deleteNews.bind(null, item.id)}>
                                    <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                </form>
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{item.title_hy || item.title_en}</h3>
                        <p className="text-xs text-gray-400 mb-2 font-mono">EN: {item.title_en}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.content_hy || item.content_en}</p>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Modal (Create/Edit) */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-gray-50 p-6 border-b flex justify-between items-center">
                        <h3 className="font-bold text-xl">{editingItem ? 'Edit News' : t.modal.title}</h3>
                        <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
                    </div>
                    
                    <form action={async (formData) => {
                        if (editingItem) {
                            await updateNews(editingItem.id, formData)
                        } else {
                            await createNews(formData)
                        }
                        setIsModalOpen(false)
                    }} className="p-8 overflow-y-auto">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Armenian Column */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-[#63A900] flex items-center gap-2"><span className="bg-green-100 px-2 rounded text-xs">HY</span> Armenian</h4>
                                <input name="title_hy" defaultValue={editingItem?.title_hy} placeholder="Վերնագիր" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#63A900]/20" required />
                                <textarea name="content_hy" defaultValue={editingItem?.content_hy} rows={8} placeholder="Բովանդակություն..." className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#63A900]/20 resize-none" required></textarea>
                            </div>

                            {/* English Column */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-[#253894] flex items-center gap-2"><span className="bg-blue-100 px-2 rounded text-xs">EN</span> English</h4>
                                <input name="title_en" defaultValue={editingItem?.title_en} placeholder="Headline" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#253894]/20" required />
                                <textarea name="content_en" defaultValue={editingItem?.content_en} rows={8} placeholder="Content..." className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#253894]/20 resize-none" required></textarea>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div>
                                <label className="block font-bold text-sm mb-2 text-gray-500">{t.modal.date_label}</label>
                                <input name="date" type="date" defaultValue={editingItem ? new Date(editingItem.publish_date).toISOString().split('T')[0] : ''} className="w-full p-3 border rounded-xl" required />
                            </div>
                            
                            <div>
                                <label className="block font-bold text-sm mb-2 text-gray-500">{t.modal.cover_label} (Select multiple)</label>
                                <div className="flex flex-wrap gap-2">
                                    {previews.map((src, i) => (
                                        <div key={i} className="w-20 h-20 relative rounded-lg overflow-hidden border">
                                            <Image src={src} fill alt="" className="object-cover" />
                                        </div>
                                    ))}
                                    <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 hover:text-[#253894]">
                                        <Upload size={20} />
                                        <input name="images" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-4 bg-[#253894] text-white font-bold rounded-xl hover:bg-[#1a2b7a] transition flex justify-center gap-2">
                            <Save size={20} /> {editingItem ? 'Save Changes' : t.modal.submit_btn}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  )
}
"use client"

import { useState } from 'react'
import { createEvent, deleteEvent } from '@/app/admin/actions'
import { Plus, Calendar, Trash2, X, Clock, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EventsClient({ events, dict }: { events: any[], dict: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 🛡️ БЕЗОПАСНЫЙ ДОСТУП
  // Если dict не пришел, используем пустой объект, чтобы не крашнуть страницу
  const t = dict?.admin?.events

  // Если перевода нет, показываем ошибку вместо краша
  if (!t) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <h3 className="font-bold">Ошибка перевода</h3>
        <p>Словарь не загружен. Проверьте консоль сервера.</p>
        <pre className="text-[10px] mt-2">{JSON.stringify(dict, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-[#0f172a]">{t.title}</h1>
            <p className="text-gray-500">{t.subtitle}</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#63A900] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#528a00] transition active:scale-95"
        >
            <Plus size={20} /> {t.add_btn}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => {
            const date = new Date(event.event_date)
            const isPast = date < new Date()
            
            return (
                <div key={event.id} className={`group bg-white p-6 rounded-3xl border transition-all hover:shadow-lg relative overflow-hidden ${isPast ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-inner ${
                            event.type === 'deadline' ? 'bg-red-50 text-red-500' : 
                            event.type === 'meeting' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600'
                        }`}>
                            <span className="text-xl leading-none">{date.getDate()}</span>
                            <span className="text-[10px] uppercase">{date.toLocaleDateString('ru', { month: 'short' })}</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wide">
                            {event.type}
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock size={14} /> {date.toLocaleDateString('ru', { weekday: 'long' })}
                    </p>

                    <form action={deleteEvent.bind(null, event.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white text-red-500 rounded-lg shadow-sm border border-gray-100 hover:bg-red-50">
                            <Trash2 size={16} />
                        </button>
                    </form>
                </div>
            )
        })}
        
        {events.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p>{t.empty}</p>
            </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                onClick={() => setIsModalOpen(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-[#f8fafc] p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">{t.modal.title}</h3>
                        <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    <form action={async (formData) => {
                        await createEvent(formData)
                        setIsModalOpen(false)
                    }} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.modal.name_label}</label>
                            <input name="title" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#63A900] transition" required placeholder={t.modal.name_ph}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t.modal.date_label}</label>
                                <input name="date" type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#63A900] transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t.modal.type_label}</label>
                                <select name="type" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#63A900] transition">
                                    <option value="event">Event</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="meeting">Meeting</option>
                                </select>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-[#63A900] text-white font-bold rounded-xl hover:bg-[#528a00] transition shadow-lg shadow-green-900/10 mt-2">
                            {t.modal.create_btn}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
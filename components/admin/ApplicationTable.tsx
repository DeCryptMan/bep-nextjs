"use client"

import { useState } from 'react'
import { updateApplicationStatus } from '@/app/admin/actions'
import { 
  Search, Eye, X, Mail, School, User, Users, FileText, 
  CheckCircle, Clock, XCircle, Filter, MapPin, Briefcase, 
  Target, Lightbulb, PenTool, Calendar, BookOpen
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ApplicationTable({ 
  applications, 
  dict 
}: { 
  applications: any[], 
  dict: any 
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, approved, pending
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  // Удобные алиасы для словарей
  const t = dict.admin.applications
  const tCommon = dict.apply // Используем переводы из секции заявки для типов школ и направлений

  // --- Логика фильтрации ---
  const filtered = applications.filter(app => {
    const matchesSearch = 
      app.full_name.toLowerCase().includes(search.toLowerCase()) ||
      app.college.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase())

    let matchesFilter = true
    if (filter === 'approved') matchesFilter = app.status === 'approved'
    if (filter === 'pending') matchesFilter = app.status === 'pending' || !app.status

    return matchesSearch && matchesFilter
  })

  // --- Смена статуса ---
  const handleStatusChange = async (id: number, newStatus: string) => {
    setLoadingId(id)
    await updateApplicationStatus(id, newStatus)
    setLoadingId(null)
  }

  // --- Парсинг данных ---
  const getDetails = (app: any) => {
    try {
        if (typeof app.full_data === 'object' && app.full_data !== null) return app.full_data
        return typeof app.full_data === 'string' ? JSON.parse(app.full_data) : {}
    } catch (e) { return {} }
  }

  const getTeam = (details: any) => {
      try {
          if (typeof details.team_json === 'string') return JSON.parse(details.team_json)
          if (Array.isArray(details.team_json)) return details.team_json
      } catch(e) {}
      return []
  }

  // Получение переведенного лейбла для типа школы
  const getSchoolTypeLabel = (type: string) => {
      return tCommon.school_types[type] || type
  }

  // Получение переведенного лейбла для направления
  const getDirectionLabel = (dir: string, otherVal?: string) => {
      if (dir === 'other') return otherVal || tCommon.directions.other
      return tCommon.directions[dir] || dir
  }

  return (
    <div className="space-y-6">
      
      {/* --- Toolbar --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
         {/* Tabs */}
         <div className="flex p-1 bg-gray-100 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button 
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-[#253894] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                {t.filters.all}
            </button>
            <button 
                onClick={() => setFilter('approved')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'approved' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <CheckCircle size={16}/> {t.filters.approved}
            </button>
            <button 
                onClick={() => setFilter('pending')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'pending' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Clock size={16}/> {t.filters.pending}
            </button>
         </div>

         {/* Search */}
         <div className="relative w-full sm:w-72 pr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder={t.search_ph} 
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none outline-none text-sm font-medium placeholder:text-gray-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
         </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-xs">
                    <tr>
                        <th className="p-5 pl-8">{t.table.id}</th>
                        <th className="p-5">{t.table.status}</th>
                        <th className="p-5">{t.table.candidate}</th>
                        <th className="p-5">{t.table.institution}</th>
                        <th className="p-5 text-right pr-8">{t.table.actions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filtered.map((app) => (
                        <tr key={app.id} className="hover:bg-blue-50/30 transition group">
                            <td className="p-5 pl-8 text-gray-400 font-mono">#{app.id}</td>
                            <td className="p-5">
                                {app.status === 'approved' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                        <CheckCircle size={12} /> {t.status.approved}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                                        <Clock size={12} /> {t.status.pending}
                                    </span>
                                )}
                            </td>
                            <td className="p-5">
                                <div className="font-bold text-gray-800">{app.full_name}</div>
                                <div className="text-xs text-gray-400">{app.email}</div>
                            </td>
                            <td className="p-5 text-gray-600">{app.college}</td>
                            <td className="p-5 text-right pr-8">
                                <div className="flex items-center justify-end gap-2">
                                    {/* Action Buttons */}
                                    {app.status === 'approved' ? (
                                        <button 
                                            onClick={() => handleStatusChange(app.id, 'pending')}
                                            disabled={loadingId === app.id}
                                            className="p-2 text-orange-400 hover:bg-orange-50 rounded-lg transition"
                                            title={t.table.reject}
                                        >
                                            {loadingId === app.id ? <div className="animate-spin w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full"/> : <XCircle size={18}/>}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleStatusChange(app.id, 'approved')}
                                            disabled={loadingId === app.id}
                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                            title={t.table.approve}
                                        >
                                            {loadingId === app.id ? <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"/> : <CheckCircle size={18}/>}
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => setSelectedApp(app)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold hover:border-[#253894] hover:text-[#253894] transition shadow-sm ml-2"
                                        title={t.table.view}
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <Filter size={48} className="mx-auto mb-4 opacity-20"/>
                    <p>{t.empty}</p>
                </div>
            )}
        </div>
      </div>

      {/* --- Full Details Modal --- */}
      <AnimatePresence>
        {selectedApp && (() => {
            const details = getDetails(selectedApp)
            const team = getTeam(details)
            const directionLabel = getDirectionLabel(details.direction, details.direction_other)
            const schoolTypeLabel = getSchoolTypeLabel(details.school_type)

            return (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setSelectedApp(null)}
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#253894] p-6 text-white relative flex-shrink-0">
                            <button onClick={() => setSelectedApp(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition bg-white/10 p-2 rounded-full"><X size={20}/></button>
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pr-12">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedApp.full_name}</h2>
                                    <p className="text-blue-200 text-sm mt-1">{selectedApp.college}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider self-start md:self-auto ${selectedApp.status === 'approved' ? 'bg-green-500 text-white' : 'bg-orange-400 text-white'}`}>
                                    {selectedApp.status === 'approved' ? t.status.approved : t.status.pending}
                                </div>
                            </div>
                        </div>

                        {/* Body (Scrollable) */}
                        <div className="p-8 overflow-y-auto flex-1 space-y-10">
                            
                            {/* I. General Info */}
                            <section>
                                <h3 className="text-[#253894] font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <School size={18}/> I. {tCommon.sections.I}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <InfoBlock label={tCommon.labels.school_name} value={details.school_name} />
                                        <InfoBlock label={tCommon.labels.address} value={details.address} icon={<MapPin size={14}/>} />
                                        <InfoBlock label={tCommon.labels.school_type} value={schoolTypeLabel} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-2 flex items-center gap-1"><User size={12}/> {t.modal.mentor}</p>
                                            <p className="font-bold text-gray-800">{details.mentor_name}</p>
                                            <p className="text-sm text-gray-600">{details.mentor_position}</p>
                                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                                                <p>{details.mentor_email}</p>
                                                <p>{details.mentor_phone}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-2 flex items-center gap-1"><Briefcase size={12}/> {t.modal.director}</p>
                                            <p className="font-bold text-gray-800">{details.director_name}</p>
                                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                                                <p>{details.director_email}</p>
                                                <p>{details.director_phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* II. Team */}
                            <section>
                                <h3 className="text-[#63A900] font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Users size={18}/> II. {t.modal.team} ({team.length})
                                </h3>
                                <div className="border rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                            <tr>
                                                <th className="p-3 pl-4">{tCommon.team_table.name}</th>
                                                <th className="p-3">{tCommon.team_table.grade}</th>
                                                <th className="p-3">{tCommon.team_table.role}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {team.map((m: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="p-3 pl-4 font-medium">{m.name}</td>
                                                    <td className="p-3 text-gray-500">{m.grade}</td>
                                                    <td className="p-3 text-[#253894] font-medium">{m.role}</td>
                                                </tr>
                                            ))}
                                            {team.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400">{t.empty}</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* III. Idea */}
                            <section>
                                <h3 className="text-[#253894] font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Lightbulb size={18}/> III. {t.modal.idea}
                                </h3>
                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">{tCommon.labels.company_name}</p>
                                            <p className="text-xl font-bold text-[#253894] mt-1">{details.company_name || '—'}</p>
                                        </div>
                                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 border shadow-sm">
                                            {directionLabel}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-2">{tCommon.labels.idea_desc}</p>
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{details.idea_desc || selectedApp.idea}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <InfoCard title={tCommon.labels.goals} content={details.goals} icon={<Target size={16}/>} />
                                        <InfoCard title={tCommon.labels.users} content={details.users} icon={<Users size={16}/>} />
                                        <InfoCard title={tCommon.labels.impact} content={details.impact} icon={<CheckCircle size={16}/>} />
                                    </div>
                                </div>
                            </section>

                            {/* IV. Plan */}
                            <section>
                                <h3 className="text-[#63A900] font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Calendar size={18}/> IV. {t.modal.plan}
                                </h3>
                                <div className="grid gap-4">
                                    <PlanBlock title={t.modal.roles} content={details.roles_plan} />
                                    <PlanBlock title={t.modal.plan} content={details.action_plan} />
                                    <PlanBlock title={t.modal.resources} content={details.resources} />
                                </div>
                            </section>

                            {/* V. Agreement */}
                            <section className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">{tCommon.labels.signature}</p>
                                    <p className="font-serif font-bold text-lg text-gray-800">{details.signature_name || '—'}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center gap-1 text-sm font-bold ${details.agreement ? 'text-green-600' : 'text-red-500'}`}>
                                        {details.agreement ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                        {details.agreement ? t.modal.signed : t.modal.not_signed}
                                    </span>
                                </div>
                            </section>

                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                             <div className="flex gap-2">
                                {selectedApp.status !== 'approved' ? (
                                    <button 
                                        onClick={() => { handleStatusChange(selectedApp.id, 'approved'); setSelectedApp(null) }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-green-200"
                                    >
                                        {t.modal.approve_btn}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => { handleStatusChange(selectedApp.id, 'pending'); setSelectedApp(null) }}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-orange-200"
                                    >
                                        {t.modal.cancel_btn}
                                    </button>
                                )}
                             </div>
                             <span className="text-xs text-gray-400 font-mono">ID: {selectedApp.id} • {new Date(selectedApp.created_at).toLocaleString()}</span>
                        </div>
                    </motion.div>
                </motion.div>
            )
        })()}
      </AnimatePresence>
    </div>
  )
}

// --- Helper Components ---

function InfoBlock({ label, value, icon }: { label: string, value: string, icon?: any }) {
    return (
        <div>
            <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">{icon} {label}</p>
            <p className="font-medium text-gray-800">{value || '—'}</p>
        </div>
    )
}

function InfoCard({ title, content, icon }: { title: string, content: string, icon: any }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-[#253894] font-bold uppercase mb-2 flex items-center gap-2 min-h-[20px]">{icon} {title}</p>
            <p className="text-sm text-gray-600 line-clamp-4" title={content}>{content || '—'}</p>
        </div>
    )
}

function PlanBlock({ title, content }: { title: string, content: string }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200">
            <span className="block text-xs font-bold text-gray-400 uppercase mb-2">{title}</span>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{content || '—'}</p>
        </div>
    )
}
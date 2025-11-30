"use client"

import { useState, useActionState } from 'react'
import { submitApplication } from '@/app/actions'
import { Plus, Trash2, Send, Loader2 } from 'lucide-react'

// Тип для словаря (упрощенный)
type Dictionary = any

type TeamMember = {
  id: number
  name: string
  grade: string
  role: string
}

const initialState = {
  message: '',
  status: ''
}

export default function ApplyClient({ dict }: { dict: Dictionary }) {
  const [state, formAction, isPending] = useActionState(submitApplication, initialState)
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, name: '', grade: '', role: '' }
  ])
  
  const [schoolName, setSchoolName] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [direction, setDirection] = useState('')
  
  const addMember = () => {
    setTeamMembers(prev => [
      ...prev,
      { id: Date.now(), name: '', grade: '', role: '' }
    ])
  }

  const removeMember = (id: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(prev => prev.filter(m => m.id !== id))
    }
  }

  const updateMember = (id: number, field: keyof TeamMember, value: string) => {
    setTeamMembers(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.trim()
    const count = text ? text.split(/\s+/).length : 0
    setWordCount(count)
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen font-sans">
      <main className="max-w-4xl mx-auto px-4 py-32">
        
        {/* Header */}
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#253894] mb-2">{dict.apply.title}</h1>
            <p className="text-gray-500 text-lg">{dict.apply.subtitle}</p>
            <div className="w-24 h-1.5 bg-[#63A900] mx-auto rounded-full mt-6"></div>
        </div>

        {/* Success Message */}
        {state?.status === 'success' ? (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-8 rounded-xl text-center shadow-lg animate-fade-in-up">
                <p className="text-2xl font-bold mb-2">{dict.apply.success_title}</p>
                <p className="text-lg">{state.message}</p>
            </div>
        ) : (
            <form action={formAction} className="space-y-8">
                
                <input type="hidden" name="team_json" value={JSON.stringify(teamMembers)} />

                {/* --- SECTION I: GENERAL DATA --- */}
                <section className="bg-white rounded-2xl shadow-[0_10px_30px_-5px_rgba(37,56,148,0.1)] p-8 border-t-4 border-[#253894] relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition group-hover:bg-blue-100"></div>
                    <h2 className="text-2xl font-bold text-[#253894] mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-[#253894] text-white text-sm flex items-center justify-center mr-3">I</span> 
                        {dict.apply.sections.I}
                    </h2>
                    
                    <div className="space-y-6 relative z-10">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">{dict.apply.labels.school_name}</label>
                            <input 
                                type="text" 
                                name="school_name" 
                                required
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#253894] focus:ring-2 focus:ring-blue-100 outline-none transition" 
                                placeholder={dict.apply.labels.school_name_ph} 
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">{dict.apply.labels.address}</label>
                            <input type="text" name="address" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#253894] focus:ring-2 focus:ring-blue-100 outline-none transition" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            {/* Mentor */}
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">{dict.apply.labels.mentor_title}</h3>
                                <div className="space-y-3">
                                    <input type="text" name="mentor_name" required placeholder={dict.apply.labels.name_ph} className="w-full px-3 py-2 rounded border focus:border-[#253894] outline-none" />
                                    <input type="text" name="mentor_position" placeholder={dict.apply.labels.position_ph} className="w-full px-3 py-2 rounded border focus:border-[#253894] outline-none" />
                                    <input type="tel" name="mentor_phone" required placeholder={dict.apply.labels.phone_ph} className="w-full px-3 py-2 rounded border focus:border-[#253894] outline-none" />
                                    <input type="email" name="mentor_email" required placeholder={dict.apply.labels.email_ph} className="w-full px-3 py-2 rounded border focus:border-[#253894] outline-none" />
                                </div>
                            </div>

                            {/* Director */}
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">{dict.apply.labels.director_title}</h3>
                                <div className="space-y-3">
                                    <input type="text" name="director_name" required placeholder={dict.apply.labels.name_ph} className="w-full px-3 py-2 rounded border focus:border-[#253894] outline-none" />
                                    <input type="tel" name="director_phone" placeholder={dict.apply.labels.phone_ph} className="w-full px-3 py-2 rounded border focus:border-[#253894] outline-none" />
                                    <input type="email" name="director_email" placeholder={dict.apply.labels.email_ph} className="w-full px-3 py-2 rounded border focus:border-[#253894] outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <label className="block font-semibold text-gray-700 mb-3">{dict.apply.labels.school_type}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    {val: 'main', label: dict.apply.school_types.main},
                                    {val: 'high', label: dict.apply.school_types.high},
                                    {val: 'middle', label: dict.apply.school_types.middle},
                                    {val: 'vocational', label: dict.apply.school_types.vocational}
                                ].map((type) => (
                                    <label key={type.val} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                                        <input type="radio" name="school_type" value={type.val} className="w-5 h-5 text-[#63A900] focus:ring-[#63A900] accent-[#63A900]" />
                                        <span className="ml-2">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SECTION II: TEAM --- */}
                <section className="bg-white rounded-2xl shadow-[0_10px_30px_-5px_rgba(37,56,148,0.1)] p-8 border-t-4 border-[#63A900] relative overflow-hidden">
                    <h2 className="text-2xl font-bold text-[#253894] mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-[#63A900] text-white text-sm flex items-center justify-center mr-3">II</span> 
                        {dict.apply.sections.II}
                    </h2>
                    
                    <div className="mb-4">
                        <label className="block font-semibold text-gray-700 mb-2">{dict.apply.labels.student_count}</label>
                        <input type="number" readOnly value={teamMembers.length} className="w-24 px-4 py-2 rounded-lg border border-gray-300 focus:border-[#63A900] outline-none bg-gray-50" />
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                                <tr>
                                    <th className="p-4 w-10">№</th>
                                    <th className="p-4">{dict.apply.team_table.name}</th>
                                    <th className="p-4">{dict.apply.team_table.grade}</th>
                                    <th className="p-4">{dict.apply.team_table.role}</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teamMembers.map((member, index) => (
                                    <tr key={member.id}>
                                        <td className="p-4 font-bold text-gray-500">{index + 1}</td>
                                        <td className="p-2">
                                            <input 
                                                value={member.name}
                                                onChange={e => updateMember(member.id, 'name', e.target.value)}
                                                className="w-full p-2 border rounded focus:border-[#63A900] outline-none" 
                                                placeholder={dict.apply.team_table.name} 
                                                required
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                value={member.grade}
                                                onChange={e => updateMember(member.id, 'grade', e.target.value)}
                                                className="w-full p-2 border rounded focus:border-[#63A900] outline-none" 
                                                placeholder="XX" 
                                                required
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                value={member.role}
                                                onChange={e => updateMember(member.id, 'role', e.target.value)}
                                                className="w-full p-2 border rounded focus:border-[#63A900] outline-none" 
                                                placeholder={dict.apply.team_table.role_ph} 
                                                required
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            {teamMembers.length > 1 && (
                                                <button type="button" onClick={() => removeMember(member.id)} className="text-red-400 hover:text-red-600 transition">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <button type="button" onClick={addMember} className="mt-4 flex items-center text-[#63A900] font-bold hover:text-green-700 transition">
                        <Plus className="mr-2" /> {dict.apply.btn.add_member}
                    </button>
                </section>

                {/* --- SECTION III: IDEA --- */}
                <section className="bg-white rounded-2xl shadow-[0_10px_30px_-5px_rgba(37,56,148,0.1)] p-8 border-t-4 border-[#253894]">
                    <h2 className="text-2xl font-bold text-[#253894] mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-[#253894] text-white text-sm flex items-center justify-center mr-3">III</span> 
                        {dict.apply.sections.III}
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">{dict.apply.labels.company_name}</label>
                            <input type="text" name="company_name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#253894] outline-none transition" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block font-semibold text-gray-700">{dict.apply.labels.idea_desc}</label>
                                <span className={`text-xs ${wordCount > 200 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{wordCount} / 200 {dict.apply.word_count}</span>
                            </div>
                            <textarea 
                                name="idea_desc" 
                                rows={4} 
                                onChange={handleIdeaChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#253894] outline-none transition" 
                                placeholder={dict.apply.labels.idea_ph}
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-3">{dict.apply.labels.direction}</label>
                            <select 
                                name="direction" 
                                value={direction}
                                onChange={(e) => setDirection(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#253894] outline-none bg-white"
                            >
                                <option value="">{dict.apply.labels.direction_select}</option>
                                <option value="production">{dict.apply.directions.production}</option>
                                <option value="service">{dict.apply.directions.service}</option>
                                <option value="social">{dict.apply.directions.social}</option>
                                <option value="green">{dict.apply.directions.green}</option>
                                <option value="other">{dict.apply.directions.other}</option>
                            </select>
                            
                            {direction === 'other' && (
                                <input 
                                    type="text" 
                                    name="direction_other" 
                                    className="w-full mt-3 px-4 py-3 rounded-lg border border-gray-300 focus:border-[#253894] outline-none animate-fade-in" 
                                    placeholder={dict.apply.labels.direction_other_ph} 
                                    required
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                {name: 'goals', label: dict.apply.labels.goals},
                                {name: 'users', label: dict.apply.labels.users},
                                {name: 'impact', label: dict.apply.labels.impact}
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block font-semibold text-gray-700 mb-2">{field.label}</label>
                                    <textarea name={field.name} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#253894] outline-none"></textarea>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- SECTION IV: PLAN --- */}
                <section className="bg-white rounded-2xl shadow-[0_10px_30px_-5px_rgba(37,56,148,0.1)] p-8 border-t-4 border-[#63A900]">
                    <h2 className="text-2xl font-bold text-[#253894] mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-[#63A900] text-white text-sm flex items-center justify-center mr-3">IV</span> 
                        {dict.apply.sections.IV}
                    </h2>
                    
                    <div className="space-y-6">
                        {[
                            {name: 'roles_plan', label: dict.apply.labels.roles_plan},
                            {name: 'action_plan', label: dict.apply.labels.action_plan, placeholder: dict.apply.labels.action_plan_ph},
                            {name: 'resources', label: dict.apply.labels.resources}
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="block font-semibold text-gray-700 mb-2">{field.label}</label>
                                <textarea 
                                    name={field.name} 
                                    rows={3} 
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#63A900] outline-none"
                                    placeholder={field.placeholder || ''}
                                ></textarea>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- SECTION V: AGREEMENT --- */}
                <section className="bg-gray-100 rounded-2xl p-8 border-2 border-dashed border-gray-300">
                    <h2 className="text-2xl font-bold text-[#253894] mb-6">V. {dict.apply.sections.V}</h2>
                    
                    <div className="prose max-w-none text-gray-600 mb-6 text-sm">
                        <p className="leading-relaxed">
                            {dict.apply.labels.agreement_text_1} <b className="text-[#253894] border-b border-gray-400 px-1">{schoolName || '...'}</b> {dict.apply.labels.agreement_text_2}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">{dict.apply.labels.signature}</label>
                            <input 
                                type="text" 
                                name="signature_name" 
                                required
                                className="w-full bg-transparent border-b-2 border-gray-400 px-2 py-1 focus:border-[#253894] outline-none font-bold font-serif" 
                                placeholder={dict.apply.labels.signature_ph} 
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    name="agreement" 
                                    required
                                    className="w-6 h-6 text-[#63A900] rounded focus:ring-[#63A900] accent-[#63A900]" 
                                />
                                <span className="ml-3 font-bold text-[#253894]">{dict.apply.labels.agree_check}</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 pb-20">
                    <button 
                        type="submit" 
                        disabled={isPending}
                        className={`bg-gradient-to-r from-[#253894] to-[#63A900] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center active:scale-95 ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-3 animate-spin" size={20} />
                                <span>{dict.apply.btn.sending}</span>
                            </>
                        ) : (
                            <>
                                <span>{dict.apply.btn.submit}</span>
                                <Send className="ml-3" size={20} />
                            </>
                        )}
                    </button>
                </div>

            </form>
        )}
      </main>
    </div>
  )
}
'use client'
import { useState } from 'react'
import { updateHomeSettings, uploadSliderImage } from '../actions'
import { X, Upload, Save, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function SettingsForm({ initialData, dict }: { initialData: any, dict: any }) {
  const t = dict.admin.settings

  const getInitialImages = () => {
    if (Array.isArray(initialData.slider_images)) return initialData.slider_images
    try { return typeof initialData.slider_images === 'string' ? JSON.parse(initialData.slider_images) : [] } catch (e) { return [] }
  }

  const [images, setImages] = useState<string[]>(getInitialImages())
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', e.target.files[0])
    try {
        const res = await uploadSliderImage(formData)
        if (res) setImages([...images, res])
    } catch(e) { alert('Upload Error') }
    setLoading(false)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <form action={async (formData) => {
        setIsSaving(true)
        await updateHomeSettings(formData)
        setIsSaving(false)
    }} className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-8">
        <div className="space-y-4">
            <h3 className="font-bold text-[#253894] flex items-center gap-2"><span className="bg-blue-100 px-2 rounded">EN</span> {t.hero_en}</h3>
            <input name="hero_title_en" defaultValue={initialData.hero_title_en} placeholder={t.title_label} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#253894]/20" />
            <input name="hero_subtitle_en" defaultValue={initialData.hero_subtitle_en} placeholder={t.subtitle_label} className="w-full p-3 border rounded-lg font-bold text-[#63A900] outline-none focus:ring-2 focus:ring-[#253894]/20" />
            <textarea name="hero_desc_en" defaultValue={initialData.hero_desc_en} placeholder={t.desc_label} rows={3} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#253894]/20" />
        </div>
        <div className="space-y-4">
            <h3 className="font-bold text-[#63A900] flex items-center gap-2"><span className="bg-green-100 px-2 rounded">HY</span> {t.hero_hy}</h3>
            <input name="hero_title_hy" defaultValue={initialData.hero_title_hy} placeholder={t.title_label} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#253894]/20" />
            <input name="hero_subtitle_hy" defaultValue={initialData.hero_subtitle_hy} placeholder={t.subtitle_label} className="w-full p-3 border rounded-lg font-bold text-[#63A900] outline-none focus:ring-2 focus:ring-[#253894]/20" />
            <textarea name="hero_desc_hy" defaultValue={initialData.hero_desc_hy} placeholder={t.desc_label} rows={3} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#253894]/20" />
        </div>
      </div>

      <div className="border-b pb-8">
        <h3 className="font-bold text-gray-800 mb-4">{t.stats_title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                    <input name={`stat_${i}_value`} defaultValue={initialData[`stat_${i}_value`]} className="w-full p-2 border rounded font-bold text-center text-xl text-[#253894]" placeholder="Value" />
                    <div className="grid grid-cols-2 gap-2">
                       <input name={`stat_${i}_label_hy`} defaultValue={initialData[`stat_${i}_label_hy`]} className="w-full p-2 border rounded text-xs text-center" placeholder="HY Label" />
                       <input name={`stat_${i}_label_en`} defaultValue={initialData[`stat_${i}_label_en`]} className="w-full p-2 border rounded text-xs text-center" placeholder="EN Label" />
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4">{t.slider_title}</h3>
        <div className="flex flex-wrap gap-4 mb-4">
            {images.map((src, idx) => (
                <div key={idx} className="relative w-40 h-24 rounded-xl overflow-hidden group border border-gray-200 shadow-sm">
                    <Image src={src} alt="Slide" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button type="button" onClick={() => removeImage(idx)} className="bg-red-500 text-white rounded-full p-2 hover:scale-110 transition"><X size={16} /></button>
                    </div>
                </div>
            ))}
            <label className="w-40 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#253894] transition text-gray-400 hover:text-[#253894]">
                {loading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                <span className="text-[10px] mt-1 font-bold">{t.add_photo}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
        </div>
        <input type="hidden" name="slider_images_json" value={JSON.stringify(images)} />
      </div>

      <button disabled={isSaving} className="w-full bg-[#253894] disabled:opacity-70 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-900 transition flex items-center justify-center gap-2">
        {isSaving ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
        {t.save_btn}
      </button>
    </form>
  )
}
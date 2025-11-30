import { prisma } from '@/lib/db'
import SettingsForm from './form'
import { getAdminDictionary } from '@/lib/admin-dictionary'

export const revalidate = 0

export default async function SettingsPage() {
  const { dict } = await getAdminDictionary()
  const settings = await prisma.homeSettings.findFirst() || {
     id: 0,
     hero_title_en: '', hero_subtitle_en: '', hero_desc_en: '',
     hero_title_hy: '', hero_subtitle_hy: '', hero_desc_hy: '',
     stat_1_value: '', stat_1_label_en: '', stat_1_label_hy: '',
     stat_2_value: '', stat_2_label_en: '', stat_2_label_hy: '',
     stat_3_value: '', stat_3_label_en: '', stat_3_label_hy: '',
     slider_images: []
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{dict.admin.settings.title}</h1>
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <SettingsForm initialData={JSON.parse(JSON.stringify(settings))} dict={dict} />
      </div>
    </div>
  )
}
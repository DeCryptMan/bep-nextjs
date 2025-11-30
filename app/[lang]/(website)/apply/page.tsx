import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/i18n-config'
import ApplyClient from '@/components/ApplyClient'

export default async function ApplyPage({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return <ApplyClient dict={dict} />
}
'use server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function submitApplication(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  
  // Сбор данных команды в JSON
  // В реальном Next.js лучше использовать useForm + API route, но для простоты FormData:
  
  try {
    await prisma.application.create({
      data: {
        full_name: rawData.mentor_name as string,
        email: rawData.mentor_email as string,
        college: rawData.school_name as string,
        idea: rawData.idea_desc as string,
        full_data: JSON.parse(JSON.stringify(rawData)) // Сохраняем всё как JSON
      }
    })
    return { message: 'Заявка успешно отправлена!', status: 'success' }
  } catch (e) {
    return { message: 'Ошибка базы данных', status: 'error' }
  }
}
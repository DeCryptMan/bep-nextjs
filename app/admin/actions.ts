'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSession, logout } from '@/lib/session'
import { uploadToS3 } from '@/lib/s3'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

// --- HELPER: LOCAL UPLOAD ---
// Функция для локального сохранения файлов в папку public/uploads
async function uploadLocal(file: File, folder: string) {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Генерируем уникальное имя файла
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    
    // Определяем путь к папке (создаем, если нет)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Сохраняем файл
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)
    
    // Возвращаем публичный путь (URL)
    return `/uploads/${folder}/${filename}`
  } catch (e) {
    console.error("Local Upload Error:", e)
    return null
  }
}

// --- AUTHENTICATION ---

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    const admin = await prisma.admin.findUnique({ where: { username } })

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return { error: 'Invalid login or password' }
    }

    await createSession(admin.id.toString())
  } catch (e) {
    if ((e as Error).message === 'NEXT_REDIRECT') {
      throw e
    }
    console.error("Login Error:", e)
    return { error: "Server error" }
  }
  
  redirect('/admin')
}

export async function logoutAction() {
  await logout()
  redirect('/admin/login')
}

// --- LOCALIZATION & SETTINGS ---

export async function setAdminLocale(locale: string) {
  const cookieStore = await cookies()
  cookieStore.set('admin_locale', locale, {
    path: '/',
    maxAge: 31536000, // 1 год
    sameSite: 'lax'
  })
}

// --- EVENTS ---

export async function createEvent(formData: FormData) {
  await prisma.event.create({
    data: {
      title: formData.get('title') as string,
      event_date: new Date(formData.get('date') as string),
      type: formData.get('type') as string,
    }
  })
  revalidatePath('/admin/events')
  revalidatePath('/') 
}

export async function deleteEvent(id: number) {
  await prisma.event.delete({ where: { id } })
  revalidatePath('/admin/events')
  revalidatePath('/')
}

// --- NEWS ---

export async function createNews(formData: FormData) {
  const files = formData.getAll('images') as File[]
  const imageUrls: string[] = []

  // Загрузка файлов
  for (const file of files) {
    if (file.size > 0 && file.name !== 'undefined') {
      // Используем твою функцию uploadLocal или uploadToS3
      const url = await uploadLocal(file, 'news') 
      if (url) imageUrls.push(url)
    }
  }

  await prisma.news.create({
    data: {
      title_en: formData.get('title_en') as string,
      content_en: formData.get('content_en') as string,
      title_hy: formData.get('title_hy') as string,
      content_hy: formData.get('content_hy') as string,
      publish_date: new Date(formData.get('date') as string),
      image_url: JSON.stringify(imageUrls)
    }
  })
  
  revalidatePath('/admin/news')
  revalidatePath('/')
}

export async function updateNews(id: number, formData: FormData) {
  const files = formData.getAll('images') as File[]
  
  // Получаем текущую новость, чтобы сохранить старые картинки
  const currentNews = await prisma.news.findUnique({ where: { id } })
  let currentImages: string[] = []
  try {
    currentImages = JSON.parse(currentNews?.image_url as string || '[]')
  } catch(e) {}

  // Загружаем НОВЫЕ файлы
  const newImageUrls: string[] = []
  for (const file of files) {
    if (file.size > 0 && file.name !== 'undefined') {
      const url = await uploadLocal(file, 'news')
      if (url) newImageUrls.push(url)
    }
  }

  // Объединяем старые и новые картинки (или можно сделать логику замены)
  // Здесь мы просто добавляем новые к старым
  const finalImages = [...currentImages, ...newImageUrls]

  // Если пришел флаг очистки старых фото (опционально)
  // if (formData.get('clear_images') === 'true') finalImages = newImageUrls

  await prisma.news.update({
    where: { id },
    data: {
      title_en: formData.get('title_en') as string,
      content_en: formData.get('content_en') as string,
      title_hy: formData.get('title_hy') as string,
      content_hy: formData.get('content_hy') as string,
      publish_date: new Date(formData.get('date') as string),
      image_url: JSON.stringify(finalImages)
    }
  })

  revalidatePath('/admin/news')
  revalidatePath('/')
}

export async function deleteNews(id: number) {
  await prisma.news.delete({ where: { id } })
  revalidatePath('/admin/news')
  revalidatePath('/')
}
// --- GALLERY ---

export async function createGallery(formData: FormData) {
  const files = formData.getAll('media') as File[]
  const mediaItems: { type: string, url: string }[] = []
  let mainType = 'photo'

  const uploadPromises = files.map(async (file) => {
    if (file.size > 0 && file.name !== 'undefined') {
      // Галерею пока оставляем на S3, или если хочешь тоже локально — замени на uploadLocal(file, 'gallery')
      const url = await uploadToS3(file, 'gallery') 
      const isVideo = file.type.startsWith('video') || /\.(mp4|mov|avi|webm)$/i.test(file.name)
      return { url, type: isVideo ? 'video' : 'photo' }
    }
    return null
  })

  const results = await Promise.all(uploadPromises)
  
  results.forEach(item => {
    if (item) {
      mediaItems.push(item)
      if (item.type === 'video') mainType = 'video'
    }
  })
  
  const hasVideo = mediaItems.some(m => m.type === 'video')
  const hasPhoto = mediaItems.some(m => m.type === 'photo')
  if (hasVideo && hasPhoto) mainType = 'mixed'

  await prisma.gallery.create({
    data: {
      caption: formData.get('caption') as string,
      type: mainType,
      media_url: mediaItems 
    }
  })
  
  revalidatePath('/admin/gallery')
  revalidatePath('/')
}

export async function deleteGallery(id: number) {
  await prisma.gallery.delete({ where: { id } })
  revalidatePath('/admin/gallery')
  revalidatePath('/')
}

// --- APPLICATIONS ---

export async function updateApplicationStatus(id: number, status: string) {
  await prisma.application.update({
    where: { id },
    data: { status }
  })
  revalidatePath('/admin/applications')
}

export async function submitApplication(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  
  try {
    await prisma.application.create({
      data: {
        full_name: rawData.mentor_name as string,
        email: rawData.mentor_email as string,
        college: rawData.school_name as string,
        idea: rawData.idea_desc as string,
        full_data: JSON.parse(JSON.stringify(rawData)), 
        status: 'pending'
      }
    })
    return { message: 'Հայտը հաջողությամբ ուղարկվեց:', status: 'success' }
  } catch (e) {
    console.error(e)
    return { message: 'Տեղի ունեցավ սխալ:', status: 'error' }
  }
}

// --- HOME SETTINGS ---

export async function uploadSliderImage(formData: FormData) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) return null
  // Слайдер тоже можно перевести на локальное сохранение при желании
  return await uploadToS3(file, 'slider')
}

export async function updateHomeSettings(formData: FormData) {
  const current = await prisma.homeSettings.findFirst()
  
  const sliderImagesRaw = formData.get('slider_images_json') as string
  let sliderImages = []
  try {
    sliderImages = JSON.parse(sliderImagesRaw)
  } catch (e) {
    sliderImages = []
  }

  const data = {
    hero_title_en: formData.get('hero_title_en') as string,
    hero_subtitle_en: formData.get('hero_subtitle_en') as string,
    hero_desc_en: formData.get('hero_desc_en') as string,
    
    hero_title_hy: formData.get('hero_title_hy') as string,
    hero_subtitle_hy: formData.get('hero_subtitle_hy') as string,
    hero_desc_hy: formData.get('hero_desc_hy') as string,

    stat_1_value: formData.get('stat_1_value') as string,
    stat_1_label_en: formData.get('stat_1_label_en') as string,
    stat_1_label_hy: formData.get('stat_1_label_hy') as string,

    stat_2_value: formData.get('stat_2_value') as string,
    stat_2_label_en: formData.get('stat_2_label_en') as string,
    stat_2_label_hy: formData.get('stat_2_label_hy') as string,

    stat_3_value: formData.get('stat_3_value') as string,
    stat_3_label_en: formData.get('stat_3_label_en') as string,
    stat_3_label_hy: formData.get('stat_3_label_hy') as string,
    
    slider_images: sliderImages 
  }

  if (current) {
    await prisma.homeSettings.update({ where: { id: current.id }, data })
  } else {
    await prisma.homeSettings.create({ data })
  }

  revalidatePath('/')
  revalidatePath('/admin/settings')
}
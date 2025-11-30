import { writeFile, mkdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { getSession } from '@/lib/session' // Импортируем проверку сессии
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  // 1. ПРОВЕРКА АВТОРИЗАЦИИ (Самое важное!)
  const session = await getSession()
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Генерируем имя и путь
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
  // Используем абсолютный путь для надежности
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  
  // Создаем папку, если её нет
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  
  const filePath = path.join(uploadDir, filename)
  
  await writeFile(filePath, buffer)
  
  return NextResponse.json({ success: true, url: `/uploads/${filename}` })
}
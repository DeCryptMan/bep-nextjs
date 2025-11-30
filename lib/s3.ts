import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Настройки клиента. Для MinIO/DigitalOcean/AWS
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-central-1',
  endpoint: process.env.S3_ENDPOINT, 
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Важно для MinIO и некоторых S3-совместимых хранилищ
})

export async function uploadToS3(file: File, folder: string) {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Уникальное имя файла
    const uniqueName = `${Date.now()}_${file.name.replaceAll(/\s+/g, '_')}`
    const key = `${folder}/${uniqueName}`

    // Загрузка
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Делаем файл доступным
    }))

    // Возвращаем публичный URL
    // Убедись, что S3_PUBLIC_URL задан в .env без слеша на конце
    return `${process.env.S3_PUBLIC_URL}/${key}`
  } catch (e) {
    console.error("S3 Upload Error:", e)
    throw new Error("Не удалось загрузить файл в облако")
  }
}
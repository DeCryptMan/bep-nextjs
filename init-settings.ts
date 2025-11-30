import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const exists = await prisma.homeSettings.findFirst()
  if (!exists) {
    await prisma.homeSettings.create({
      data: {
        slider_images: JSON.stringify(['/uploads/1.jpg', '/uploads/2.jpg']) // Заглушки
      }
    })
    console.log('✅ Настройки инициализированы')
  } else {
    console.log('ℹ️ Настройки уже существуют')
  }
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
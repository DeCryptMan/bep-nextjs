import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = 'admin'
  const password = '12345' // Твой пароль

  // 1. Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10)

  // 2. Создаем или обновляем пользователя
  const user = await prisma.admin.upsert({
    where: { username: username },
    update: {
      password_hash: hashedPassword // Если юзер есть, обновим пароль
    },
    create: {
      username: username,
      password_hash: hashedPassword
    },
  })

  console.log(`✅ Администратор создан!`)
  console.log(`👤 Логин: ${username}`)
  console.log(`🔑 Пароль: ${password}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

// Секретный ключ для шифрования (в .env добавь AUTH_SECRET=твоя_длинная_строка)
const SECRET_KEY = process.env.AUTH_SECRET || 'default-dev-secret-do-not-use-in-prod'
const KEY = new TextEncoder().encode(SECRET_KEY)

type SessionPayload = {
  userId: string
  role?: string
  expiresAt: Date
}

// 🔐 Зашифровать данные (создать сессию)
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Сессия живет 1 день
    .sign(KEY)
}

// 🔓 Расшифровать данные (проверить сессию)
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, KEY, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch (error) {
    return null // Если токен поддельный или истек
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, expiresAt })
  
  // В Next.js 15+ cookies() асинхронный, ставим await
  const cookieStore = await cookies()

  cookieStore.set('admin_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session) return null
  return await decrypt(session)
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}
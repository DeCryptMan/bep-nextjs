import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './i18n-config'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { decrypt } from '@/lib/session'

// Функция определения локали
function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore: locales are readonly
  const locales: string[] = i18n.locales
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  try {
    return matchLocale(languages, locales, i18n.defaultLocale)
  } catch (e) {
    return i18n.defaultLocale
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Игнорируем системные файлы и статику (чтобы не нагружать сервер)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 2. 🛡️ ЗАЩИТА АДМИНКИ (Stealth Mode + Crypto Check)
  if (pathname.startsWith('/admin')) {
    // Проверяем "Stealth Mode" (скрытый ключ в URL для первого входа)
    const hasGatekeeperPass = request.cookies.get('admin_gatekeeper')
    const secretKey = process.env.ADMIN_ACCESS_KEY
    const queryKey = request.nextUrl.searchParams.get('key')

    // Если введен секретный ключ -> пускаем и ставим куку
    if (queryKey === secretKey && secretKey) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.set('admin_gatekeeper', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 дней
      })
      return response
    }

    // Если нет пропуска -> 404 (делаем вид, что админки не существует)
    if (!hasGatekeeperPass) {
      return NextResponse.rewrite(new URL('/404', request.url))
    }

    // Проверяем КРИПТОГРАФИЧЕСКУЮ сессию
    const cookie = request.cookies.get('admin_session')?.value
    const session = await decrypt(cookie) // Расшифровываем токен

    // Если токен невалиден (подделка или истек) -> на логин
    if (!session?.userId && !pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Если авторизован и идет на логин -> в дашборд
    if (session?.userId && pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Если это админка, дальше не идем (чтобы не сработала локализация)
    return NextResponse.next()
  }

  // 3. 🌐 ЛОКАЛИЗАЦИЯ (для публичной части)
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    )
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|uploads|favicon.ico).*)'],
}
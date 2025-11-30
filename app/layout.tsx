import type { Metadata } from 'next'
import { Inter, Noto_Sans_Armenian, Playfair_Display } from 'next/font/google'
import './globals.css'

// Настройка шрифтов
const inter = Inter({ subsets: ['latin'] })
const notoSans = Noto_Sans_Armenian({ subsets: ['latin'] })
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif' // Переменная для использования в Tailwind (font-serif)
})

export const metadata: Metadata = {
  title: 'StudentBiz Ecosystem',
  description: 'Армянская экосистема студенческого предпринимательства',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hy" className="scroll-smooth">
      <body className={`${inter.className} ${notoSans.className} ${playfair.variable} bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
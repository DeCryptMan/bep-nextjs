"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Navbar({ dict, lang }: { dict: any, lang: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Логика смены языка: меняем префикс пути
  const redirectedPathName = (locale: string) => {
    if (!pathname) return '/'
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link href={`/${lang}`} className="flex items-center gap-2 font-bold text-2xl text-[#253894]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#253894] to-[#63A900] flex items-center justify-center text-white shadow-md">S</div>
          Student<span className="text-[#63A900]">Biz</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <Link href={`/${lang}/news`} className="hover:text-[#253894] transition">{dict.nav.news}</Link>
          <Link href={`/${lang}#calendar`} className="hover:text-[#253894] transition">{dict.nav.events}</Link>
          <Link href={`/${lang}/gallery`} className="hover:text-[#253894] transition">{dict.nav.gallery}</Link>
          
          {/* Lang Switcher */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-1">
             <Link href={redirectedPathName('hy')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'hy' ? 'bg-white shadow text-[#253894]' : 'text-gray-500'}`}>HY</Link>
             <Link href={redirectedPathName('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white shadow text-[#253894]' : 'text-gray-500'}`}>EN</Link>
          </div>

          <Link href={`/${lang}/apply`} className="bg-[#253894] text-white px-6 py-2.5 rounded-full hover:bg-[#63A900] transition-all shadow-lg transform hover:-translate-y-0.5">
            {dict.nav.apply}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
           {/* Mobile Lang Switcher (Simplified) */}
           <Link href={redirectedPathName(lang === 'hy' ? 'en' : 'hy')} className="font-bold text-[#253894] text-sm border border-gray-200 rounded px-2 py-1">
              {lang === 'hy' ? 'EN' : 'HY'}
           </Link>
           <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-700">
             {mobileOpen ? <X /> : <Menu />}
           </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl"
          >
            <div className="flex flex-col p-6 gap-4 text-center text-lg">
              <Link href={`/${lang}/news`} onClick={() => setMobileOpen(false)}>{dict.nav.news}</Link>
              <Link href={`/${lang}#calendar`} onClick={() => setMobileOpen(false)}>{dict.nav.events}</Link>
              <Link href={`/${lang}/gallery`} onClick={() => setMobileOpen(false)}>{dict.nav.gallery}</Link>
              <Link href={`/${lang}/apply`} className="text-[#253894] font-bold" onClick={() => setMobileOpen(false)}>{dict.nav.apply}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
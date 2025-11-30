'use client'

import { useActionState, useState, useEffect } from 'react'
import { loginAction } from '../actions'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Eye, EyeOff, ShieldCheck, Activity, Terminal } from 'lucide-react'

export default function AdminLogin() {
  const [state, action, isPending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Анимация тряски при ошибке
  const shakeVariant = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans selection:bg-[#63A900] selection:text-white">
      
      {/* --- Живой Фон --- */}
      <div className="absolute inset-0 z-0">
        {/* Сетка */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Плавающие пятна света */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#253894] rounded-full blur-[128px] opacity-40"
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#63A900] rounded-full blur-[128px] opacity-30"
        />
      </div>

      {/* --- Карточка входа --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10 w-full max-w-[420px] p-4"
      >
        <motion.div 
          variants={state?.error ? shakeVariant : {}}
          animate={state?.error ? "shake" : ""}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Декоративная линия сверху */}
          <div className="h-1 w-full bg-gradient-to-r from-[#253894] via-[#63A900] to-[#253894]"></div>

          <div className="p-8 md:p-10">
            
            {/* Заголовок */}
            <div className="text-center mb-10">
              <motion.div 
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-20 h-20 bg-gradient-to-br from-[#253894] to-black rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/30 border border-white/5 mb-6"
              >
                <ShieldCheck size={40} className="text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">System Access</h1>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>SECURE CONNECTION ESTABLISHED</span>
              </div>
            </div>

            {/* Форма */}
            <form action={action} className="space-y-6">
              
              {/* Логин */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#253894] transition-colors" size={20} />
                  <input 
                    name="username" 
                    type="text" 
                    placeholder="Admin Username"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#253894] focus:ring-1 focus:ring-[#253894] transition-all placeholder:text-gray-600 font-medium"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Пароль */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Passkey</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#63A900] transition-colors" size={20} />
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#63A900] focus:ring-1 focus:ring-[#63A900] transition-all placeholder:text-gray-600 font-medium"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Ошибка */}
              <AnimatePresence>
                {state?.error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 text-center font-medium flex items-center justify-center gap-2"
                  >
                    <Activity size={16} /> {state.error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Кнопка */}
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full py-4 bg-gradient-to-r from-[#253894] to-[#1a2b7a] hover:from-[#2e45b5] hover:to-[#253894] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mt-4 group"
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate</span>
                    <Terminal size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>

            </form>
          </div>
          
          {/* Footer карточки */}
          <div className="bg-white/5 border-t border-white/5 p-4 text-center">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              Restricted Area • StudentBiz Admin
            </p>
          </div>
        </motion.div>
        
        {/* Версия снизу */}
        <div className="text-center mt-8 opacity-30 hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-white font-mono">v2.0.5 Secure Build</p>
        </div>
      </motion.div>
    </div>
  )
}
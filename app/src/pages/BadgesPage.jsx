import React from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { badges } from '../data/badges'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, CheckCircle2, Lock } from 'lucide-react'

export default function BadgesPage() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const getStats = useGameStore(s => s.getStats)

  if (!activeProfile) return <Navigate to="/" replace />
  const stats = getStats(activeProfile.id)

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard-enfant" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm mb-6">
        <ArrowLeft className="h-4 w-4" /> رجوع إلى لوحة التحكم
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-50 text-gold-500 mb-4 shadow-sm border border-gold-100">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">خزانة الأوسمة</h1>
        <p className="font-arabic text-xl text-brand-600" dir="rtl">خِزَانَةُ الأَوْسِمَة</p>
        <p className="text-slate-500 font-medium mt-2">استمر في اللعب لفتح جميع الأوسمة! 🏅</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {badges.map((badge, i) => {
          const unlocked = stats.badges?.includes(badge.id) || badge.condition(stats)
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2rem] border-2 p-6 transition-all duration-500 ${
                unlocked 
                  ? 'border-gold-300 shadow-gold-100 shadow-xl' 
                  : 'border-slate-100 dark:border-slate-700 opacity-80'
              }`}
            >
              {/* Background Gradient for Unlocked */}
              {unlocked && (
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${badge.color}`} />
              )}

              <div className="flex gap-5 items-start relative z-10">
                <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${
                  unlocked ? 'bg-gradient-to-br ' + badge.color + ' text-white scale-110 shadow-lg' : 'bg-slate-50 dark:bg-slate-900 text-slate-300 grayscale'
                }`}>
                  {badge.emoji}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-black text-lg ${unlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                      {badge.nom}
                    </h3>
                    {unlocked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <p className={`font-arabic text-base mb-2 ${unlocked ? 'text-brand-600' : 'text-slate-400'}`} dir="rtl">
                    {badge.nomAr}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {badge.description}
                  </p>

                  {/* Progress Bar (simplified) */}
                  {!unlocked && (
                    <div className="mt-4">
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-300 rounded-full transition-all duration-1000" 
                            style={{ width: '30%' }} // Note: In a real app, calculate progress based on condition
                          />
                       </div>
                       <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">قيد التنفيذ</p>
                    </div>
                  )}
                </div>
              </div>

              {unlocked && (
                <motion.div 
                  className="absolute -bottom-1 -right-1"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.5 }}
                >
                  <div className="bg-emerald-500 text-white p-1.5 rounded-tl-2xl rounded-br-[1.8rem]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-12 text-center p-8 bg-brand-50 rounded-[2.5rem] border border-brand-100">
        <p className="text-brand-700 font-bold mb-2">أنت رائع يا {activeProfile.prenom}!</p>
        <p className="text-slate-500 text-sm">كل نشاط تقوم به يقربك من وسام جديد. استمر في التألق! ✨</p>
      </div>
    </div>
  )
}

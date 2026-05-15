import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { motion } from 'framer-motion'
import { Headphones, Grid3X3, Ear, PenTool, Layers, Star, MessageCircle } from 'lucide-react'

const EXERCICES = [
  { id: 'ecoute', path: '/ecoute', nom: 'استمع وتعرّف', nomAr: 'اِسْتَمِعْ', emoji: '🎧', icon: Headphones, desc: 'استمع إلى الحرف ثم اختر الإجابة الصحيحة', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', pts: 25, statKey: 'ecoute' },
  { id: 'memory', path: '/memory', nom: 'لعبة الذاكرة', nomAr: 'ذَاكِرَة', emoji: '🧠', icon: Grid3X3, desc: 'اعثر على أزواج الحروف المتشابهة', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50', pts: 20, statKey: 'memory' },
  { id: 'phonemes', path: '/phonemes', nom: 'ميّز الأصوات', nomAr: 'أَيُّ صَوْت؟', emoji: '👂', icon: Ear, desc: 'ميّز بين الأصوات العربية المتقاربة', color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50', pts: 30, statKey: 'phonemes' },
  { id: 'tracage', path: '/tracage', nom: 'تتبع الحرف', nomAr: 'اُكْتُبْ', emoji: '✏️', icon: PenTool, desc: 'اكتب الحروف بإصبعك على اللوحة', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50', pts: 20, statKey: 'tracage' },
  { id: 'flashcards', path: '/flashcards', nom: 'بطاقات الكلمات', nomAr: 'كَلِمَات', emoji: '📷', icon: Layers, desc: 'اكتشف كلمات عربية مع بطاقات تفاعلية', color: 'from-rose-400 to-rose-600', bg: 'bg-rose-50', pts: 5, statKey: 'flashcards' },
  { id: 'conversation', path: '/conversation', nom: 'المحادثة', nomAr: 'تَحَدَّثْ', emoji: '💬', icon: MessageCircle, desc: 'تدرّب على الحوار والردّ على الأسئلة', color: 'from-sky-400 to-sky-600', bg: 'bg-sky-50', pts: 15, statKey: 'conversation' },
]

export default function Modules() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const getStats = useGameStore(s => s.getStats)

  if (!activeProfile) return <Navigate to="/" replace />

  const stats = getStats(activeProfile.id)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1 flex items-center justify-center gap-3">
          مَرْحَبًا {activeProfile.prenom} ! 
          <div className="w-12 h-12 rounded-2xl bg-brand-50 overflow-hidden shadow-sm border border-brand-100 flex-shrink-0">
            {activeProfile.avatar?.startsWith('/') ? (
              <img src={activeProfile.avatar} alt={activeProfile.prenom} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl flex items-center justify-center h-full">{activeProfile.avatar}</span>
            )}
          </div>
        </h1>
        <p className="text-slate-500 font-medium">اختر لعبة لتتعلم 🎮</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="bg-gold-100 text-gold-600 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-1">
            <Star className="h-4 w-4" fill="currentColor" /> {activeProfile.pointsTotal} نقطة
          </span>
          <span className="bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full font-bold text-sm">
            المستوى {activeProfile.niveau}
          </span>
          {stats.streak > 0 && (
            <span className="bg-coral-50 text-coral-500 px-4 py-1.5 rounded-full font-bold text-sm">
              🔥 {stats.streak} يوم
            </span>
          )}
        </div>
      </motion.div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {EXERCICES.map((exo, i) => {
          const Icon = exo.icon
          const stat = stats[exo.statKey] || {}
          const sessions = stat.total || 0

          return (
            <motion.div
              key={exo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={exo.path}
                className="block bg-white dark:bg-slate-800 rounded-3xl card-shadow border border-slate-100 dark:border-slate-700 hover:card-shadow-lg hover:border-brand-200 transition-all duration-300 overflow-hidden group"
              >
                <div className={`bg-gradient-to-br ${exo.color} p-5 text-white relative overflow-hidden`}>
                  <div className="absolute -top-4 -right-4 text-6xl opacity-20 group-hover:scale-110 transition-transform">
                    {exo.emoji}
                  </div>
                  <Icon className="h-8 w-8 mb-2 relative z-10" />
                  <h3 className="font-arabic text-2xl relative z-10" dir="rtl">{exo.nomAr}</h3>
                  <p className="font-bold text-sm opacity-90 relative z-10">{exo.nom}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-500 font-medium mb-3">{exo.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                      +{exo.pts} نقطة
                    </span>
                    {sessions > 0 && (
                      <span className="text-xs font-bold text-slate-400">
                        {sessions} جلسة
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { useSRSStore } from '../store/useSRSStore'
import { getCurrentLevel, CURRICULUM_LEVELS, calculateLevelMastery } from '../data/curriculum'
import { motion } from 'framer-motion'
import { Headphones, Grid3X3, Ear, PenTool, Layers, Star, MessageCircle, Music, BookOpen, ClipboardCheck, Clock, Flame, ChevronRight as ChevRight } from 'lucide-react'

// Séquences recommandées — 3 exercices × 5 min — tournent tous les 3 jours
const SESSION_SEQUENCES = [
  [
    { path: '/ecoute',   label: 'Écoute & Reconnais', emoji: '🎧', min: 5 },
    { path: '/memory',   label: 'Memory des lettres',  emoji: '🧠', min: 5 },
    { path: '/flashcards',label: 'Flashcards',         emoji: '📷', min: 5 },
  ],
  [
    { path: '/phonemes', label: 'Distingue les sons',  emoji: '👂', min: 5 },
    { path: '/syllabes', label: 'Syllabes',            emoji: '🔤', min: 5 },
    { path: '/conversation',label: 'Conversation',     emoji: '💬', min: 5 },
  ],
  [
    { path: '/tracage',  label: 'Traçage',             emoji: '✏️', min: 5 },
    { path: '/chanson',  label: "Chanson de l'alphabet",emoji: '🎵', min: 5 },
    { path: '/ecoute',   label: 'Écoute & Reconnais',  emoji: '🎧', min: 5 },
  ],
]

const EXERCICES = [
  { id: 'ecoute',      path: '/ecoute',      nom: 'استمع وتعرّف',  nomAr: 'اِسْتَمِعْ',    emoji: '🎧', icon: Headphones,    desc: 'استمع إلى الحرف ثم اختر الإجابة الصحيحة',     color: 'from-blue-400 to-blue-600',    pts: 25,  statKey: 'ecoute' },
  { id: 'memory',      path: '/memory',      nom: 'لعبة الذاكرة',  nomAr: 'ذَاكِرَة',     emoji: '🧠', icon: Grid3X3,       desc: 'اعثر على أزواج الحروف المتشابهة',              color: 'from-purple-400 to-purple-600', pts: 20,  statKey: 'memory' },
  { id: 'phonemes',    path: '/phonemes',    nom: 'ميّز الأصوات',  nomAr: 'أَيُّ صَوْت؟',  emoji: '👂', icon: Ear,           desc: 'ميّز بين الأصوات العربية المتقاربة',            color: 'from-emerald-400 to-emerald-600', pts: 30, statKey: 'phonemes' },
  { id: 'tracage',     path: '/tracage',     nom: 'تتبع الحرف',   nomAr: 'اُكْتُبْ',      emoji: '✏️', icon: PenTool,       desc: 'اكتب الحروف بإصبعك على اللوحة',                color: 'from-amber-400 to-amber-600',   pts: 20,  statKey: 'tracage' },
  { id: 'syllabes',    path: '/syllabes',    nom: 'المقاطع',      nomAr: 'مَقَاطِع',      emoji: '🔤', icon: BookOpen,      desc: 'تعلّم المقاطع: حرف + حركة → بَ / بِ / بُ',     color: 'from-teal-400 to-teal-600',     pts: 20,  statKey: 'syllabes', isNew: true },
  { id: 'flashcards',  path: '/flashcards',  nom: 'بطاقات الكلمات',nomAr: 'كَلِمَات',      emoji: '📷', icon: Layers,        desc: 'اكتشف كلمات عربية مع بطاقات تفاعلية',          color: 'from-rose-400 to-rose-600',     pts: 5,   statKey: 'flashcards' },
  { id: 'conversation',path: '/conversation',nom: 'المحادثة',     nomAr: 'تَحَدَّثْ',     emoji: '💬', icon: MessageCircle, desc: 'تدرّب على الحوار والردّ على الأسئلة',           color: 'from-sky-400 to-sky-600',       pts: 15,  statKey: 'conversation' },
  { id: 'chanson',     path: '/chanson',     nom: 'أغنية الحروف', nomAr: 'الأَبْجَدِيَّة', emoji: '🎵', icon: Music,         desc: 'تعلّم الأبجدية العربية كاملة بالترتيب والصوت',  color: 'from-pink-400 to-pink-600',     pts: 10,  statKey: 'chanson',  isNew: true },
  { id: 'evaluation',  path: '/evaluation',  nom: 'تقييم المستوى',nomAr: 'تَقْيِيم',      emoji: '📊', icon: ClipboardCheck,desc: 'اختبر معرفتك واكسب شهادة إتمام المستوى',        color: 'from-indigo-400 to-indigo-600', pts: 50,  statKey: 'evaluation',isNew: true },
]

export default function Modules() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const getStats = useGameStore(s => s.getStats)
  const srsItems = useSRSStore(s => s.getProfileItems(activeProfile?.id))
  if (!activeProfile) return <Navigate to="/" replace />

  const stats = getStats(activeProfile.id)
  const currentLevel = getCurrentLevel(srsItems)
  const levelInfo = CURRICULUM_LEVELS.find(l => l.id === currentLevel)

  // Session recommandée du jour (change tous les 3 jours)
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3)) % SESSION_SEQUENCES.length
  const sessionDuJour = SESSION_SEQUENCES[dayIndex]

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
          <span className={`px-4 py-1.5 rounded-full font-bold text-sm text-white bg-gradient-to-r ${levelInfo?.color || 'from-brand-400 to-brand-600'}`}>
            {levelInfo?.emoji} {levelInfo?.name}
          </span>
        </div>
      </motion.div>

      {/* Session du jour */}
      <motion.div
        className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-5 mb-8 text-white shadow-xl"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 opacity-80" />
            <span className="font-black text-sm">جَلْسَةُ الْيَوْم — 15 دقيقة</span>
          </div>
          {stats.streak > 0 && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              <Flame className="h-4 w-4 text-amber-300" />
              <span className="font-black text-sm">{stats.streak} يوم</span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {sessionDuJour.map((step, i) => (
            <Link key={i} to={step.path}
              className="flex-1 bg-white/15 hover:bg-white/25 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3 transition-all border border-white/20 group">
              <span className="text-2xl">{step.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">{step.label}</p>
                <p className="text-xs opacity-70">{step.min} دقائق</p>
              </div>
              <ChevRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
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
                  {exo.isNew && (
                    <span className="absolute top-2 left-2 bg-white/30 backdrop-blur text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/40 z-20">
                      ✨ جديد
                    </span>
                  )}
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

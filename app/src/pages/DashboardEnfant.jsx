import React from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { badges } from '../data/badges'
import ProgressBar from '../components/ui/ProgressBar'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, Flame, Trophy } from 'lucide-react'

export default function DashboardEnfant() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const getStats = useGameStore(s => s.getStats)
  const getDailyQuest = useGameStore(s => s.getDailyQuest)

  if (!activeProfile) return <Navigate to="/" replace />
  const stats = getStats(activeProfile.id)
  const dailyQuest = getDailyQuest(activeProfile.id)

  const exercices = [
    { nom: 'الاستماع والتمييز', key: 'ecoute', max: 28, value: stats.ecoute?.correct || 0, color: 'brand', emoji: '🎧' },
    { nom: 'الذاكرة', key: 'memory', max: 10, value: stats.memory?.completed || 0, color: 'purple', emoji: '🧠' },
    { nom: 'الأصوات', key: 'phonemes', max: 6, value: stats.phonemes?.correct || 0, color: 'emerald', emoji: '👂' },
    { nom: 'تتبع الحروف', key: 'tracage', max: 12, value: stats.tracage?.completed || 0, color: 'gold', emoji: '✏️' },
    { nom: 'بطاقات الكلمات', key: 'flashcards', max: 100, value: stats.flashcards?.vus || 0, color: 'coral', emoji: '📷' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/modules" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm mb-6">
        <ArrowLeft className="h-4 w-4" /> رجوع إلى الألعاب
      </Link>

      {/* Profile Card */}
      <motion.div className="bg-white dark:bg-slate-800 rounded-3xl card-shadow p-6 mb-6 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-center mb-3">
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white bg-brand-50">
            {activeProfile.avatar?.startsWith('/') ? (
              <img src={activeProfile.avatar} alt={activeProfile.prenom} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl flex items-center justify-center h-full">{activeProfile.avatar}</span>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{activeProfile.prenom}</h2>
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="bg-gold-100 text-gold-600 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-1">
            <Star className="h-4 w-4" fill="currentColor" /> {activeProfile.pointsTotal} نقطة
          </span>
          <span className="bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full font-bold text-sm">
            المستوى {activeProfile.niveau}
          </span>
          {stats.streak > 0 && (
            <span className="bg-coral-50 text-coral-500 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-1">
              <Flame className="h-4 w-4" /> {stats.streak}j
            </span>
          )}
        </div>
      </motion.div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl card-shadow p-5 mb-6 border border-brand-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-slate-800 dark:text-slate-100">مهمة اليوم</h3>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${dailyQuest.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
            {dailyQuest.completed ? 'مكتملة' : 'قيد التنفيذ'}
          </span>
        </div>
        <p className="text-sm text-slate-500 font-medium mb-3">
          أنجز {dailyQuest.target} جلسات يومية للحفاظ على الاستمرارية.
        </p>
        <ProgressBar value={dailyQuest.count} max={dailyQuest.target} color="brand" label="التقدم اليومي" />
      </div>

      {/* Progress by exercise */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl card-shadow p-6 mb-6">
        <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 mb-4">📊 تقدمي</h3>
        <div className="space-y-4">
          {exercices.map(ex => (
            <div key={ex.key} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{ex.emoji}</span>
              <div className="flex-1">
                <ProgressBar value={ex.value} max={ex.max} color={ex.color} label={ex.nom} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl card-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold-500" /> شاراتي
          </h3>
          <Link to="/badges" className="text-xs font-bold text-brand-600 hover:underline">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(badge => {
            const unlocked = stats.badges?.includes(badge.id) || badge.condition(stats)
            return (
              <div key={badge.id}
                className={`p-4 rounded-2xl text-center border-2 transition-all ${
                  unlocked
                    ? 'border-gold-300 bg-gold-50 shadow-sm'
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 opacity-50 grayscale'
                }`}
              >
                <div className={`text-3xl mb-2 ${unlocked ? 'animate-float' : ''}`}>{badge.emoji}</div>
                <p className="font-bold text-xs text-slate-700 dark:text-slate-200">{badge.nom}</p>
                <p className="font-arabic text-xs text-brand-500 mt-0.5" dir="rtl">{badge.nomAr}</p>
                {!unlocked && <p className="text-[10px] text-slate-400 mt-1">{badge.description}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

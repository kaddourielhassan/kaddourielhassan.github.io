import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { categories } from '../data/vocabulaire'
import AudioButton from '../components/ui/AudioButton'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'

export default function FlashcardsVocabulaire() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const addPoints = useProfileStore(s => s.addPoints)
  const addResult = useGameStore(s => s.addResult)

  const [selectedCat, setSelectedCat] = useState(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [direction, setDirection] = useState(1)
  const [seenCount, setSeenCount] = useState(0)

  if (!activeProfile) return <Navigate to="/" replace />

  // Category selection
  if (selectedCat === null) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/modules" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> رجوع
          </Link>
        </div>
        <h2 className="text-3xl font-arabic text-brand-700 mb-1 text-center" dir="rtl">اِخْتَرْ فِئَةً</h2>
        <p className="text-center font-bold text-slate-400 text-sm">اختر فئة 📷</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              onClick={() => { setSelectedCat(cat); setCardIndex(0); setRevealed(false); setSeenCount(0) }}
              className="bg-white rounded-2xl card-shadow border border-slate-100 p-4 text-left hover:card-shadow-lg hover:border-brand-200 transition-all group"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform inline-block">
                {cat.id === 'nombres' ? (
                  <span className="font-black text-brand-600 bg-brand-50 px-2 rounded-lg border border-brand-100">1 2 3</span>
                ) : cat.emoji}
              </span>
              <h3 className="font-arabic text-xl text-brand-700" dir="rtl">{cat.nomAr}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.nom}</p>
              <p className="text-[10px] text-slate-300 font-medium mt-1">{cat.mots.length} كلمات</p>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  const mots = selectedCat.mots
  const mot = mots[cardIndex]
  const fallbackImage = '/resources/images/placeholder-word.svg'

  const goTo = (dir) => {
    setDirection(dir)
    const nextIndex = cardIndex + dir
    if (nextIndex >= 0 && nextIndex < mots.length) {
      if (!revealed && dir > 0) {
        // Count as seen even without reveal
      }
      setCardIndex(nextIndex)
      setRevealed(false)
    }
  }

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true)
      setSeenCount(s => s + 1)
      addPoints(5)
      addResult(activeProfile.id, { type: 'flashcards', mot: mot.fr, categorie: selectedCat.id })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setSelectedCat(null)} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> الفئات
        </button>
        <span className="font-bold text-sm text-slate-500">{cardIndex + 1}/{mots.length}</span>
        <span className="bg-gold-100 text-gold-600 px-3 py-1 rounded-full font-bold text-sm">👁️ {seenCount}</span>
      </div>

      <div className="w-full h-2.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500" style={{ width: `${((cardIndex + 1) / mots.length) * 100}%` }} />
      </div>

      <div className="text-center mb-2">
        <span className="text-2xl">{selectedCat.emoji}</span>
        <h3 className="font-arabic text-2xl text-brand-700" dir="rtl">{selectedCat.nomAr}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedCat.nom}</p>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cardIndex}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 60 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl card-shadow-lg border border-slate-100 p-8 text-center mb-6 min-h-[280px] flex flex-col items-center justify-center"
        >
          <img
            src={mot.image}
            alt={mot.ar}
            className="w-full max-w-xs h-44 object-cover rounded-2xl border border-slate-100 mb-6"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = fallbackImage
            }}
          />
          {/* Digit display for numbers category */}
          {selectedCat.id === 'nombres' && (
            <div className="mb-4">
              <span className="text-5xl font-black text-slate-200 bg-slate-50 px-6 py-2 rounded-2xl border-2 border-slate-100">
                {mot.fr}
              </span>
            </div>
          )}

          {/* Le mot Arabe est maintenant l'élément principal */}
          <p className="font-arabic text-6xl text-brand-700 mb-6" dir="rtl">{mot.ar}</p>

          {/* Audio button */}
          <AudioButton audioPath={mot.audio} speakText={mot.ar} size="xl" className="mb-6" />

          {/* French reveal */}
          {revealed ? (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
              <p className="text-2xl font-black text-slate-800">{mot.fr}</p>
              <p className="text-sm font-medium text-slate-400 italic">{mot.translit}</p>
              <p className="text-xs text-emerald-500 font-bold mt-2">+5 ⭐</p>
            </motion.div>
          ) : (
            <button onClick={handleReveal}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all hover:scale-105 shadow-lg shadow-brand-200">
              <Eye className="h-4 w-4" /> عرض الترجمة
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <button onClick={() => goTo(-1)} disabled={cardIndex === 0}
          className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 transition-all">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => goTo(1)} disabled={cardIndex >= mots.length - 1}
          className="h-12 w-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center hover:bg-brand-200 disabled:opacity-30 transition-all">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { useSRSStore } from '../store/useSRSStore'
import { phonemes } from '../data/phonemes'
import { getAvailablePhonemes, getCurrentLevel, CURRICULUM_LEVELS } from '../data/curriculum'
import { selectItemsForReview } from '../utils/srsAlgorithm'
import PremiumAudioPlayer from '../components/ui/PremiumAudioPlayer'
import { usePreloadAudios } from '../hooks/usePreloadAudios'
import ConfettiOverlay from '../components/ui/ConfettiOverlay'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw, Trophy, Lock } from 'lucide-react'
import { playSuccess, playError, playVictory, playPoints, playArabicFeedback } from '../utils/soundEffects'
import { AuditingMetrics, estimateConfidence } from '../utils/auditingMetrics'

export default function DistinctionPhonemes() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const addPoints = useProfileStore(s => s.addPoints)
  const addResult = useGameStore(s => s.addResult)
  const srsItems = useSRSStore(s => s.getProfileItems(activeProfile?.id))
  const srsRecordAnswer = useSRSStore(s => s.recordAnswer)
  const srsIncrementSession = useSRSStore(s => s.incrementSession)
  const srsSessionCount = useSRSStore(s => s.getSessionCount(activeProfile?.id))

  // Curriculum level
  const currentLevel = getCurrentLevel(srsItems)
  const availablePhonemes = useMemo(() => getAvailablePhonemes(currentLevel), [currentLevel])

  // Build ordered list using SRS priority
  const orderedPhonemes = useMemo(() => {
    if (availablePhonemes.length === 0) return []
    const keys = availablePhonemes.map(p => `phoneme_${p.id}`)
    const priorityKeys = selectItemsForReview(keys, srsItems, availablePhonemes.length, srsSessionCount)
    return priorityKeys.map(key => {
      const id = parseInt(key.replace('phoneme_', ''))
      return availablePhonemes.find(p => p.id === id)
    }).filter(Boolean)
  }, [availablePhonemes, srsItems, srsSessionCount])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [targetIsFirst, setTargetIsFirst] = useState(() => Math.random() > 0.5)

  // Preload audios for performance
  const allAudioUrls = useMemo(() => {
    return orderedPhonemes.flatMap(p => [p.lettre1.audio, p.lettre2.audio]).filter(Boolean)
  }, [orderedPhonemes])
  usePreloadAudios(allAudioUrls)

  // Timing
  const sessionIdRef = useRef(`phon_${Date.now()}`)
  const questionStartRef = useRef(Date.now())

  // Session management
  useEffect(() => {
    if (!activeProfile) return
    sessionIdRef.current = `phon_${Date.now()}`
    AuditingMetrics.startSession(sessionIdRef.current, activeProfile?.id, 'phonemes')
    srsIncrementSession(activeProfile.id)
    return () => {
      AuditingMetrics.endSession(sessionIdRef.current)
    }
  }, [activeProfile?.id])

  // Reset question timer
  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [currentIndex])

  if (!activeProfile) return <Navigate to="/" replace />
  if (orderedPhonemes.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-6xl mb-4"><Lock className="h-16 w-16 text-slate-300 mx-auto" /></div>
        <h2 className="text-2xl font-black text-slate-700 dark:text-slate-200 mb-2">مقفل</h2>
        <p className="text-slate-400 font-medium mb-6">أكمل المستوى الأول في تمرين الاستماع لفتح هذا التمرين</p>
        <Link to="/modules" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold">
          <ArrowLeft className="h-4 w-4" /> رجوع
        </Link>
      </div>
    )
  }

  const current = orderedPhonemes[currentIndex]
  const target = targetIsFirst ? current.lettre1 : current.lettre2
  const levelInfo = CURRICULUM_LEVELS.find(l => l.id === currentLevel)

  const handleAnswer = (isFirst) => {
    if (selected !== null) return
    const correct = isFirst === targetIsFirst
    setSelected(isFirst ? 'first' : 'second')
    setIsCorrect(correct)

    const responseTime = Date.now() - questionStartRef.current
    const difficulty = current.difficulte || 2
    const confidence = estimateConfidence(responseTime, difficulty)

    // Record in SRS
    srsRecordAnswer(activeProfile.id, current.id, 'phoneme', correct)

    if (correct) {
      setScore(s => s + 30)
      setShowConfetti(true)
      addPoints(30)
      addResult(activeProfile.id, { type: 'phonemes', correct: true, phonemeId: current.id })
      playSuccess()
      playPoints()
      playArabicFeedback('correct')
      AuditingMetrics.track({
        module: 'phonemes', type: 'correct', component: 'DistinctionPhonemes',
        profileId: activeProfile.id, profileName: activeProfile.prenom,
        metadata: { sessionId: sessionIdRef.current, responseTime, difficulty, confidence, phonemeId: current.id }
      })
    } else {
      addResult(activeProfile.id, { type: 'phonemes', correct: false, phonemeId: current.id })
      playError()
      playArabicFeedback('retry')
      AuditingMetrics.track({
        module: 'phonemes', type: 'error', component: 'DistinctionPhonemes',
        profileId: activeProfile.id, profileName: activeProfile.prenom,
        metadata: { sessionId: sessionIdRef.current, responseTime, difficulty, confidence, phonemeId: current.id }
      })
    }

    setTimeout(() => {
      if (currentIndex + 1 >= orderedPhonemes.length) {
        setGameOver(true)
        playVictory()
        AuditingMetrics.endSession(sessionIdRef.current)
      } else {
        setCurrentIndex(i => i + 1)
        setSelected(null)
        setIsCorrect(null)
        setTargetIsFirst(Math.random() > 0.5)
      }
    }, 1800)
  }

  const restart = () => {
    setCurrentIndex(0)
    setScore(0)
    setSelected(null)
    setIsCorrect(null)
    setGameOver(false)
    setTargetIsFirst(Math.random() > 0.5)
  }

  if (gameOver) {
    return (
      <motion.div className="max-w-md mx-auto text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-7xl mb-4">{score >= 120 ? '🎉' : '💪'}</div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">اكتمل التمرين!</h2>
        <p className="font-arabic text-2xl text-brand-600 mb-4" dir="rtl">أَحْسَنْتَ!</p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow p-6 mb-6">
          <div className="flex items-center justify-center gap-2 text-4xl font-black text-gold-500 mb-2">
            <Trophy className="h-8 w-8" /> {score}
          </div>
          <p className="text-slate-500 font-medium">نقطة من أصل {orderedPhonemes.length * 30}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors">
            <RotateCcw className="h-4 w-4" /> أعد اللعب
          </button>
          <Link to="/modules" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 transition-colors">
            <ArrowLeft className="h-4 w-4" /> رجوع
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      <div className="flex items-center justify-between mb-6">
        <Link to="/modules" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> رجوع
        </Link>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${levelInfo?.color || 'from-brand-400 to-brand-600'} text-white`}>
            {levelInfo?.emoji} {levelInfo?.name}
          </span>
          <span className="font-bold text-sm text-slate-500">{currentIndex + 1}/{orderedPhonemes.length}</span>
        </div>
        <span className="bg-gold-100 text-gold-600 px-3 py-1 rounded-full font-bold text-sm">⭐ {score}</span>
      </div>

      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" style={{ width: `${(currentIndex / orderedPhonemes.length) * 100}%` }} />
      </div>

      <div className="flex justify-center mb-8">
        <PremiumAudioPlayer
          key={`${currentIndex}-${target.caractere}`}
          url={target.audio}
          fallbackText={target.caractere}
          size="xl"
          autoPlay
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">{current.emoji}</div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-1">أي صوت تسمع؟</h2>
          <p className="font-arabic text-lg text-brand-600 mb-1" dir="rtl">أَيُّ صَوْتٍ تَسْمَعُ؟</p>
          <p className="text-sm text-slate-400 font-bold mb-6" dir="rtl">
            {current.lettre1.nom} أَمْ {current.lettre2.nom}؟
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { data: current.lettre1, isFirst: true },
              { data: current.lettre2, isFirst: false },
            ].map(({ data, isFirst }) => {
              const sel = selected === (isFirst ? 'first' : 'second')
              const isAnswer = isFirst === targetIsFirst
              let cls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:shadow-lg'
              if (selected !== null) {
                if (isAnswer) cls = 'bg-emerald-50 border-emerald-400'
                else if (sel) cls = 'bg-coral-50 border-coral-400'
                else cls = 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-50'
              }

              return (
                <button
                  key={data.caractere}
                  onClick={() => handleAnswer(isFirst)}
                  disabled={selected !== null}
                  className={`p-8 rounded-3xl border-2 shadow-md transition-all duration-300 ${cls}`}
                >
                  <span className="font-arabic text-6xl block mb-3 text-brand-700">{data.caractere}</span>
                  <span className="text-sm font-bold text-slate-500" dir="rtl">{data.nom}</span>
                  <span className="block text-[11px] font-medium text-slate-400 mt-1">{data.typeFr}</span>
                </button>
              )
            })}
          </div>

          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-3 rounded-xl font-bold text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-coral-50 text-coral-600'}`}
              dir="rtl"
            >
              {isCorrect
                ? `✅ مُمْتَاز! الصواب: ${target.nom} (${target.caractere})`
                : `❌ الإجابة الصحيحة: ${target.nom} (${target.caractere})`}
            </motion.div>
          )}

          <div className="mt-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-right" dir="rtl">
            <p className="text-xs text-slate-500 font-bold mb-1">💡 {current.astuce}</p>
            <p className="text-[11px] text-slate-400 font-medium" dir="ltr">{current.astuceFr}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

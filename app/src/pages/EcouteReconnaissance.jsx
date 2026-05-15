import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { alphabet } from '../data/alphabet'
import PremiumAudioPlayer from '../components/ui/PremiumAudioPlayer'
import ConfettiOverlay from '../components/ui/ConfettiOverlay'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { playSuccess, playError, playVictory, playPoints } from '../utils/soundEffects'
import { AuditingMetrics, estimateConfidence } from '../utils/auditingMetrics'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL_QUESTIONS = 10
const POINTS_PER_CORRECT = 25

export default function EcouteReconnaissance() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const addPoints = useProfileStore(s => s.addPoints)
  const addResult = useGameStore(s => s.addResult)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [questions, setQuestions] = useState([])

  // Timing
  const sessionIdRef = useRef(`ecoute_${Date.now()}`)
  const questionStartRef = useRef(Date.now())

  const generateQuestions = useCallback(() => {
    const qs = []
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const shuffled = shuffle(alphabet)
      const correct = shuffled[0]
      const options = shuffle([correct, ...shuffled.slice(1, 4)])
      qs.push({ correct, options })
    }
    return qs
  }, [])

  useEffect(() => { setQuestions(generateQuestions()) }, [])

  // Session management
  useEffect(() => {
    if (!activeProfile) return
    sessionIdRef.current = `ecoute_${Date.now()}`
    AuditingMetrics.startSession(sessionIdRef.current, activeProfile.id, 'ecoute')
    return () => {
      AuditingMetrics.endSession(sessionIdRef.current)
    }
  }, [activeProfile?.id])

  // Reset question timer
  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [questionIndex])

  if (!activeProfile) return <Navigate to="/" replace />
  if (questions.length === 0) return null

  const current = questions[questionIndex]

  const handleAnswer = (lettre) => {
    if (selected !== null) return
    setSelected(lettre.id)
    const correct = lettre.id === current.correct.id
    setIsCorrect(correct)

    const responseTime = Date.now() - questionStartRef.current
    const difficulty = 3 // Audio recognition is inherently moderate difficulty
    const confidence = estimateConfidence(responseTime, difficulty)

    if (correct) {
      setScore(s => s + POINTS_PER_CORRECT)
      setShowConfetti(true)
      addPoints(POINTS_PER_CORRECT)
      addResult(activeProfile.id, { type: 'ecoute', correct: true, lettreId: current.correct.id })
      playSuccess()
      playPoints()
      AuditingMetrics.track({
        module: 'ecoute', type: 'correct', component: 'EcouteReconnaissance',
        profileId: activeProfile.id, profileName: activeProfile.prenom,
        metadata: { sessionId: sessionIdRef.current, responseTime, difficulty, confidence, lettreId: current.correct.id }
      })
    } else {
      addResult(activeProfile.id, { type: 'ecoute', correct: false, lettreId: current.correct.id })
      playError()
      AuditingMetrics.track({
        module: 'ecoute', type: 'error', component: 'EcouteReconnaissance',
        profileId: activeProfile.id, profileName: activeProfile.prenom,
        metadata: { sessionId: sessionIdRef.current, responseTime, difficulty, confidence, lettreId: current.correct.id }
      })
    }

    setTimeout(() => {
      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        setGameOver(true)
        playVictory()
        AuditingMetrics.endSession(sessionIdRef.current)
      } else {
        setQuestionIndex(q => q + 1)
        setSelected(null)
        setIsCorrect(null)
      }
    }, 1500)
  }

  const restart = () => {
    setQuestions(generateQuestions())
    setQuestionIndex(0)
    setScore(0)
    setSelected(null)
    setIsCorrect(null)
    setGameOver(false)
    // New session for restart
    sessionIdRef.current = `ecoute_${Date.now()}`
    AuditingMetrics.startSession(sessionIdRef.current, activeProfile.id, 'ecoute')
  }

  if (gameOver) {
    return (
      <motion.div className="max-w-md mx-auto text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-7xl mb-4">{score >= TOTAL_QUESTIONS * POINTS_PER_CORRECT * 0.7 ? '🎉' : '💪'}</div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">أحسنت يا {activeProfile.prenom}!</h2>
        <p className="font-arabic text-2xl text-brand-600 mb-4" dir="rtl">أَحْسَنْتَ!</p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow p-6 mb-6">
          <div className="flex items-center justify-center gap-2 text-4xl font-black text-gold-500 mb-2">
            <Trophy className="h-8 w-8" /> {score}
          </div>
          <p className="text-slate-500 font-medium">نقاط مكتسبة من أصل {TOTAL_QUESTIONS * POINTS_PER_CORRECT}</p>
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
    <div className="max-w-2xl mx-auto">
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/modules" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> رجوع
        </Link>
        <span className="font-bold text-sm text-slate-500">{questionIndex + 1}/{TOTAL_QUESTIONS}</span>
        <span className="bg-gold-100 text-gold-600 px-3 py-1 rounded-full font-bold text-sm">⭐ {score}</span>
      </div>

      {/* Progress */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500" style={{ width: `${((questionIndex) / TOTAL_QUESTIONS) * 100}%` }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">أي حرف تسمع؟</h2>
          <p className="font-arabic text-lg text-brand-600 mb-6" dir="rtl">أَيُّ حَرْفٍ تَسْمَعُ؟</p>

          {/* Audio Button */}
          <div className="flex justify-center mb-8">
            <PremiumAudioPlayer
              url={current.correct.audio}
              fallbackText={current.correct.lettre}
              size="xl"
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {current.options.map((lettre) => {
              const isSelected = selected === lettre.id
              const isCorrectAnswer = lettre.id === current.correct.id
              let cardClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:shadow-lg'

              if (selected !== null) {
                if (isCorrectAnswer) cardClass = 'bg-emerald-50 border-emerald-400 shadow-emerald-200'
                else if (isSelected && !isCorrect) cardClass = 'bg-coral-50 border-coral-400 shadow-coral-200'
                else cardClass = 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-50'
              }

              return (
                <button
                  key={lettre.id}
                  onClick={() => handleAnswer(lettre)}
                  disabled={selected !== null}
                  className={`p-6 rounded-3xl border-2 shadow-md transition-all duration-300 ${cardClass}`}
                >
                  <span className="font-arabic text-5xl block mb-2" style={{ color: lettre.color }}>{lettre.lettre}</span>
                  <span className="text-sm font-bold text-slate-500">{lettre.translit}</span>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-3 rounded-xl font-bold text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-coral-50 text-coral-600'}`}
            >
              {isCorrect ? '✅ رائع! أَحْسَنْتَ!' : `❌ الإجابة الصحيحة: ${current.correct.translit} (${current.correct.lettre})`}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { lettresPrioritaires } from '../data/alphabet'
import ConfettiOverlay from '../components/ui/ConfettiOverlay'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { playTap, playSuccess, playVictory, playPoints } from '../utils/soundEffects'
import { AuditingMetrics } from '../utils/auditingMetrics'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function MemoryLettres() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const addPoints = useProfileStore(s => s.addPoints)
  const addResult = useGameStore(s => s.addResult)

  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  const initGame = useCallback(() => {
    const selected = shuffle(lettresPrioritaires).slice(0, 6)
    const pairs = selected.flatMap(l => [
      { uid: `${l.id}-a-${Math.random()}`, lettreId: l.id, display: l.lettre, color: l.color, type: 'lettre' },
      { uid: `${l.id}-b-${Math.random()}`, lettreId: l.id, display: l.lettre, color: l.color, type: 'lettre' },
    ])
    setCards(shuffle(pairs))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameOver(false)
    setTimer(0)
    setTimerActive(true)
  }, [])

  useEffect(() => { initGame() }, [initGame])

  useEffect(() => {
    if (!timerActive) return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [timerActive])

  if (!activeProfile) return <Navigate to="/" replace />

  const handleFlip = (index) => {
    if (flipped.length === 2) return
    if (flipped.includes(index)) return
    if (matched.includes(cards[index].lettreId)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)
    playTap()

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = newFlipped
      if (cards[a].lettreId === cards[b].lettreId) {
        const newMatched = [...matched, cards[a].lettreId]
        setMatched(newMatched)
        setFlipped([])
        playSuccess()
        if (newMatched.length === 6) {
          setTimerActive(false)
          setShowConfetti(true)
          const pts = Math.max(10, 120 - moves * 2)
          addPoints(pts)
          addResult(activeProfile.id, { type: 'memory', completed: true, moves, time: timer })
          playVictory()
          playPoints()
          AuditingMetrics.track({ module: 'memory', type: 'complete', component: 'MemoryLettres', profileId: activeProfile.id, profileName: activeProfile.prenom, metadata: { moves, time: timer } })
          setTimeout(() => setGameOver(true), 1500)
        }
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (gameOver) {
    const pts = Math.max(10, 120 - moves * 2)
    return (
      <motion.div className="max-w-md mx-auto text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">تم العثور على كل الأزواج!</h2>
        <p className="font-arabic text-2xl text-brand-600 mb-6" dir="rtl">مُمْتَاز!</p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow p-6 mb-6 space-y-2">
          <p className="text-slate-600 dark:text-slate-300 font-medium">⏱️ الوقت: <strong>{formatTime(timer)}</strong></p>
          <p className="text-slate-600 dark:text-slate-300 font-medium">🎯 المحاولات: <strong>{moves}</strong></p>
          <p className="text-2xl font-black text-gold-500">+{pts} ⭐</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={initGame} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors">
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
        <span className="font-bold text-sm text-slate-500">⏱️ {formatTime(timer)}</span>
        <span className="font-bold text-sm text-slate-500">🎯 {moves} محاولة</span>
      </div>

      <h2 className="text-center text-xl font-bold text-slate-700 dark:text-slate-200 mb-1">اعثر على الأزواج!</h2>
      <p className="text-center font-arabic text-brand-600 mb-6" dir="rtl">جِدِ الأَزْوَاج!</p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i)
          const isMatched = matched.includes(card.lettreId)
          const showFace = isFlipped || isMatched

          return (
            <motion.button
              key={card.uid}
              onClick={() => handleFlip(i)}
              disabled={isFlipped || isMatched}
              className={`aspect-square rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-center p-2 premium-memory-card ${
                isMatched ? 'bg-emerald-50 border-emerald-300 opacity-70 scale-95' :
                showFace ? 'bg-white dark:bg-slate-800 border-brand-300 shadow-xl' :
                'memory-back-pattern'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {showFace ? (
                <span className={`font-arabic ${card.type === 'lettre' ? 'text-3xl sm:text-5xl' : 'text-lg sm:text-xl text-slate-700 dark:text-slate-200'}`}
                  style={{ color: card.color }} dir="rtl">
                  {card.display}
                </span>
              ) : null}
            </motion.button>
          )
        })}
      </div>

      <p className="text-center text-sm text-slate-400 font-medium mt-4">
        {matched.length}/6 أزواج مكتشفة
      </p>
    </div>
  )
}

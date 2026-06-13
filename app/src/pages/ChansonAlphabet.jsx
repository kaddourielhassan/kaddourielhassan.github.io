import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { alphabet } from '../data/alphabet'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const BASE = import.meta.env.BASE_URL?.replace(/\/+$/, '') || ''

function normalizeAudio(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${BASE}${p}`
}

// Regroupe les lettres par groupe de 4 pour l'affichage
function chunk(arr, size) {
  const res = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}

const MODES = [
  { id: 'auto',   label: 'Auto — défilement',    emoji: '▶️', desc: "Les lettres défilent automatiquement avec l'audio" },
  { id: 'manuel', label: 'Manuel — lettre par lettre', emoji: '👆', desc: 'Clique sur chaque lettre pour l\'entendre' },
  { id: 'quiz',   label: 'Quiz — Quelle lettre ?', emoji: '❓', desc: 'Écoute et retrouve la lettre dans l\'alphabet' },
]

export default function ChansonAlphabet() {
  const soundEnabled = useAppStore(s => s.soundEnabled)
  const [mode, setMode]         = useState(null)
  const [current, setCurrent]   = useState(0)
  const [playing, setPlaying]   = useState(false)
  const [finished, setFinished] = useState(false)
  // Quiz
  const [quizIdx, setQuizIdx]   = useState(0)
  const [quizAns, setQuizAns]   = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizOver, setQuizOver] = useState(false)

  const audioRef = useRef(null)
  const timerRef = useRef(null)

  const playLetter = useCallback((idx) => {
    if (!soundEnabled) return
    const letter = alphabet[idx]
    if (!letter?.audio) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const audio = new Audio(normalizeAudio(letter.audio))
    audioRef.current = audio
    audio.play().catch(() => {})
  }, [soundEnabled])

  // Auto mode: avance à la lettre suivante après 1.8s
  useEffect(() => {
    if (mode !== 'auto' || !playing) return
    playLetter(current)
    timerRef.current = setTimeout(() => {
      if (current + 1 < alphabet.length) {
        setCurrent(c => c + 1)
      } else {
        setPlaying(false)
        setFinished(true)
      }
    }, 1800)
    return () => clearTimeout(timerRef.current)
  }, [mode, playing, current, playLetter])

  const startAuto = () => { setCurrent(0); setPlaying(true); setFinished(false) }
  const togglePause = () => setPlaying(p => !p)
  const prev = () => { clearTimeout(timerRef.current); setCurrent(c => Math.max(0, c - 1)) }
  const next = () => { clearTimeout(timerRef.current); if (current + 1 < alphabet.length) setCurrent(c => c + 1) }

  // Quiz : questions aléatoires
  const buildQuiz = useCallback(() => {
    return alphabet.map((letter, i) => {
      const distractors = alphabet.filter((_, j) => j !== i).sort(() => Math.random() - 0.5).slice(0, 3)
      const options = [letter, ...distractors].sort(() => Math.random() - 0.5)
      return { letter, options }
    }).sort(() => Math.random() - 0.5).slice(0, 10)
  }, [])
  const [quizQuestions, setQuizQuestions] = useState([])

  const startQuiz = () => {
    setQuizQuestions(buildQuiz())
    setQuizIdx(0); setQuizAns(null); setQuizScore(0); setQuizOver(false)
    setMode('quiz')
  }

  const handleQuizAnswer = (letter) => {
    if (quizAns !== null) return
    setQuizAns(letter.id)
    const correct = letter.id === quizQuestions[quizIdx].letter.id
    if (correct) setQuizScore(s => s + 1)
    setTimeout(() => {
      if (quizIdx + 1 >= quizQuestions.length) setQuizOver(true)
      else { setQuizIdx(q => q + 1); setQuizAns(null) }
    }, 1200)
  }

  // --- Choix du mode ---
  if (!mode) {
    return (
      <div className="max-w-lg mx-auto py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/modules" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> رجوع
          </Link>
        </div>
        <h1 className="text-3xl font-arabic text-brand-700 text-center mb-1 font-bold" dir="rtl">الأَبْجَدِيَّة</h1>
        <p className="text-center text-slate-400 font-bold text-sm mb-8">L'alphabet arabe en chanson — 28 lettres</p>

        {/* Aperçu des 28 lettres */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-slate-100 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap justify-center gap-2 font-arabic" dir="rtl">
            {alphabet.map(l => (
              <button key={l.id} onClick={() => playLetter(l.id - 1)}
                className="text-2xl px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                style={{ color: l.color }}>
                {l.lettre}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-3 font-bold">Clique sur une lettre pour l'entendre</p>
        </div>

        <div className="space-y-3">
          {MODES.map((m, i) => (
            <motion.button key={m.id}
              onClick={() => m.id === 'quiz' ? startQuiz() : (setMode(m.id), m.id === 'auto' && startAuto())}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-slate-100 dark:border-slate-700 p-4 text-left hover:border-brand-300 transition-all flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <span className="text-3xl">{m.emoji}</span>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">{m.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // --- Mode AUTO ---
  if (mode === 'auto') {
    const letter = alphabet[current]
    const groups = chunk(alphabet, 7)
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setMode(null); setPlaying(false); clearTimeout(timerRef.current) }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> رجوع
          </button>
          <span className="font-bold text-slate-500 text-sm">{current + 1} / {alphabet.length}</span>
        </div>

        {/* Lettre active */}
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}
            className="text-center mb-8">
            <div className="inline-block bg-white dark:bg-slate-800 rounded-3xl card-shadow border border-slate-100 p-10">
              <span className="font-arabic text-9xl font-black block" style={{ color: letter.color }}>{letter.lettre}</span>
              <p className="font-arabic text-xl text-slate-600 mt-2">{letter.nom}</p>
              <p className="text-slate-400 font-bold text-sm">{letter.translit}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Barre de progression */}
        <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-400 to-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / alphabet.length) * 100}%` }} />
        </div>

        {/* Contrôles */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={prev} disabled={current === 0}
            className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-colors">
            <SkipBack className="h-5 w-5" />
          </button>
          <button onClick={togglePause}
            className="p-4 rounded-full bg-brand-600 text-white hover:bg-brand-700 shadow-lg transition-colors">
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button onClick={next} disabled={current >= alphabet.length - 1}
            className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-colors">
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Toutes les lettres (mini) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
          {groups.map((group, gi) => (
            <div key={gi} className="flex justify-center gap-3 mb-2 font-arabic" dir="rtl">
              {group.map(l => (
                <button key={l.id} onClick={() => { clearTimeout(timerRef.current); setCurrent(l.id - 1); playLetter(l.id - 1) }}
                  className={`text-2xl px-2 py-1 rounded-lg transition-all ${l.id - 1 === current ? 'ring-2 ring-brand-400 scale-125 bg-brand-50' : 'hover:bg-slate-50'}`}
                  style={{ color: l.color }}>
                  {l.lettre}
                </button>
              ))}
            </div>
          ))}
        </div>

        {finished && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center bg-emerald-50 rounded-2xl p-6">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-bold text-emerald-700 text-xl">أَحْسَنْتَ! كل الحروف!</p>
            <button onClick={startAuto} className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold">
              أعد من البداية
            </button>
          </motion.div>
        )}
      </div>
    )
  }

  // --- Mode MANUEL ---
  if (mode === 'manuel') {
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setMode(null)} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> رجوع
          </button>
          <span className="font-bold text-slate-400 text-sm">Clique sur chaque lettre pour l'entendre</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3" dir="rtl">
          {alphabet.map((l, i) => (
            <motion.button key={l.id} onClick={() => { playLetter(i); setCurrent(i) }}
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                current === i ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 shadow-lg' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-200'
              }`}>
              <span className="font-arabic text-3xl" style={{ color: l.color }}>{l.lettre}</span>
              {current === i && (
                <Volume2 className="h-3 w-3 text-brand-400 mt-1" />
              )}
            </motion.button>
          ))}
        </div>
        {current !== null && (
          <motion.div key={current} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center bg-white dark:bg-slate-800 rounded-2xl card-shadow p-4">
            <span className="font-arabic text-5xl font-black" style={{ color: alphabet[current].color }}>{alphabet[current].lettre}</span>
            <p className="font-arabic text-lg text-slate-600 mt-1">{alphabet[current].nom}</p>
            <p className="text-slate-400 font-bold">{alphabet[current].translit}</p>
          </motion.div>
        )}
      </div>
    )
  }

  // --- Mode QUIZ ---
  if (mode === 'quiz') {
    if (quizOver) return (
      <motion.div className="max-w-md mx-auto text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <p className="text-7xl mb-4">{quizScore >= 7 ? '🏆' : '💪'}</p>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">أحسنت!</h2>
        <p className="text-2xl font-black text-brand-600">{quizScore} / {quizQuestions.length}</p>
        <div className="flex gap-3 justify-center mt-8">
          <button onClick={startQuiz} className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold">أعد القرار</button>
          <button onClick={() => setMode(null)} className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold">رجوع</button>
        </div>
      </motion.div>
    )

    const q = quizQuestions[quizIdx]
    if (!q) return null
    return (
      <div className="max-w-lg mx-auto py-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setMode(null)} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> رجوع
          </button>
          <span className="font-bold text-sm text-slate-400">{quizIdx + 1}/{quizQuestions.length} — ⭐ {quizScore}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-400 to-brand-500 rounded-full" style={{ width: `${(quizIdx / quizQuestions.length) * 100}%` }} />
        </div>

        {/* Bouton écouter */}
        <div className="text-center mb-8">
          <p className="font-bold text-slate-600 dark:text-slate-300 mb-4">أَيُّ حَرْفٍ تَسْمَعُ؟</p>
          <button onClick={() => playLetter(alphabet.indexOf(q.letter))}
            className="p-6 rounded-full bg-brand-600 text-white shadow-xl hover:bg-brand-700 transition-colors">
            <Volume2 className="h-10 w-10" />
          </button>
          <p className="text-xs text-slate-400 font-bold mt-2">اضغط للاستماع</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {q.options.map(opt => {
            const isSelected = quizAns === opt.id
            const isCorrect  = opt.id === q.letter.id
            let cls = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300'
            if (quizAns !== null) {
              if (isCorrect) cls = 'border-emerald-400 bg-emerald-50'
              else if (isSelected) cls = 'border-red-400 bg-red-50 opacity-70'
              else cls = 'opacity-30 bg-white dark:bg-slate-800'
            }
            return (
              <button key={opt.id} onClick={() => handleQuizAnswer(opt)} disabled={quizAns !== null}
                className={`p-6 rounded-3xl border-2 shadow-md transition-all duration-300 text-center ${cls}`}>
                <span className="font-arabic text-5xl block mb-1" style={{ color: opt.color }}>{opt.lettre}</span>
                <span className="text-xs font-bold text-slate-400">{opt.translit}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}

import React, { useState, useCallback } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { useSRSStore } from '../store/useSRSStore'
import { getCurrentLevel, getAvailableLetterIds } from '../data/curriculum'
import { syllabesData, voyelles } from '../data/syllabes'
import PremiumAudioPlayer from '../components/ui/PremiumAudioPlayer'
import ConfettiOverlay from '../components/ui/ConfettiOverlay'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw, Trophy, ChevronRight } from 'lucide-react'
import { playSuccess, playError, playVictory, playPoints, playArabicFeedback } from '../utils/soundEffects'
import MicButton from '../components/ui/MicButton'
import { arabicMatches } from '../services/googleSttService'

const POINTS_PER_CORRECT = 20
const COLORS = { fatha: '#f97316', kasra: '#3b82f6', damma: '#22c55e' }

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function buildQuestions(availableLetterIds) {
  const available = syllabesData.filter(s => availableLetterIds.includes(s.lettreId))
  if (available.length === 0) return []
  const questions = []
  available.forEach(letterData => {
    letterData.syllabes.forEach(syl => {
      // Distracteurs : 2 autres syllabes de la même lettre + 1 d'une autre lettre
      const sameLetter = letterData.syllabes.filter(s => s.voyelle !== syl.voyelle)
      const otherLetters = available.filter(l => l.lettreId !== letterData.lettreId)
      const otherSyl = otherLetters.length > 0
        ? shuffle(otherLetters)[0].syllabes[Math.floor(Math.random() * 3)]
        : sameLetter[0]
      const options = shuffle([syl, ...sameLetter.slice(0, 2), otherSyl].slice(0, 4))
      questions.push({ correct: syl, options, lettre: letterData.lettre, translit: letterData.translit })
    })
  })
  return shuffle(questions).slice(0, 12)
}

// --- Modes ---
const MODES = [
  { id: 'ecoute',   label: 'Écoute & Réponds', labelAr: 'اِسْمَعْ وَأَجِبْ',   desc: "Écoute la syllabe, clique sur la bonne",       emoji: '👂' },
  { id: 'associe',  label: 'Lettre + Voyelle',  labelAr: 'حَرْف + حَرَكَة',    desc: "Choisis la voyelle pour former la syllabe",     emoji: '🔗' },
  { id: 'lecture',  label: 'Lis la syllabe',    labelAr: 'اِقْرَأِ المَقْطَع', desc: "Regarde la syllabe, clique pour entendre",      emoji: '👁️' },
]

export default function Syllabes() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const addPoints     = useProfileStore(s => s.addPoints)
  const addResult     = useGameStore(s => s.addResult)
  const srsItems      = useSRSStore(s => s.getProfileItems(activeProfile?.id))

  const [mode, setMode]             = useState(null)          // null = choix du mode
  const [questions, setQuestions]   = useState([])
  const [qIndex, setQIndex]         = useState(0)
  const [selected, setSelected]     = useState(null)
  const [isCorrect, setIsCorrect]   = useState(null)
  const [score, setScore]           = useState(0)
  const [gameOver, setGameOver]     = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  // Mode "associe" : sélection de la voyelle
  const [selectedVoyelle, setSelectedVoyelle] = useState(null)
  // Mode "lecture" : révélation de la grille après lecture
  const [revealed, setRevealed] = useState(false)

  if (!activeProfile) return <Navigate to="/" replace />

  const currentLevel     = getCurrentLevel(srsItems)
  const availableLetterIds = getAvailableLetterIds(currentLevel)

  const startMode = useCallback((m) => {
    const qs = buildQuestions(availableLetterIds)
    setMode(m)
    setQuestions(qs)
    setQIndex(0)
    setSelected(null)
    setIsCorrect(null)
    setScore(0)
    setGameOver(false)
    setSelectedVoyelle(null)
    setRevealed(false)
  }, [availableLetterIds])

  const restart = () => startMode(mode)

  // Prononciation vocale — l'enfant dit la syllabe qu'il entend
  const handleVoiceResult = (transcript) => {
    if (selected !== null || !transcript) return
    const match = current.options.find(opt =>
      arabicMatches(transcript, opt.syllabe) ||
      arabicMatches(transcript, opt.son || '')
    )
    if (match) handleAnswer(match)
  }

  const handleAnswer = (option) => {
    if (selected !== null) return
    setSelected(option.voyelle)
    const correct = option.voyelle === current.correct.voyelle
    setIsCorrect(correct)
    if (correct) {
      setScore(s => s + POINTS_PER_CORRECT)
      setShowConfetti(true)
      addPoints(POINTS_PER_CORRECT)
      addResult(activeProfile.id, { type: 'syllabes', correct: true })
      playSuccess(); playPoints(); playArabicFeedback('correct')
    } else {
      addResult(activeProfile.id, { type: 'syllabes', correct: false })
      playError(); playArabicFeedback('retry')
    }
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) { setGameOver(true); playVictory() }
      else { setQIndex(q => q + 1); setSelected(null); setIsCorrect(null); setSelectedVoyelle(null) }
    }, 1400)
  }

  // --- Écran de sélection du mode ---
  if (!mode) {
    return (
      <div className="max-w-lg mx-auto py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/modules" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> رجوع
          </Link>
        </div>
        <h1 className="text-3xl font-arabic text-brand-700 text-center mb-1 font-bold" dir="rtl">المَقَاطِع</h1>
        <p className="text-center text-slate-400 font-bold text-sm mb-8">Syllabes — consonne + voyelle</p>

        {/* Rappel voyelles */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow p-4 mb-6 border border-slate-100 dark:border-slate-700">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Les 3 voyelles courtes</p>
          <div className="flex justify-around">
            {voyelles.map(v => (
              <div key={v.id} className="text-center">
                <span className="font-arabic text-4xl block mb-1" style={{ color: v.color }}>{v.symbole}</span>
                <span className="text-xs font-bold text-slate-500">{v.nom}</span>
                <span className="text-[10px] font-bold block mt-0.5" style={{ color: v.color }}>« {v.son} » court</span>
                <span className="text-[9px] text-slate-400 block leading-tight">{v.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {MODES.map((m, i) => (
            <motion.button
              key={m.id}
              onClick={() => startMode(m.id)}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-slate-100 dark:border-slate-700 p-4 text-left hover:border-brand-300 hover:card-shadow-lg transition-all flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            >
              <span className="text-3xl">{m.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">{m.label}</h3>
                <p className="font-arabic text-sm text-brand-600" dir="rtl">{m.labelAr}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  if (questions.length === 0) return (
    <div className="text-center py-16 text-slate-400">
      <p className="text-5xl mb-4">🔒</p>
      <p className="font-bold">Débloquez plus de lettres pour accéder aux syllabes !</p>
      <Link to="/modules" className="mt-4 inline-block text-brand-600 font-bold">← Retour aux modules</Link>
    </div>
  )

  const current = questions[qIndex]

  // --- Écran de fin ---
  if (gameOver) {
    const total = questions.length * POINTS_PER_CORRECT
    const pct = Math.round((score / total) * 100)
    return (
      <motion.div className="max-w-md mx-auto text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-7xl mb-4">{pct >= 70 ? '🎉' : '💪'}</div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">أحسنت!</h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow p-6 mb-6">
          <div className="flex items-center justify-center gap-2 text-4xl font-black text-gold-500 mb-2">
            <Trophy className="h-8 w-8" /> {score}
          </div>
          <p className="text-slate-500 font-medium">{score} / {total} نقاط — {pct}%</p>
          <div className="mt-3 h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700">
            <RotateCcw className="h-4 w-4" /> أعد اللعب
          </button>
          <button onClick={() => setMode(null)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
            <ArrowLeft className="h-4 w-4" /> الأوضاع
          </button>
        </div>
      </motion.div>
    )
  }

  // --- Jeu : Mode "ecoute" ---
  const renderEcoute = () => (
    <>
      <div className="flex justify-center mb-8">
        <PremiumAudioPlayer key={current.correct.audio} url={current.correct.audio} fallbackText={current.correct.syllabe} size="xl" autoPlay />
      </div>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center mb-6">أَيُّ مَقْطَعٍ تَسْمَعُ؟</h2>
      <div className="grid grid-cols-2 gap-4">
        {current.options.map(opt => {
          const isSelected = selected === opt.voyelle
          const isCorrectOpt = opt.voyelle === current.correct.voyelle
          let cls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:shadow-lg'
          if (selected !== null) {
            if (isCorrectOpt) cls = 'bg-emerald-50 border-emerald-400'
            else if (isSelected) cls = 'bg-red-50 border-red-400 opacity-70'
            else cls = 'opacity-40 bg-white dark:bg-slate-800 border-slate-100'
          }
          return (
            <button key={opt.voyelle} onClick={() => handleAnswer(opt)} disabled={selected !== null}
              className={`p-6 rounded-3xl border-2 shadow-md transition-all duration-300 text-center ${cls}`}>
              <span className="font-arabic text-5xl block mb-2" style={{ color: COLORS[opt.voyelle] }}>{opt.syllabe}</span>
              <span className="text-sm font-bold text-slate-400">{opt.son}</span>
            </button>
          )
        })}
      </div>

      {/* Micro — l'enfant peut aussi prononcer la syllabe */}
      {selected === null && (
        <div className="mt-5 flex flex-col items-center gap-1">
          <p className="text-xs text-slate-400 font-bold">— أو انطق المقطع —</p>
          <MicButton onResult={handleVoiceResult} disabled={selected !== null} />
        </div>
      )}
    </>
  )

  // --- Jeu : Mode "associe" (choisir la voyelle) ---
  const renderAssocie = () => (
    <>
      {/* Audio de la syllabe cible — l'élève écoute d'abord */}
      <div className="flex justify-center mb-4">
        <PremiumAudioPlayer
          key={current.correct.audio}
          url={current.correct.audio}
          fallbackText={current.correct.syllabe}
          size="xl"
          autoPlay
        />
      </div>

      <div className="text-center mb-8">
        <p className="text-sm font-bold text-slate-400 mb-2">Ajoute la bonne voyelle à</p>
        <span className="font-arabic text-8xl text-brand-600 font-black">{current.lettre}</span>
        <p className="font-arabic text-lg text-brand-500 mt-3" dir="rtl">
          لِلْحُصُولِ عَلَى: <strong style={{ color: COLORS[current.correct.voyelle] }}>{current.correct.syllabe}</strong>
          <span className="text-slate-400 text-base font-bold mr-2" dir="ltr">= « {current.correct.son} »</span>
        </p>
      </div>
      <p className="text-center font-bold text-slate-600 dark:text-slate-300 mb-4">Choisissez la voyelle :</p>
      <div className="grid grid-cols-3 gap-4">
        {voyelles.map(v => {
          const isSelected = selected === v.id
          const isCorrectOpt = v.id === current.correct.voyelle
          let cls = 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
          if (selected !== null) {
            if (isCorrectOpt) cls = 'border-emerald-400 bg-emerald-50'
            else if (isSelected) cls = 'border-red-400 bg-red-50 opacity-60'
            else cls = 'opacity-30'
          }
          return (
            <button key={v.id} onClick={() => handleAnswer({ voyelle: v.id, syllabe: current.lettre + v.symbole, son: v.son })}
              disabled={selected !== null}
              className={`p-5 rounded-2xl border-2 shadow-sm transition-all duration-300 text-center bg-white dark:bg-slate-800 ${cls}`}>
              <span className="font-arabic text-4xl block mb-1" style={{ color: v.color }}>{v.symbole}</span>
              <span className="text-xs font-bold text-slate-500">{v.nom}</span>
              <span className="text-[10px] text-slate-400 block">« {v.son} » <em className="not-italic text-[9px] bg-slate-100 text-slate-400 px-1 rounded">court</em></span>
            </button>
          )
        })}
      </div>
    </>
  )

  // --- Jeu : Mode "lecture" (voir et cliquer pour entendre) ---
  const renderLecture = () => {
    return (
      <>
        <p className="text-center text-slate-500 font-bold mb-6">Lis cette syllabe :</p>
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl card-shadow border border-slate-100 dark:border-slate-700 p-10 text-center">
            <span className="font-arabic text-9xl font-black" style={{ color: COLORS[current.correct.voyelle] }}>{current.correct.syllabe}</span>
            <p className="text-slate-400 font-bold mt-3">
              {voyelles.find(v => v.id === current.correct.voyelle)?.nom}
              {' → '}
              <span style={{ color: COLORS[current.correct.voyelle] }}>« {current.correct.son} »</span>
            </p>
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <PremiumAudioPlayer url={current.correct.audio} fallbackText={current.correct.syllabe} size="lg" />
        </div>
        {!revealed ? (
          <button onClick={() => setRevealed(true)}
            className="w-full py-4 rounded-xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-700 transition-colors">
            J'ai lu ! Suivant →
          </button>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {voyelles.map(v => (
                <div key={v.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 p-3 text-center">
                  <span className="font-arabic text-2xl" style={{ color: v.color }}>{current.lettre}{v.symbole}</span>
                  <span className="text-[10px] font-bold block mt-1" style={{ color: COLORS[v.id] }}>= « {v.son} »</span>
                </div>
              ))}
            </div>
            <button onClick={() => {
              setScore(s => s + POINTS_PER_CORRECT); addPoints(POINTS_PER_CORRECT)
              addResult(activeProfile.id, { type: 'syllabes', correct: true })
              if (qIndex + 1 >= questions.length) { setGameOver(true); playVictory() }
              else { setQIndex(q => q + 1); setRevealed(false) }
            }} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors">
              ✅ Suivant
            </button>
          </motion.div>
        )}
      </>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMode(null)} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> الأوضاع
        </button>
        <span className="text-xs font-black px-3 py-1 rounded-full bg-brand-100 text-brand-700">
          {MODES.find(m => m.id === mode)?.emoji} {MODES.find(m => m.id === mode)?.label}
        </span>
        <span className="bg-gold-100 text-gold-600 px-3 py-1 rounded-full font-bold text-sm">⭐ {score}</span>
      </div>

      {/* Progress */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
          style={{ width: `${(qIndex / questions.length) * 100}%` }} />
      </div>
      <p className="text-center text-xs font-bold text-slate-400 mb-4">{qIndex + 1} / {questions.length}</p>

      <AnimatePresence mode="wait">
        <motion.div key={qIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          {mode === 'ecoute'  && renderEcoute()}
          {mode === 'associe' && renderAssocie()}
          {mode === 'lecture' && renderLecture()}

          {/* Feedback */}
          {selected !== null && mode !== 'lecture' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-3 rounded-xl font-bold text-sm text-center ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {isCorrect
                ? `✅ رائع! — ${current.correct.syllabe} (${current.correct.son})`
                : `❌ الصواب: ${current.correct.syllabe} — ${current.correct.son}`}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

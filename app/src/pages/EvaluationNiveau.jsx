import React, { useState, useMemo, useRef } from 'react'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { useSRSStore } from '../store/useSRSStore'
import { getCurrentLevel, CURRICULUM_LEVELS, getAvailableLetters, getAvailablePhonemes, getAvailablePhonemeIds } from '../data/curriculum'
import { categories } from '../data/vocabulaire'
import { motion, AnimatePresence } from 'framer-motion'
import PremiumAudioPlayer from '../components/ui/PremiumAudioPlayer'
import ConfettiOverlay from '../components/ui/ConfettiOverlay'
import { ArrowLeft, Trophy, CheckCircle2, XCircle, RotateCcw, Download } from 'lucide-react'
import { playSuccess, playError, playVictory } from '../utils/soundEffects'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function buildEvaluation(currentLevel, availableLetters, availablePhonemes) {
  const questions = []

  // 1. Lettres — reconnaissance audio (4 questions)
  const shuffledLetters = shuffle(availableLetters).slice(0, 4)
  shuffledLetters.forEach(letter => {
    const distractors = shuffle(availableLetters.filter(l => l.id !== letter.id)).slice(0, 3)
    questions.push({
      type: 'lettre',
      question: 'أَيُّ حَرْفٍ تَسْمَعُ؟',
      questionFr: 'Quelle lettre entends-tu ?',
      audio: letter.audio,
      correct: letter,
      options: shuffle([letter, ...distractors]),
      points: 10,
    })
  })

  // 2. Phonèmes — distinction (3 questions)
  const shuffledPhonemes = shuffle(availablePhonemes).slice(0, 3)
  shuffledPhonemes.forEach(ph => {
    const correct = Math.random() > 0.5 ? ph.lettre1 : ph.lettre2
    const wrong   = correct === ph.lettre1 ? ph.lettre2 : ph.lettre1
    questions.push({
      type: 'phoneme',
      question: 'أَيُّ صَوْتٍ تَسْمَعُ؟',
      questionFr: 'Quel son entends-tu ?',
      audio: correct.audio,
      correct: { id: correct.caractere, caractere: correct.caractere, nom: correct.nom },
      options: shuffle([
        { id: correct.caractere, caractere: correct.caractere, nom: correct.nom },
        { id: wrong.caractere,   caractere: wrong.caractere,   nom: wrong.nom   },
      ]),
      points: 15,
    })
  })

  // 3. Vocabulaire — image + audio (3 questions)
  const allMots = categories
    .filter(c => ['couleurs', 'animaux', 'classe'].includes(c.id))
    .flatMap(c => c.mots.filter(m => m.image && m.image !== '/resources/images/placeholder-word.svg'))
  const shuffledMots = shuffle(allMots).slice(0, 3)
  shuffledMots.forEach(mot => {
    const distractors = shuffle(allMots.filter(m => m.ar !== mot.ar)).slice(0, 3)
    questions.push({
      type: 'vocabulaire',
      question: 'مَا هَذَا؟',
      questionFr: 'Qu\'est-ce que c\'est ?',
      image: mot.image,
      audio: mot.audio,
      correct: mot,
      options: shuffle([mot, ...distractors]),
      points: 10,
    })
  })

  return shuffle(questions)
}

const LEVEL_LABELS = { 1: 'Niveau 1 — Débutant', 2: 'Niveau 2 — Apprenti', 3: 'Niveau 3 — Confirmé', 4: 'Niveau 4 — Expert' }

export default function EvaluationNiveau() {
  const [searchParams] = useSearchParams()
  const teacherMode    = searchParams.get('teacherMode') === 'true'
  const profileIdParam = searchParams.get('profileId')

  const activeProfile  = useProfileStore(s => s.getActiveProfile())
  const profiles       = useProfileStore(s => s.profiles)
  const addPoints      = useProfileStore(s => s.addPoints)
  const addResult      = useGameStore(s => s.addResult)

  // En mode maîtresse, on évalue l'élève ciblé sans changer le profil actif
  const targetProfile  = teacherMode && profileIdParam
    ? profiles.find(p => p.id === profileIdParam) || activeProfile
    : activeProfile

  const srsItems       = useSRSStore(s => s.getProfileItems(targetProfile?.id))

  const [started, setStarted]   = useState(false)
  const [qIndex, setQIndex]     = useState(0)
  const [answers, setAnswers]   = useState([])
  const [selected, setSelected] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [score, setScore]       = useState(0)
  const [done, setDone]         = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  if (!targetProfile) return <Navigate to="/" replace />

  const currentLevel     = getCurrentLevel(srsItems)
  const availableLetters = getAvailableLetters(currentLevel)
  const availablePhonemes = useMemo(() => getAvailablePhonemes(currentLevel), [currentLevel])

  const questions = useMemo(() => buildEvaluation(currentLevel, availableLetters, availablePhonemes), [currentLevel])
  const totalPoints = questions.reduce((s, q) => s + q.points, 0)

  const handleAnswer = (option) => {
    if (selected !== null) return
    const q = questions[qIndex]
    const isOk = (q.type === 'lettre')
      ? option.id === q.correct.id
      : q.type === 'phoneme'
        ? option.id === q.correct.id
        : option.ar === q.correct.ar

    setSelected(option.id || option.ar || option.caractere)
    setIsCorrect(isOk)
    const gained = isOk ? q.points : 0
    setScore(s => s + gained)
    setAnswers(a => [...a, { question: q, isCorrect: isOk, gained }])
    if (isOk) {
      if (!teacherMode) addPoints(gained)
      playSuccess()
    } else {
      playError()
    }
    if (!teacherMode) addResult(targetProfile.id, { type: 'evaluation', correct: isOk })

    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        setDone(true)
        playVictory()
        setShowConfetti(true)
      } else {
        setQIndex(i => i + 1)
        setSelected(null)
        setIsCorrect(null)
      }
    }, 1400)
  }

  const restart = () => {
    setStarted(false); setQIndex(0); setAnswers([]); setSelected(null)
    setIsCorrect(null); setScore(0); setDone(false); setShowConfetti(false)
  }

  // --- Intro ---
  if (!started) {
    const levelInfo = CURRICULUM_LEVELS.find(l => l.id === currentLevel)
    return (
      <div className="max-w-lg mx-auto py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to={teacherMode ? '/maitresse' : '/modules'} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> رجوع
          </Link>
          {teacherMode && (
            <span className="ml-auto px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black border border-indigo-100">
              📋 وضع الأستاذة — {targetProfile.prenom}
            </span>
          )}
        </div>
        <div className="text-center mb-8">
          <p className="text-6xl mb-4">{teacherMode ? '📋' : '📊'}</p>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">
            {teacherMode ? `تَقْيِيم ${targetProfile.prenom}` : 'تَقْيِيم المُسْتَوَى'}
          </h1>
          <p className="text-slate-500 font-bold">Évaluation — {LEVEL_LABELS[currentLevel]}</p>
          {teacherMode && (
            <p className="text-xs text-indigo-400 font-bold mt-1">Mode observation — aucun point attribué</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow p-6 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Ton niveau actuel</span>
            <span className={`px-3 py-1 rounded-full text-white text-sm font-black bg-gradient-to-r ${levelInfo?.color}`}>
              {levelInfo?.emoji} {levelInfo?.name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Nombre de questions</span>
            <span className="font-black text-slate-700 dark:text-slate-200">{questions.length} سؤال</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Points maximum</span>
            <span className="font-black text-gold-500">{totalPoints} نقطة</span>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ce test évalue :</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">✅ Reconnaissance des lettres à l'écoute</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">✅ Distinction des phonèmes</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">✅ Vocabulaire (couleurs, animaux, classe)</p>
          </div>
        </div>
        <button onClick={() => setStarted(true)}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-xl hover:bg-indigo-700 transition-colors shadow-lg">
          ابدأ التقييم 🚀
        </button>
      </div>
    )
  }

  // --- Résultat final ---
  if (done) {
    const pct = Math.round((score / totalPoints) * 100)
    const passed = pct >= 70
    return (
      <motion.div className="max-w-lg mx-auto py-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />
        <div className="text-center mb-6">
          <p className="text-7xl mb-4">{pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : '💪'}</p>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
            {passed ? 'أَحْسَنْتَ! نَجَحْتَ!' : 'حَاوِلْ مَرَّةً أُخْرَى!'}
          </h2>
          <p className="text-slate-500 font-bold">{passed ? 'Félicitations !' : 'Continue à t\'entraîner !'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow p-6 mb-6">
          <div className="text-center mb-4">
            <span className="text-5xl font-black text-gold-500">{score}</span>
            <span className="text-slate-400 font-bold"> / {totalPoints} نقاط</span>
            <div className="mt-2 h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <p className={`text-2xl font-black mt-1 ${passed ? 'text-emerald-600' : 'text-amber-500'}`}>{pct}%</p>
          </div>

          {/* Détail par question */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            {answers.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {a.isCorrect
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                <span className="text-slate-600 dark:text-slate-300 flex-1">{a.question.questionFr}</span>
                <span className={`font-bold ${a.isCorrect ? 'text-emerald-600' : 'text-red-400'}`}>
                  {a.isCorrect ? `+${a.gained}` : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700">
            <RotateCcw className="h-4 w-4" /> أعد التقييم
          </button>
          <Link to="/modules" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
            <ArrowLeft className="h-4 w-4" /> الوحدات
          </Link>
        </div>
      </motion.div>
    )
  }

  // --- Question ---
  const q = questions[qIndex]
  return (
    <div className="max-w-lg mx-auto py-4">
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      <div className="flex items-center justify-between mb-4">
        <button onClick={restart} className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> إلغاء
        </button>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
            q.type === 'lettre' ? 'bg-blue-100 text-blue-600' :
            q.type === 'phoneme' ? 'bg-emerald-100 text-emerald-600' :
            'bg-rose-100 text-rose-600'
          }`}>
            {q.type === 'lettre' ? '🔤 Lettre' : q.type === 'phoneme' ? '👂 Phonème' : '📷 Vocabulaire'}
          </span>
          <span>{qIndex + 1}/{questions.length}</span>
        </div>
        <span className="font-black text-gold-500 text-sm">⭐ {score}</span>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${(qIndex / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          {/* Question */}
          <h2 className="text-xl font-bold text-center text-slate-700 dark:text-slate-200 mb-1">{q.questionFr}</h2>
          <p className="font-arabic text-lg text-brand-600 text-center mb-6" dir="rtl">{q.question}</p>

          {/* Audio / Image */}
          {q.audio && (
            <div className="flex justify-center mb-6">
              <PremiumAudioPlayer url={q.audio} fallbackText="▶" size="xl" autoPlay />
            </div>
          )}
          {q.image && (
            <div className="flex justify-center mb-6">
              <img src={q.image} alt="" className="w-32 h-32 object-contain rounded-2xl border border-slate-100 shadow-sm" />
            </div>
          )}

          {/* Options */}
          <div className={`grid gap-3 ${q.type === 'phoneme' ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {q.options.map((opt, i) => {
              const optId = opt.id || opt.ar || opt.caractere
              const isSelected = selected === optId
              const isCorrectOpt = q.type === 'vocabulaire' ? opt.ar === q.correct.ar : opt.id === q.correct.id || opt.caractere === q.correct.id
              let cls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              if (selected !== null) {
                if (isCorrectOpt) cls = 'bg-emerald-50 border-emerald-400'
                else if (isSelected) cls = 'bg-red-50 border-red-400 opacity-70'
                else cls = 'opacity-30 bg-white dark:bg-slate-800'
              }
              return (
                <button key={i} onClick={() => handleAnswer(opt)} disabled={selected !== null}
                  className={`p-4 rounded-2xl border-2 shadow-sm transition-all duration-300 text-center ${cls}`}>
                  {q.type === 'vocabulaire' ? (
                    <>
                      <span className="font-arabic text-3xl block mb-1" dir="rtl">{opt.ar}</span>
                      <span className="text-xs font-bold text-slate-400">{opt.translit}</span>
                    </>
                  ) : q.type === 'phoneme' ? (
                    <>
                      <span className="font-arabic text-4xl block mb-1">{opt.caractere || opt.lettre}</span>
                      <span className="text-xs font-bold text-slate-400">{opt.nom}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-arabic text-4xl block mb-1" style={{ color: opt.color }}>{opt.lettre}</span>
                      <span className="text-xs font-bold text-slate-400">{opt.translit}</span>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-5 p-3 rounded-xl text-center font-bold text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {isCorrect ? `✅ أَحْسَنْتَ! +${q.points} نقطة` : `❌ الصواب: ${q.type === 'vocabulaire' ? q.correct.ar : q.correct.lettre || q.correct.caractere}`}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

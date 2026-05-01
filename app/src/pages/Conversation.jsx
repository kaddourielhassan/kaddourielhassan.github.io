import React, { useState, useEffect, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { conversations } from '../data/conversations'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Volume2, MessageCircle, CheckCircle2 } from 'lucide-react'
import ConfettiOverlay from '../components/ui/ConfettiOverlay'
import { playSuccess, playError, playVictory } from '../utils/soundEffects'
import { AuditingMetrics, calculateDifficulty, estimateConfidence } from '../utils/auditingMetrics'
import PremiumAudioPlayer from '../components/ui/PremiumAudioPlayer'

export default function Conversation() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const [currentScenario, setCurrentScenario] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Timing
  const sessionIdRef = useRef(`conv_${Date.now()}`)
  const roundStartRef = useRef(Date.now())

  if (!activeProfile) return <Navigate to="/" replace />

  // Start session on mount
  useEffect(() => {
    sessionIdRef.current = `conv_${Date.now()}`
    AuditingMetrics.startSession(sessionIdRef.current, activeProfile.id, 'conversation')
    return () => {
      AuditingMetrics.endSession(sessionIdRef.current)
    }
  }, [activeProfile.id])

  // Reset round timer when round changes
  useEffect(() => {
    roundStartRef.current = Date.now()
  }, [currentRound, currentScenario])

  const scenario = conversations[currentScenario]
  const round = scenario.rounds[currentRound]

  const handleOptionClick = (option, index) => {
    if (selectedOption !== null) return
    setSelectedOption(index)

    const responseTime = Date.now() - roundStartRef.current
    const difficulty = calculateDifficulty({
      questionText: round.question,
      optionCount: round.options.length,
      hasAudio: !!round.questionAudio,
      module: 'conversation'
    })
    const confidence = estimateConfidence(responseTime, difficulty)

    if (option.correct) {
      playSuccess()
      AuditingMetrics.track({
        module: 'conversation',
        type: 'correct',
        component: 'Conversation',
        profileId: activeProfile.id,
        profileName: activeProfile.prenom,
        metadata: {
          sessionId: sessionIdRef.current,
          responseTime,
          difficulty,
          confidence,
          questionIndex: currentRound,
          scenarioId: currentScenario,
          scenarioTitle: scenario.title,
        }
      })
      if (currentRound + 1 < scenario.rounds.length) {
        setTimeout(() => {
          setCurrentRound(r => r + 1)
          setSelectedOption(null)
        }, 1500)
      } else {
        setShowConfetti(true)
        setIsCompleted(true)
        playVictory()
      }
    } else {
      playError()
      AuditingMetrics.track({
        module: 'conversation',
        type: 'error',
        component: 'Conversation',
        profileId: activeProfile.id,
        profileName: activeProfile.prenom,
        metadata: {
          sessionId: sessionIdRef.current,
          responseTime,
          difficulty,
          confidence,
          questionIndex: currentRound,
          scenarioId: currentScenario,
          scenarioTitle: scenario.title,
        }
      })
      setTimeout(() => setSelectedOption(null), 1500)
    }
  }

  const nextScenario = () => {
    if (currentScenario + 1 < conversations.length) {
      setCurrentScenario(s => s + 1)
      setCurrentRound(0)
      setSelectedOption(null)
      setIsCompleted(false)
    }
  }

const nextScenario = () => {
    if (currentScenario + 1 < conversations.length) {
      setCurrentScenario(s => s + 1)
      setCurrentRound(0)
      setSelectedOption(null)
      setIsCompleted(false)
    }
  }
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />
      
      <div className="flex items-center justify-between mb-8">
        <Link to="/modules" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> رجوع
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{scenario.emoji}</span>
          <span className="font-bold text-slate-600">{scenario.title}</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] card-shadow p-8 mb-8 relative overflow-hidden">
        {/* Progress Dots */}
        <div className="flex gap-2 mb-8 justify-center">
          {scenario.rounds.map((_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full transition-all duration-300 ${i <= currentRound ? 'bg-brand-500' : 'bg-slate-100'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key={`${currentScenario}-${currentRound}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Avatar Question */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-3xl shadow-sm border-2 border-brand-200">
                  👩‍🏫
                </div>
                <div className="flex-1">
                  <div className="bg-brand-50 text-brand-700 p-5 rounded-2xl rounded-tl-none border border-brand-100 relative">
                    <p className="font-arabic text-2xl mb-2" dir="rtl">{round.question}</p>
                    <div className="flex items-center gap-3">
                      {round.questionAudio && (
                        <PremiumAudioPlayer 
                          url={round.questionAudio} 
                          size="md"
                          fallbackText={round.question}
                        />
                      )}
                      <span className="text-xs text-slate-400 font-medium">إستمع</span>
                    </div>
                    {/* Speech bubble tail */}
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-brand-50 border-l-[10px] border-l-transparent" />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="grid gap-4 mt-12">
                {round.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(option, i)}
                    className={`p-5 rounded-2xl border-2 font-arabic text-xl transition-all duration-200 text-right flex items-center justify-between gap-4 ${
                      selectedOption === i
                        ? option.correct
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'bg-white border-slate-100 hover:border-brand-300 hover:shadow-md text-slate-700'
                    }`}
                  >
                    {selectedOption === i && (
                      <span className="flex-shrink-0">
                        {option.correct ? <CheckCircle2 className="h-6 w-6" /> : '❌'}
                      </span>
                    )}
                    <span className="flex-1" dir="rtl">{option.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">أحسنت!</h3>
              <p className="text-slate-500 mb-8">لقد أكملت هذا الحوار بنجاح</p>
              
              {currentScenario + 1 < conversations.length ? (
                <button
                  onClick={nextScenario}
                  className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all hover:-translate-y-1 active:scale-95"
                >
                  الحوار التالي
                </button>
              ) : (
                <Link
                  to="/modules"
                  className="inline-block bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-slate-900 transition-all"
                >
                  العودة للمهام
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="text-center text-slate-400 text-sm font-medium">
        <MessageCircle className="h-4 w-4 inline-block mr-1 opacity-50" />
        تدرّب على التحدّث بالعربية
      </div>
    </div>
  )
}

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { lettresPrioritaires } from '../data/alphabet'
import ConfettiOverlay from '../components/ui/ConfettiOverlay'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Check, ChevronRight, Eraser } from 'lucide-react'
import { playSuccess, playPoints, playVictory } from '../utils/soundEffects'
import { AuditingMetrics } from '../utils/auditingMetrics'

export default function TracageLettres() {
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const addPoints = useProfileStore(s => s.addPoints)
  const addResult = useGameStore(s => s.addResult)

  const canvasRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [validated, setValidated] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)

  const letter = lettresPrioritaires[currentIndex]

  if (!activeProfile) return <Navigate to="/" replace />

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getCanvasCoords(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getCanvasCoords(e)
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = letter.color
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDraw = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    setValidated(false)
  }

  const validate = () => {
    // Simple heuristic: check if the user has drawn enough points/pixels
    // We can check if the canvas is mostly empty or not.
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let filledPixels = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) filledPixels++
    }

    // Heuristic: At least 1000 pixels should be drawn for a valid trace
    if (filledPixels < 800) {
      alert(`حاول مجدداً! ارسم الحرف جيداً (Plus de détails s'il vous plaît)`)
      return
    }

    setValidated(true)
    setShowConfetti(true)
    setCompletedCount(c => c + 1)
    addPoints(20)
    addResult(activeProfile.id, { type: 'tracage', completed: true, lettreId: letter.id })
    playSuccess()
    playPoints()
    AuditingMetrics.track({ module: 'tracage', type: 'correct', component: 'TracageLettres', profileId: activeProfile.id, profileName: activeProfile.prenom, metadata: { lettreId: letter.id } })
  }

  const next = () => {
    if (currentIndex + 1 < lettresPrioritaires.length) {
      setCurrentIndex(i => i + 1)
      clearCanvas()
      setValidated(false)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    clearCanvas()
    setValidated(false)
    setCompletedCount(0)
  }

  useEffect(() => {
    clearCanvas()
  }, [currentIndex])

  return (
    <div className="max-w-lg mx-auto">
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      <div className="flex items-center justify-between mb-6">
        <Link to="/modules" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> رجوع
        </Link>
        <span className="font-bold text-sm text-slate-500">{currentIndex + 1}/{lettresPrioritaires.length}</span>
        <span className="bg-gold-100 text-gold-600 px-3 py-1 rounded-full font-bold text-sm">✅ {completedCount}</span>
      </div>

      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500" style={{ width: `${(currentIndex / lettresPrioritaires.length) * 100}%` }} />
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-1">تتبّع الحرف!</h2>
        <p className="font-arabic text-lg text-brand-600" dir="rtl">اُكْتُبْ الحَرْف!</p>
      </div>

      {/* Ghost Letter + Canvas */}
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl card-shadow border-2 border-slate-100 dark:border-slate-700 overflow-hidden mb-4" style={{ aspectRatio: '1' }}>
        {/* Ghost letter behind */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-arabic text-[12rem] text-slate-100 select-none" style={{ opacity: 0.25 }}>
            {letter.lettre}
          </span>
        </div>

        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full drawing-canvas relative z-10"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* Letter info */}
      <div className="text-center mb-4">
        <span className="font-arabic text-4xl mr-3" style={{ color: letter.color }}>{letter.lettre}</span>
        <span className="text-lg font-bold text-slate-600 dark:text-slate-300">{letter.translit}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button onClick={clearCanvas} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 transition-colors">
          <Eraser className="h-4 w-4" /> مسح
        </button>

        {!validated ? (
          <button onClick={validate} disabled={!hasDrawn}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 disabled:opacity-40 transition-colors">
            <Check className="h-4 w-4" /> تأكيد +20⭐
          </button>
        ) : (
          <button onClick={currentIndex + 1 < lettresPrioritaires.length ? next : restart}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors">
            {currentIndex + 1 < lettresPrioritaires.length ? (
              <><ChevronRight className="h-4 w-4" /> التالي</>
            ) : (
              <><RotateCcw className="h-4 w-4" /> إعادة</>
            )}
          </button>
        )}
      </div>

      {validated && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 text-emerald-600 p-3 rounded-xl font-bold text-sm text-center">
          ✅ رائع! أَحْسَنْتَ! +20 نقطة
        </motion.div>
      )}
    </div>
  )
}

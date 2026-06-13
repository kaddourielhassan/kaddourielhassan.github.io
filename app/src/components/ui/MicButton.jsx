import React, { useState, useCallback } from 'react'
import { Mic, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { recordAndRecognize } from '../../services/googleSttService'

/**
 * Bouton microphone — enregistre 2.8s puis retourne la transcription arabe.
 *
 * Props :
 *   onResult(transcript: string)  — appelé avec le texte reconnu
 *   onError(err: Error)           — appelé si micro refusé ou API KO
 *   duration                      — durée d'enregistrement en ms (défaut 2800)
 *   disabled                      — désactive le bouton
 *   size                          — 'sm' | 'md' (défaut 'md')
 */
export default function MicButton({ onResult, onError, duration = 2800, disabled = false, size = 'md' }) {
  const [status, setStatus] = useState('idle') // idle | recording | processing | ok | err

  const handleClick = useCallback(async () => {
    if (status !== 'idle' || disabled) return
    setStatus('recording')
    try {
      const transcript = await recordAndRecognize(duration)
      setStatus(transcript ? 'ok' : 'err')
      onResult?.(transcript)
    } catch (e) {
      setStatus('err')
      onError?.(e)
      console.warn('[MicButton]', e.message)
    } finally {
      setTimeout(() => setStatus('idle'), 1600)
    }
  }, [status, disabled, duration, onResult, onError])

  const isSm = size === 'sm'

  const cfg = {
    idle:       { bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-600', label: 'تَحَدَّثْ' },
    recording:  { bg: 'bg-red-500 border-red-600 text-white shadow-lg shadow-red-200',      label: '🎙️ أَسْمَعُكَ' },
    processing: { bg: 'bg-amber-50 border-amber-200 text-amber-600',                        label: 'جارٍ...' },
    ok:         { bg: 'bg-emerald-50 border-emerald-300 text-emerald-600',                  label: '✅ سَمِعْتُكَ' },
    err:        { bg: 'bg-coral-50 border-coral-300 text-coral-600',                        label: '🔇 لم أسمع' },
  }

  const c = cfg[status]

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || status === 'processing'}
      whileTap={{ scale: 0.95 }}
      animate={status === 'recording' ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.7 } } : { scale: 1 }}
      className={`flex flex-col items-center gap-1.5 border-2 rounded-2xl font-bold transition-colors duration-200
        ${isSm ? 'px-3 py-2' : 'px-5 py-4'} ${c.bg} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`flex items-center justify-center ${isSm ? 'h-5 w-5' : 'h-7 w-7'}`}
        >
          {status === 'idle'       && <Mic className="h-full w-full" />}
          {status === 'recording'  && <Mic className="h-full w-full" />}
          {status === 'processing' && <Loader2 className="h-full w-full animate-spin" />}
          {status === 'ok'         && <CheckCircle2 className="h-full w-full" />}
          {status === 'err'        && <XCircle className="h-full w-full" />}
        </motion.span>
      </AnimatePresence>
      <span className={`${isSm ? 'text-[10px]' : 'text-xs'} leading-tight`} dir="rtl">{c.label}</span>
    </motion.button>
  )
}

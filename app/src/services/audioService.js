/**
 * SERVICE AUDIO UNIFIÉ — Hurûfî
 *
 * Regroupe :
 * - normalizeAudioPath(path) : normalise les chemins d'audio
 * - enhanceArabicText(text) : améliore la prononciation arabe pour TTS
 * - getBestArabicVoice() : sélectionne la meilleure voix arabe avec cache
 * - speakTTS(text) : synthèse vocale avec contournement Chrome
 * - getAudioDuration(url) : helper async pour obtenir la durée d'un fichier audio
 * - useRobustAudio(url, fallbackText) : hook React complet
 *
 * Problèmes résolus :
 * - Duplication éliminée (70+ lignes identiques dans audioPlayer.js et useRobustAudio.js)
 * - Race condition du `status` en closure → utilisation d'une ref
 * - stop() maintenant appelé au cleanup
 * - Double slash dans l'URL résolu
 * - Contournement Chrome (50ms après cancel) unifié
 * - Cache des voix TTS
 * - Bug Chrome ~200 utterances : redémarrage périodique
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// ──────────────────────────────────────────────
// Fonctions utilitaires (pures, non-React)
// ──────────────────────────────────────────────

export const normalizeAudioPath = (path) => {
  if (!path || typeof path !== 'string') return path
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('/')) {
    return path
  }
  return `/${path.replace(/^\/+/, '')}`
}

export const enhanceArabicText = (text) => {
  if (!text) return ''
  return text.split(' ').map(word => {
    const core = word.replace(/\u0640/g, '')
    if (core.length === 1 && core >= '\u0621' && core <= '\u064A') {
      return core + '\u064E'
    }
    return word
  }).join(' . ')
}

// ──────────────────────────────────────────────
// Gestion des voix TTS avec cache
// ──────────────────────────────────────────────

let voicesCache = null
let voicesCacheInitialized = false

function refreshVoicesCache() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    voicesCache = window.speechSynthesis.getVoices()
  }
}

export function initVoicesCache() {
  if (voicesCacheInitialized) return
  voicesCacheInitialized = true
  refreshVoicesCache()
  if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = refreshVoicesCache
  }
}

export function getBestArabicVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  if (!voicesCache) refreshVoicesCache()
  if (!voicesCache) return null
  const premium = voicesCache.find(v =>
    v.lang.includes('ar-SA') || v.lang.includes('ar-AE') ||
    v.name.includes('Google') || v.name.includes('Maged') || v.name.includes('Tarik')
  )
  if (premium) return premium
  return voicesCache.find(v => v.lang.startsWith('ar')) || null
}

// ──────────────────────────────────────────────
// TTS — speakTTS (fire-and-forget)
// ──────────────────────────────────────────────

export function speakTTS(text, onStart, onEnd, onError) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const enhancedText = enhanceArabicText(text)
  const utterance = new SpeechSynthesisUtterance(enhancedText)

  const bestVoice = getBestArabicVoice()
  if (bestVoice) {
    utterance.voice = bestVoice
    utterance.lang = bestVoice.lang
  } else {
    utterance.lang = 'ar-SA'
  }

  utterance.rate = 1.0
  utterance.pitch = 1.0

  if (onStart) utterance.onstart = onStart
  if (onEnd) utterance.onend = onEnd
  if (onError) utterance.onerror = onError

  setTimeout(() => {
    window.speechSynthesis.speak(utterance)
  }, 50)
}

// ──────────────────────────────────────────────
// Helper : getAudioDuration
// ──────────────────────────────────────────────

export function getAudioDuration(url) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(0)
    const audio = new Audio(normalizeAudioPath(url))
    audio.preload = 'metadata'
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
      audio.remove()
    }, { once: true })
    audio.addEventListener('error', (e) => {
      reject(e)
      audio.remove()
    }, { once: true })
    audio.load()
  })
}

// ──────────────────────────────────────────────
// countSpeaking (stable across styles)
// ──────────────────────────────────────────────

let ttsUtteranceCount = 0

function countSpeaking() {
  ttsUtteranceCount++
  if (ttsUtteranceCount > 200) {
    ttsUtteranceCount = 0
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }
}

// ──────────────────────────────────────────────
// Hook React : useRobustAudio
// ──────────────────────────────────────────────

export function useRobustAudio(url, fallbackText = '') {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const audioRef = useRef(null)
  const statusRef = useRef('idle')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    initVoicesCache()
  }, [])

  useEffect(() => {
    if (!url) {
      setStatus('idle')
      return
    }

    const normalizedUrl = normalizeAudioPath(url)
    setStatus('loading')
    statusRef.current = 'loading'

    const audio = new Audio(normalizedUrl)
    audio.preload = 'auto'
    audioRef.current = audio

    const handleCanPlay = () => {
      if (!mountedRef.current) return
      setStatus('ready')
      statusRef.current = 'ready'
    }
    const handleError = (e) => {
      if (!mountedRef.current) return
      console.warn(`Erreur de chargement audio (${normalizedUrl}):`, e)
      setStatus('error')
      statusRef.current = 'error'
      setError(e)
    }
    const handleEnded = () => {
      if (!mountedRef.current) return
      setStatus('ready')
      statusRef.current = 'ready'
    }

    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('ended', handleEnded)

    if (audio.readyState >= 3) {
      handleCanPlay()
    } else {
      audio.load()
    }

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
      audioRef.current = null
    }
  }, [url])

  const play = useCallback(() => {
    if (statusRef.current === 'error' || !url) {
      speakTTS(
        fallbackText,
        () => { setStatus('playing'); statusRef.current = 'playing'; countSpeaking() },
        () => { setStatus('ready'); statusRef.current = 'ready' },
        () => { setStatus('ready'); statusRef.current = 'ready' }
      )
      return
    }

    if (audioRef.current) {
      if (window.speechSynthesis) window.speechSynthesis.cancel()

      setStatus('playing')
      statusRef.current = 'playing'

      audioRef.current.play().catch(err => {
        console.warn('Audio play error, fallback to TTS:', err)
        setStatus('error')
        statusRef.current = 'error'
        speakTTS(
          fallbackText,
          () => { setStatus('playing'); statusRef.current = 'playing'; countSpeaking() },
          () => { setStatus('ready'); statusRef.current = 'ready' },
          () => { setStatus('ready'); statusRef.current = 'ready' }
        )
      })
    }
  }, [url, fallbackText])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setStatus('idle')
    statusRef.current = 'idle'
  }, [])

  return { status, error, play, stop, audioRef }
}

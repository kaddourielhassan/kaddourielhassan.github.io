/**
 * SYSTÈME DE BRUITAGES PÉDAGOGIQUES — Hurûfî
 *
 * Génération via Web Audio API — aucun fichier externe requis.
 *
 * Améliorations v2 :
 * - Vérification soundEnabled avant chaque effet
 * - Harmoniques subtiles (sons plus riches)
 * - AudioContext préchauffé dès le premier appel utilisateur
 * - Anticlic systématique (rampe gain → 0 avant stop)
 * - Volumes adaptés aux enfants (4-7 ans)
 */

import { useAppStore } from '../store/useAppStore'

let audioCtx = null

// ──────────────────────────────────────────────────────
// Feedback vocal arabe (fichiers MP3 générés via ElevenLabs)
// ──────────────────────────────────────────────────────
const FEEDBACK_AUDIO = {
  correct: 'audio/feedback/ahsanta.mp3',
  excellent: 'audio/feedback/mumtaz.mp3',
  retry: 'audio/feedback/hawil.mp3',
}

let feedbackAudio = null

export function playArabicFeedback(type = 'correct') {
  if (!useAppStore.getState().soundEnabled) return
  const rel = FEEDBACK_AUDIO[type]
  if (!rel) return
  try {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
    const url  = `${base}/${rel}`
    if (feedbackAudio) { feedbackAudio.pause(); feedbackAudio.currentTime = 0 }
    feedbackAudio = new Audio(url)
    feedbackAudio.volume = 0.85
    feedbackAudio.play().catch(() => {})
  } catch (e) {
    console.warn('[SFX] Arabic feedback failed:', e)
  }
}

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * Crée un oscillateur avec son propre gain, connecté à la destination.
 * Retourne { osc, gainNode } pour piloter le volume indépendamment.
 */
function createVoice(ctx, type = 'sine', frequency, gainValue, startTime, duration) {
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(gainValue, startTime)
  gainNode.gain.setValueAtTime(gainValue, startTime + duration - 0.001)
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  gainNode.connect(ctx.destination)

  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, startTime)
  osc.connect(gainNode)
  osc.start(startTime)
  osc.stop(startTime + duration)

  return { osc, gainNode }
}

/**
 * Son de succès — Accord majeur ascendant C5-E5-G5 (523, 659, 784 Hz).
 * Sous-harmonique à l'octave inférieure + harmonique 2× pour la brillance.
 */
export function playSuccess() {
  try {
    if (!useAppStore.getState().soundEnabled) return

    const ctx = getContext()
    const now = ctx.currentTime
    const duration = 0.8
    const rampStart = duration - 0.2

    const freqs = [523.25, 659.25, 783.99]

    freqs.forEach((freq, i) => {
      const t = now + i * 0.12
      const noteDur = duration - i * 0.12

      const mainGain = ctx.createGain()
      mainGain.gain.setValueAtTime(0.12, t)
      mainGain.gain.setValueAtTime(0.12, t + rampStart)
      mainGain.gain.exponentialRampToValueAtTime(0.001, t + noteDur)
      mainGain.connect(ctx.destination)

      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      osc.connect(mainGain)
      osc.start(t)
      osc.stop(t + noteDur)

      const subGain = ctx.createGain()
      subGain.gain.setValueAtTime(0.04, t)
      subGain.gain.setValueAtTime(0.04, t + rampStart)
      subGain.gain.exponentialRampToValueAtTime(0.001, t + noteDur)
      subGain.connect(ctx.destination)

      const subOsc = ctx.createOscillator()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(freq / 2, t)
      subOsc.connect(subGain)
      subOsc.start(t)
      subOsc.stop(t + noteDur)

      const harmGain = ctx.createGain()
      harmGain.gain.setValueAtTime(0.02, t)
      harmGain.gain.setValueAtTime(0.02, t + rampStart)
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + noteDur)
      harmGain.connect(ctx.destination)

      const harmOsc = ctx.createOscillator()
      harmOsc.type = 'sine'
      harmOsc.frequency.setValueAtTime(freq * 2, t)
      harmOsc.connect(harmGain)
      harmOsc.start(t)
      harmOsc.stop(t + noteDur)
    })
  } catch (e) {
    console.warn('[SFX] Success sound failed:', e)
  }
}

/**
 * Son d'erreur — Triangle wave descendant F#4→E4 (370→250 Hz)
 * + harmonique sine à l'octave supérieure.
 */
export function playError() {
  try {
    if (!useAppStore.getState().soundEnabled) return

    const ctx = getContext()
    const now = ctx.currentTime
    const duration = 0.5

    const mainGain = ctx.createGain()
    mainGain.gain.setValueAtTime(0.12, now)
    mainGain.gain.setValueAtTime(0.12, now + duration - 0.001)
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    mainGain.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(370, now)
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.4)
    osc.connect(mainGain)
    osc.start(now)
    osc.stop(now + duration)

    const harmGain = ctx.createGain()
    harmGain.gain.setValueAtTime(0.03, now)
    harmGain.gain.setValueAtTime(0.03, now + duration - 0.001)
    harmGain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    harmGain.connect(ctx.destination)

    const harmOsc = ctx.createOscillator()
    harmOsc.type = 'sine'
    harmOsc.frequency.setValueAtTime(740, now)
    harmOsc.frequency.exponentialRampToValueAtTime(500, now + 0.4)
    harmOsc.connect(harmGain)
    harmOsc.start(now)
    harmOsc.stop(now + duration)
  } catch (e) {
    console.warn('[SFX] Error sound failed:', e)
  }
}

/**
 * Son de clic — Sine 800 Hz très court avec rampe anti-clic.
 */
export function playTap() {
  try {
    if (!useAppStore.getState().soundEnabled) return

    const ctx = getContext()
    const now = ctx.currentTime
    const duration = 0.08

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.setValueAtTime(0.08, now + duration - 0.001)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    gain.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + duration)
  } catch (e) {
    console.warn('[SFX] Tap sound failed:', e)
  }
}

/**
 * Son de victoire — Fanfare Do-Mi-Sol-Do(octave) avec harmoniques
 * et vibrato sur la dernière note tenue.
 */
export function playVictory() {
  try {
    if (!useAppStore.getState().soundEnabled) return

    const ctx = getContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 523.25, start: 0,    dur: 0.2 },
      { freq: 659.25, start: 0.2,  dur: 0.2 },
      { freq: 783.99, start: 0.4,  dur: 0.2 },
      { freq: 1046.5, start: 0.6,  dur: 0.6 },
    ]

    notes.forEach(({ freq, start, dur }) => {
      const t = now + start

      const mainGain = ctx.createGain()
      mainGain.gain.setValueAtTime(0.12, t)
      mainGain.gain.setValueAtTime(0.12, t + dur - 0.001)
      mainGain.gain.exponentialRampToValueAtTime(0.001, t + dur)
      mainGain.connect(ctx.destination)

      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)

      if (start === 0.6) {
        const vibrato = ctx.createOscillator()
        vibrato.type = 'sine'
        vibrato.frequency.setValueAtTime(5, t)
        const vibratoGain = ctx.createGain()
        vibratoGain.gain.setValueAtTime(5, t)
        vibrato.connect(vibratoGain)
        vibratoGain.connect(osc.frequency)
        vibrato.start(t)
        vibrato.stop(t + dur)
      }

      osc.connect(mainGain)
      osc.start(t)
      osc.stop(t + dur)

      const subGain = ctx.createGain()
      subGain.gain.setValueAtTime(0.03, t)
      subGain.gain.setValueAtTime(0.03, t + dur - 0.001)
      subGain.gain.exponentialRampToValueAtTime(0.001, t + dur)
      subGain.connect(ctx.destination)

      const subOsc = ctx.createOscillator()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(freq / 2, t)
      subOsc.connect(subGain)
      subOsc.start(t)
      subOsc.stop(t + dur)
    })
  } catch (e) {
    console.warn('[SFX] Victory sound failed:', e)
  }
}

/**
 * Son de badge débloqué — Arpège 5 notes G4→C5→E5→G5→C6
 * Chaque note avec harmonique octave basse.
 */
export function playBadgeUnlocked() {
  try {
    if (!useAppStore.getState().soundEnabled) return

    const ctx = getContext()
    const now = ctx.currentTime
    const spacing = 0.12
    const noteDur = 0.4

    const notes = [392, 523.25, 659.25, 783.99, 1046.5]

    notes.forEach((freq, i) => {
      const t = now + i * spacing

      const mainGain = ctx.createGain()
      mainGain.gain.setValueAtTime(0.10, t)
      mainGain.gain.setValueAtTime(0.10, t + noteDur - 0.001)
      mainGain.gain.exponentialRampToValueAtTime(0.001, t + noteDur)
      mainGain.connect(ctx.destination)

      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      osc.connect(mainGain)
      osc.start(t)
      osc.stop(t + noteDur)

      const subGain = ctx.createGain()
      subGain.gain.setValueAtTime(0.02, t)
      subGain.gain.setValueAtTime(0.02, t + noteDur - 0.001)
      subGain.gain.exponentialRampToValueAtTime(0.001, t + noteDur)
      subGain.connect(ctx.destination)

      const subOsc = ctx.createOscillator()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(freq / 2, t)
      subOsc.connect(subGain)
      subOsc.start(t)
      subOsc.stop(t + noteDur)
    })
  } catch (e) {
    console.warn('[SFX] Badge sound failed:', e)
  }
}

/**
 * Son de points gagnés — Glissando 1200→1800 Hz, sine, gain 0.10
 * Simple et efficace — pas d'harmoniques.
 */
export function playPoints() {
  try {
    if (!useAppStore.getState().soundEnabled) return

    const ctx = getContext()
    const now = ctx.currentTime
    const duration = 0.3

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.10, now)
    gain.gain.setValueAtTime(0.10, now + duration - 0.001)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    gain.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15)
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + duration)
  } catch (e) {
    console.warn('[SFX] Points sound failed:', e)
  }
}

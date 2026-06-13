/**
 * Google Speech-to-Text — Service unifié pour la reconnaissance vocale arabe
 *
 * Flux : getUserMedia → MediaRecorder (webm/opus) → base64 → Google STT API
 * Langue principale : ar-SA (Arabie Saoudite standard)
 */

const API_KEY = import.meta.env.VITE_GOOGLE_SPEECH_KEY || ''

// ── Utilitaires ──────────────────────────────────────────────────────────────

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** Supprime les diacritiques arabes (تشكيل) pour comparaison souple */
export function stripDiacritics(str = '') {
  return str
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g, '')
    .trim()
}

/**
 * Compare la transcription parlée avec le texte cible (après nettoyage).
 * Accepte les correspondances partielles (début ou inclusion).
 */
export function arabicMatches(spoken = '', target = '') {
  const s = stripDiacritics(spoken).replace(/\s+/g, '')
  const t = stripDiacritics(target).replace(/\s+/g, '')
  if (!s || !t) return false
  return s === t || t.includes(s) || s.includes(t)
}

// ── Appel STT avec fallback d'authentification ───────────────────────────────

async function callSttApi(content, mimeType) {
  const encoding = mimeType.includes('ogg') ? 'OGG_OPUS' : 'WEBM_OPUS'

  const body = JSON.stringify({
    config: {
      encoding,
      sampleRateHertz:            48000,
      languageCode:               'ar-SA',
      alternativeLanguageCodes:   ['ar-XA', 'ar-EG'],
      enableAutomaticPunctuation: false,
      model:                      'default',
    },
    audio: { content },
  })

  // Essai 1 : clé en query param (API key standard)
  const urlKey = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`
  let res = await fetch(urlKey, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  // Essai 2 : Bearer token (OAuth2 access token — format AQ.xxx)
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    const errText = await res.text()
    console.warn('[STT] ?key= auth failed:', res.status, errText)
    console.info('[STT] Retry with Authorization: Bearer …')

    res = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body,
    })
  }

  if (!res.ok) {
    const errText = await res.text()
    console.error('[STT] API error', res.status, errText)
    throw new Error(`Google STT ${res.status}: ${errText}`)
  }

  const data       = await res.json()
  console.info('[STT] Response:', JSON.stringify(data))
  const transcript = data.results?.[0]?.alternatives?.[0]?.transcript ?? ''
  return transcript.trim()
}

// ── Enregistrement + transcription ──────────────────────────────────────────

/**
 * Enregistre le micro pendant `durationMs` ms, envoie à Google STT.
 * Retourne la transcription arabe brute (string).
 */
export async function recordAndRecognize(durationMs = 2800) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone non supporté sur cet appareil')
  }
  if (!API_KEY) {
    throw new Error('Clé Google STT manquante (VITE_GOOGLE_SPEECH_KEY)')
  }

  console.info('[STT] Requesting microphone…')
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  console.info('[STT] Mic granted, recording', durationMs, 'ms')

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/ogg;codecs=opus'

  console.info('[STT] mimeType:', mimeType)

  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks   = []
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

  return new Promise((resolve, reject) => {
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      const blob = new Blob(chunks, { type: mimeType })
      console.info('[STT] Blob size:', blob.size, 'bytes')

      if (blob.size < 1000) {
        console.warn('[STT] Blob trop petit — micro muet ou coupé trop tôt')
        resolve('')
        return
      }

      try {
        const content    = await blobToBase64(blob)
        const transcript = await callSttApi(content, mimeType)
        console.info('[STT] Transcript:', transcript || '(vide)')
        resolve(transcript)
      } catch (e) {
        reject(e)
      }
    }

    recorder.onerror = e => {
      stream.getTracks().forEach(t => t.stop())
      reject(e.error || new Error('MediaRecorder error'))
    }

    recorder.start()
    setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop() }, durationMs)
  })
}

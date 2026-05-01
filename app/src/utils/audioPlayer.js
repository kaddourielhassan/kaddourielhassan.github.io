// Utilitaire pour jouer des fichiers audio
// Les fichiers ne sont pas encore créés — les boutons afficheront un feedback visuel

let currentAudio = null

function speakFallback(text) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ar'
  utterance.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

export function playAudio(path, fallbackText = '') {
  try {
    // Stop any current audio or speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    if (!path) {
      speakFallback(fallbackText)
      return
    }
    currentAudio = new Audio(path)
    currentAudio.play().catch(() => {
      speakFallback(fallbackText)
    })
  } catch (e) {
    speakFallback(fallbackText)
  }
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

// Utilitaire pour jouer des fichiers audio
// Les fichiers ne sont pas encore créés — les boutons afficheront un feedback visuel

let currentAudio = null

function speakFallback(text) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  
  // Ensure we are truly starting fresh
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ar'
  utterance.rate = 0.7 // Slower for better clarity
  utterance.pitch = 1
  
  // Bug fix for some browsers: wait a tiny bit after cancel
  setTimeout(() => {
    window.speechSynthesis.speak(utterance)
  }, 50)
}

export function playAudio(path, fallbackText = '') {
  try {
    // 1. Stop Speech Synthesis immediately
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    // 2. Stop any existing audio file
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.onended = null
      currentAudio.onerror = null
      currentAudio = null
    }

    if (!path) {
      speakFallback(fallbackText)
      return
    }

    // 3. Create and play new audio
    const audio = new Audio(path)
    currentAudio = audio

    const playPromise = audio.play()
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Audio file play failed, using fallback:", error)
        speakFallback(fallbackText)
      })
    }

    // Handle case where audio loads but then fails
    audio.onerror = () => {
      console.warn("Audio file error, using fallback")
      speakFallback(fallbackText)
    }

  } catch (e) {
    console.error("Global audio error:", e)
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

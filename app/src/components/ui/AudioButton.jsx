import React, { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { playAudio } from '../../utils/audioPlayer'

export default function AudioButton({ audioPath, speakText = '', size = 'md', label, className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const handlePlay = () => {
    if (isDisabled) return
    setIsPlaying(true)
    setIsDisabled(true)
    playAudio(audioPath, speakText)
    setTimeout(() => {
      setIsPlaying(false)
      setIsDisabled(false)
    }, 2000)
  }

  const sizes = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
    xl: 'h-28 w-28',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <button
      onClick={handlePlay}
      className={`${sizes[size]} rounded-full flex items-center justify-center transition-all duration-300 ${
        isPlaying
          ? 'bg-brand-500 text-white scale-110 shadow-lg shadow-brand-300'
          : 'bg-brand-100 text-brand-700 hover:bg-brand-200 hover:scale-105'
      } ${className}`}
      title={label || 'استمع'}
    >
      <Volume2 className={`${iconSizes[size]} ${isPlaying ? 'animate-pulse' : ''}`} />
    </button>
  )
}

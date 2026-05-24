import React, { useState, useEffect, useRef } from 'react'
import { Volume2, Loader2, AlertCircle, Play } from 'lucide-react'
import { useRobustAudio } from '../../hooks/useRobustAudio'

/**
 * Composant Audio Premium avec gestion d'états (Loading, Error, Playing)
 * Inspiré par les recommandations de bonnes pratiques pédagogiques.
 */
export default function PremiumAudioPlayer({ url, fallbackText, size = 'md', className = '' }) {
  const [fullUrl, setFullUrl] = useState(url)
  const { status, play, stop } = useRobustAudio(fullUrl, fallbackText)

  useEffect(() => {
    // Préfixe avec l'URL publique si c'est un chemin relatif
    if (url && !url.startsWith('http') && !url.startsWith('blob:')) {
      const base = import.meta.env.BASE_URL || ''
      setFullUrl(`${base}${url.startsWith('/') ? '' : '/'}${url}`)
    } else {
      setFullUrl(url)
    }
  }, [url])
  
  const sizes = {
    sm: 'h-10 w-10 p-2',
    md: 'h-16 w-16 p-4',
    lg: 'h-24 w-24 p-6',
    xl: 'h-32 w-32 p-8'
  }

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  }


  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return { 
          bg: 'bg-slate-100 dark:bg-slate-800', 
          icon: <Loader2 className="animate-spin text-slate-400" size={iconSizes[size]} />,
          cursor: 'cursor-wait'
        }
      case 'playing':
        return { 
          bg: 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-110', 
          icon: <Volume2 className="animate-pulse" size={iconSizes[size]} />,
          cursor: 'cursor-default'
        }
      case 'error':
        return { 
          bg: 'bg-amber-50 text-amber-600 border-2 border-amber-200', 
          icon: <AlertCircle size={iconSizes[size]} />,
          cursor: 'cursor-pointer'
        }
      default:
        return { 
          bg: 'bg-white dark:bg-slate-800 text-brand-600 border-2 border-brand-100 hover:border-brand-400 hover:scale-105 shadow-sm', 
          icon: <Play size={iconSizes[size]} className="ml-1" />, // Play icon for idle
          cursor: 'cursor-pointer'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={play}
        disabled={status === 'loading' || status === 'playing'}
        className={`${sizes[size]} rounded-[2rem] flex items-center justify-center transition-all duration-300 ${config.bg} ${config.cursor}`}
      >
        {config.icon}
      </button>
      
      {/* Étiquette discrète pour le feedback TTS */}
      {status === 'error' && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-amber-600 uppercase tracking-tighter">
          Mode Secours
        </div>
      )}
    </div>
  )
}

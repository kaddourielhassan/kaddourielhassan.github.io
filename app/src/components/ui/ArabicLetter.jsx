import React from 'react'

export default function ArabicLetter({ lettre, color, size = 'text-6xl', className = '', onClick, selected, correct, wrong }) {
  const stateClasses = correct
    ? 'border-emerald-400 bg-emerald-50 shadow-emerald-200'
    : wrong
    ? 'border-coral-400 bg-coral-50 shadow-coral-200'
    : selected
    ? 'border-brand-400 bg-brand-50 shadow-brand-200'
    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300 hover:shadow-lg'

  return (
    <div
      onClick={onClick}
      className={`font-arabic ${size} p-6 rounded-3xl border-2 shadow-md transition-all duration-300 cursor-pointer
        flex items-center justify-center select-none ${stateClasses} ${className}`}
      style={{ color: color || '#0d9488' }}
    >
      {lettre}
    </div>
  )
}

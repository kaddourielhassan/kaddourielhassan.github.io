import React from 'react'

export default function ProgressBar({ value, max, color = 'brand', label, showFraction = true }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const colorMap = {
    brand: 'bg-brand-500',
    gold: 'bg-gold-500',
    coral: 'bg-coral-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
          {showFraction && (
            <span className="text-sm font-bold text-slate-500">{value}/{max}</span>
          )}
        </div>
      )}
      <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap[color] || colorMap.brand}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

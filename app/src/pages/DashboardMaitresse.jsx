import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfileStore } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Download, Trash2, Star, BarChart3, Volume2, Play } from 'lucide-react'
import { categories } from '../data/vocabulaire'
import { alphabet } from '../data/alphabet'
import { phonemes } from '../data/phonemes'
import { conversations } from '../data/conversations'

const DEFAULT_PIN = '2026'
const PIN_STORAGE_KEY = 'hurufi-teacher-pin'

export default function DashboardMaitresse() {
  const profiles = useProfileStore(s => s.profiles)
  const deleteAllProfiles = useProfileStore(s => s.deleteAllProfiles)
  const getStats = useGameStore(s => s.getStats)
  const resetProfile = useGameStore(s => s.resetProfile)
  const getResultsForExport = useGameStore(s => s.getResultsForExport)

  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('stats') // 'stats' or 'audio'
  const [playingId, setPlayingId] = useState(null)

  const savedPin = localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN

  const handlePin = () => {
    if (pin === savedPin) {
      setAuthenticated(true)
    }
  }

  const exportCSV = () => {
    const results = getResultsForExport()
    let csv = 'الطفل,التمرين,صحيح,التاريخ\n'
    profiles.forEach(p => {
      const pResults = results[p.id] || []
      pResults.forEach(r => {
        csv += `${p.prenom},${r.type},${r.correct ?? r.completed ?? '-'},${new Date(r.date).toLocaleDateString('fr-FR')}\n`
      })
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hurufi_resultats_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const playPreview = (url, id) => {
    setPlayingId(id)
    const audio = new Audio(url)
    audio.play().catch(e => console.error('Audio error:', e))
    audio.onended = () => setPlayingId(null)
  }

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto text-center py-20">
        <div className="bg-white rounded-3xl card-shadow p-8">
          <Lock className="h-12 w-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">فضاء المعلمة</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">أدخلي رمز PIN للدخول</p>
          <input
            type="password" value={pin} onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePin()}
            placeholder="رمز PIN" autoFocus
            className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-brand-400 outline-none font-bold text-center text-2xl tracking-[0.5em] bg-white mb-4"
          />
          <button onClick={handlePin} className="w-full p-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors">
            دخول
          </button>
          <p className="text-xs text-slate-400 mt-3">💡 الرمز الافتراضي: 2026</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm mt-6">
          <ArrowLeft className="h-4 w-4" /> العودة للرئيسية
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> الرئيسية
        </Link>
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-brand-500" /> لوحة المعلمة
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'stats' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          النتائج والإحصائيات
        </button>
        <button 
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'audio' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          مراجعة الملفات الصوتية
        </button>
      </div>

      {activeTab === 'stats' ? (
        <>
          {/* Children Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {profiles.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl card-shadow border border-slate-100">
            <p className="text-slate-400 font-medium">لا يوجد أطفال مسجلون</p>
          </div>
        )}
        {profiles.map((p, i) => {
          const stats = getStats(p.id)
          return (
            <motion.div key={p.id} className="bg-white rounded-2xl card-shadow p-5 border border-slate-100"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{p.avatar}</span>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{p.prenom}</h3>
                  <p className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                    <Star className="h-3 w-3" fill="currentColor" /> {p.pointsTotal} نقطة • المستوى {p.niveau}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { label: '🎧', val: stats.ecoute?.correct || 0 },
                  { label: '🧠', val: stats.memory?.completed || 0 },
                  { label: '👂', val: stats.phonemes?.correct || 0 },
                  { label: '✏️', val: stats.tracage?.completed || 0 },
                  { label: '📷', val: stats.flashcards?.vus || 0 },
                ].map((s, j) => (
                  <div key={j} className="bg-slate-50 rounded-lg p-2">
                    <span className="text-sm">{s.label}</span>
                    <p className="font-bold text-slate-700 text-sm">{s.val}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium">
                  🔥 سلسلة الأيام: {stats.streak} • الجلسات: {stats.totalSessions}
                </span>
                <button onClick={() => { if (confirm(`إعادة تعيين ${p.prenom}؟`)) resetProfile(p.id) }}
                  className="text-xs font-bold text-coral-400 hover:text-coral-600 transition-colors">
                  إعادة تعيين
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors">
          <Download className="h-4 w-4" /> تصدير CSV
        </button>
        <button onClick={() => { if (confirm('حذف جميع الملفات؟')) deleteAllProfiles() }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral-100 text-coral-600 font-bold text-sm hover:bg-coral-200 transition-colors">
          <Trash2 className="h-4 w-4" /> حذف الكل
        </button>
      </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
            <h3 className="font-bold text-amber-800 mb-1 flex items-center gap-2">
              <Volume2 className="h-5 w-5" /> مراقبة جودة الصوت
            </h3>
            <p className="text-sm text-amber-700">استمعي لكل ملف صوتي للتحقق من وضوح النطق. الملفات التي لا تعمل ستظهر فيها أخطاء.</p>
          </div>

          {/* Alphabet Audio */}
          <div className="bg-white rounded-3xl card-shadow p-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">الحروف الأبجدية</h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {alphabet.map(l => (
                <button 
                  key={l.id}
                  onClick={() => playPreview(l.audio, `lettre-${l.id}`)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${playingId === `lettre-${l.id}` ? 'bg-brand-50 border-brand-300' : 'bg-white hover:border-slate-300'}`}
                >
                  <span className="font-arabic text-xl">{l.lettre}</span>
                  <Play className={`h-3 w-3 ${playingId === `lettre-${l.id}` ? 'text-brand-600' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Phonemes Audio */}
          <div className="bg-white rounded-3xl card-shadow p-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">تمييز الأصوات</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {phonemes.map(p => (
                <button 
                  key={p.id}
                  onClick={() => playPreview(p.audio, `phoneme-${p.id}`)}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${playingId === `phoneme-${p.id}` ? 'bg-emerald-50 border-emerald-300' : 'bg-white hover:border-slate-300'}`}
                >
                  <span className="font-arabic text-lg">{p.lettre1.caractere} / {p.lettre2.caractere}</span>
                  <Play className={`h-4 w-4 ${playingId === `phoneme-${p.id}` ? 'text-emerald-600' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Audio */}
          <div className="bg-white rounded-3xl card-shadow p-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">المحادثة (الحوار)</h3>
            <div className="space-y-4">
              {conversations.map(conv => (
                <div key={conv.id} className="border-b border-slate-50 pb-3 last:border-0">
                  <h4 className="font-bold text-sm text-slate-600 mb-2 flex items-center gap-2">
                    <span>{conv.emoji}</span> {conv.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {conv.rounds.map((r, idx) => (
                      <button 
                        key={idx}
                        onClick={() => playPreview(r.questionAudio, `conv-${conv.id}-${idx}`)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${playingId === `conv-${conv.id}-${idx}` ? 'bg-sky-50 border-sky-300' : 'bg-white hover:border-slate-300'}`}
                      >
                        <span className="font-arabic text-sm text-right" dir="rtl">{r.question}</span>
                        <Play className={`h-4 w-4 flex-shrink-0 ${playingId === `conv-${conv.id}-${idx}` ? 'text-sky-600' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary Audio */}
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-3xl card-shadow p-6">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                <span>{cat.emoji}</span> {cat.nom}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cat.mots.map((m, idx) => (
                  <button 
                    key={idx}
                    onClick={() => playPreview(m.audio, `mot-${cat.id}-${idx}`)}
                    className={`p-3 rounded-xl border text-right transition-all ${playingId === `mot-${cat.id}-${idx}` ? 'bg-brand-50 border-brand-300' : 'bg-white hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Play className={`h-3 w-3 ${playingId === `mot-${cat.id}-${idx}` ? 'text-brand-600' : 'text-slate-300'}`} />
                      <span className="font-arabic font-bold text-brand-700">{m.ar}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{m.fr}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  )
}

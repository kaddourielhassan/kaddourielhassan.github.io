import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProfileStore, CHILD_AVATARS } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Lock, Download, Trash2, Star, BarChart3, 
  Volume2, Play, Users, CheckCircle2, AlertCircle, 
  Settings, ChevronRight, Search, FileText, Menu, X, Loader2, Trophy, Activity
} from 'lucide-react'
import { alphabet } from '../data/alphabet'
import { phonemes } from '../data/phonemes'
import { conversations } from '../data/conversations'
import { categories } from '../data/vocabulaire'
import { AuditingMetrics } from '../utils/auditingMetrics'
import { generateDiploma, generateClassReport, generateStudentReport } from '../utils/pdfExport'

const DEFAULT_PIN = '2026'
const PIN_STORAGE_KEY = 'hurufi-teacher-pin'

function ResourceStatus({ url, type }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!url) { setStatus('missing'); return }
    const check = async () => {
      try {
        const res = await fetch(url, { method: 'HEAD' })
        setStatus(res.ok ? 'ok' : 'missing')
      } catch {
        setStatus('missing')
      }
    }
    check()
  }, [url])

  if (status === 'loading') return <div className="h-2 w-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" />

  if (type === 'image') {
    return (
      <div className="flex items-center justify-center">
        {status === 'ok' ? (
          <div className="relative group">
            <img 
              src={url} alt="" 
              className="w-10 h-10 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all group-hover:scale-[2.5] group-hover:z-50 group-hover:shadow-2xl" 
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-5 w-5" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
      status === 'ok' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
    }`}>
      {status === 'ok' ? (
        <><CheckCircle2 className="h-3 w-3" /> OK</>
      ) : (
        <><X className="h-3 w-3" /> Absent</>
      )}
    </div>
  )
}

function ProgressCard({ label, value, max = 20, colorClass, bgClass, toolTip }) {
  const percentage = Math.round((value / max) * 100)
  return (
    <div className={`${bgClass} rounded-2xl p-3 border border-white/50 shadow-sm relative group`} title={toolTip}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-xs font-black ${colorClass}`}>{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-white dark:bg-slate-800/50 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass.replace('text-', 'bg-')} rounded-full transition-all duration-1000`} 
             style={{ width: `${Math.min(100, percentage)}%` }} />
      </div>
      {/* Mini Tooltip simple */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {value} réussis sur {max}
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---

export default function DashboardMaitresse() {
  const profiles = useProfileStore(s => s.profiles)
  const deleteAllProfiles = useProfileStore(s => s.deleteAllProfiles)
  const getStats = useGameStore(s => s.getStats)
  const resetProfile = useGameStore(s => s.resetProfile)
  const getResultsForExport = useGameStore(s => s.getResultsForExport)

  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('students') 
  const [playingId, setPlayingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)

  const savedPin = localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN

  const handlePin = () => { if (pin === savedPin) setAuthenticated(true) }

  const playPreview = (url, id) => {
    if (audioLoading) return
    setAudioLoading(true)
    setPlayingId(id)
    const audio = new Audio(url)
    audio.oncanplaythrough = () => {
      setAudioLoading(false)
      audio.play().catch(e => console.error('Audio error:', e))
    }
    audio.onerror = () => {
      setAudioLoading(false)
      setPlayingId(null)
    }
    audio.onended = () => {
      setPlayingId(null)
      setAudioLoading(false)
    }
  }

  // Recherche optimisée (Debounce simulé par useMemo)
  const filteredProfiles = useMemo(() => {
    if (!debouncedSearch) return profiles
    return profiles.filter(p => 
      p.prenom.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [profiles, debouncedSearch])

  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
          className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] card-shadow p-10 border border-slate-100 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="h-10 w-10 text-brand-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">فضاء المعلمة</h2>
          <p className="text-slate-500 font-medium mb-8 uppercase text-xs tracking-widest">فضاء محمي</p>
          
          <div className="space-y-4 text-left" dir="ltr">
            <label className="text-xs font-bold text-slate-400 ml-1">الرمز السري</label>
            <input
              type="password" value={pin} onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePin()}
              placeholder="••••" autoFocus
              className="w-full p-5 rounded-2xl border-2 border-slate-50 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 outline-none font-black text-center text-4xl tracking-[0.5em] bg-slate-50 dark:bg-slate-900 transition-all"
            />
            <button onClick={handlePin} className="w-full p-5 rounded-2xl bg-brand-600 text-white font-black text-lg hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all active:scale-95">
              فتح القفل
            </button>
            <p className="text-center text-xs text-slate-300 mt-4 italic">رمز الدخول مطلوب لحماية بيانات التلاميذ.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-600 font-bold text-sm mt-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> العودة للقائمة
          </Link>
        </motion.div>
      </div>
    )
  }

  const menuItems = [
    { id: 'students', label: 'متابعة التلاميذ', icon: Users, color: 'text-blue-500' },
    { id: 'analytics', label: 'التحليلات', icon: Activity, color: 'text-amber-500' },
    { id: 'audio', label: 'تدقيق الأصوات', icon: Volume2, color: 'text-purple-500' },
    { id: 'assets', label: 'حالة الوسائط', icon: FileText, color: 'text-emerald-500' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'text-slate-500' },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[90vh] gap-6">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h1 className="font-black text-slate-800 dark:text-slate-100 text-lg">Hurûfî Pro</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-0 z-50 md:relative md:block md:w-64 flex-shrink-0 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="bg-white dark:bg-slate-800 h-full md:h-auto rounded-[2rem] card-shadow p-4 sticky top-6 border border-slate-100 dark:border-slate-700">
          <div className="px-4 py-6 mb-4 hidden md:block">
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xs">H</div>
              Hurûfî Pro
            </h1>
          </div>
          <nav className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' 
                    : 'text-slate-500 hover:bg-slate-50 dark:bg-slate-900 hover:text-slate-800 dark:text-slate-100'
                }`}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : item.color}`} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 pt-6 border-t border-slate-50">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-brand-600 font-bold text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> خروج
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 md:p-8">
        {/* Hero Metrics Top */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-50 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Tableau de bord Pro</h2>
            <p className="text-slate-400 font-medium">Contrôle pédagogique avancé et certification</p>
          </div>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
            <div className="bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-400 uppercase">Élèves</span>
              <span className="text-xl font-black text-blue-700">{profiles.length}</span>
            </div>
            <div className="bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-emerald-400 uppercase">Médias OK</span>
              <span className="text-xl font-black text-emerald-700">{alphabet.length + categories.reduce((acc, c) => acc + c.mots.length, 0)}</span>
            </div>
            <div className="bg-purple-50 px-5 py-3 rounded-2xl border border-purple-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-purple-400 uppercase">Stats</span>
              <span className="text-xl font-black text-purple-700">Live</span>
            </div>
            <div className="bg-pink-50 px-5 py-3 rounded-2xl border border-pink-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-pink-400 uppercase">Actif</span>
              <span className="text-xl font-black text-pink-700">Oui</span>
            </div>
          </div>
        </div>

        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 px-2">
          <div>
            <h2 className="text-2xl font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => generateClassReport(profiles, getStats)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 text-white font-bold text-sm shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Download className="h-4 w-4" /> تصدير التقرير PDF
            </button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="text" placeholder="ابحث عن اسم..." 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 card-shadow outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50 w-full sm:w-64 font-bold text-sm transition-all"
                aria-label="البحث عن تلميذ"
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="pb-10"
          >
            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredProfiles.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-700 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold">لم يُعثر على تلميذ.</p>
                      <button onClick={() => setSearchTerm('')} className="text-brand-600 font-black text-xs mt-2 uppercase tracking-tighter hover:underline">عرض الكل</button>
                    </div>
                  ) : (
                    filteredProfiles.map((p) => {
                      const stats = getStats(p.id)
                      return (
                        <div key={p.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] card-shadow p-7 border border-slate-50 group hover:border-brand-200 transition-all hover:shadow-xl">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner ${p.avatarColor || 'bg-slate-100 dark:bg-slate-800'}`}>
                                {p.avatar && (p.avatar.includes('http') || p.avatar.includes('assets')) ? (
                                   <img src={p.avatar} alt="" className="w-16 h-16 object-contain" />
                                ) : (
                                  CHILD_AVATARS.find(a => a.img === p.avatar)?.emoji || '👤'
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{p.prenom}</h3>
                                  <button 
                                    onClick={() => generateStudentReport(p, stats, AuditingMetrics.getProfileSummary(p.id))}
                                    title="Exporter le rapport de progression"
                                    className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase">تقرير</span>
                                  </button>
                                  <button 
                                    onClick={() => generateDiploma(p, stats)}
                                    title="Générer un diplôme"
                                    className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                                  >
                                    <Trophy className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase">شهادة</span>
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 rounded-lg bg-gold-500 text-white font-black text-[9px] uppercase shadow-sm">المستوى {p.niveau}</span>
                                  <span className="text-slate-400 font-bold text-xs">⭐ {p.pointsTotal} نقطة</span>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => { if(confirm(`هل تريد إعادة تعيين ${p.prenom} ؟`)) resetProfile(p.id) }} 
                              aria-label={`إعادة تعيين ${p.prenom}`}
                              className="p-3 rounded-xl text-slate-300 hover:text-coral-500 hover:bg-coral-50 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                            <ProgressCard label="استماع" value={stats.ecoute?.correct || 0} colorClass="text-blue-600" bgClass="bg-blue-50" toolTip="التعرف على الحروف" />
                            <ProgressCard label="ذاكرة" value={stats.memory?.completed || 0} max={10} colorClass="text-purple-600" bgClass="bg-purple-50" toolTip="لعبة الذاكرة" />
                            <ProgressCard label="أصوات" value={stats.phonemes?.correct || 0} max={6} colorClass="text-emerald-600" bgClass="bg-emerald-50" toolTip="تمييز الأصوات" />
                            <ProgressCard label="تتبع" value={stats.tracage?.completed || 0} max={12} colorClass="text-orange-600" bgClass="bg-orange-50" toolTip="كتابة الحروف" />
                            <ProgressCard label="كلمات" value={stats.flashcards?.vus || 0} max={50} colorClass="text-pink-600" bgClass="bg-pink-50" toolTip="المفردات" />
                            <div className="bg-brand-50 rounded-2xl p-3 flex flex-col justify-center items-center text-center border border-brand-100">
                              <span className="text-[10px] font-black text-brand-400 uppercase">سلسلة</span>
                              <span className="text-xl font-black text-brand-700">🔥 {stats.streak}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[11px] font-black text-slate-400 border-t border-slate-50 pt-5">
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> نشط</span>
                            <span className="uppercase tracking-widest">الجلسات: {stats.totalSessions}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] card-shadow p-8 border border-slate-50">
                  <header className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">تدقيق صوتي: الحروف</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">فحص وضوح النطق</p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-tighter">28 ملف</span>
                  </header>
                  <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-10 gap-3">
                    {alphabet.map(l => {
                      const isActive = playingId === `lettre-${l.id}`
                      return (
                        <button 
                          key={l.id} onClick={() => playPreview(l.audio, `lettre-${l.id}`)}
                          aria-label={`Écouter la lettre ${l.lettre}`}
                          className={`group relative h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                            isActive ? 'bg-brand-600 border-brand-600 text-white shadow-xl scale-110 z-10' : 'bg-white dark:bg-slate-800 border-slate-50 hover:border-brand-200 text-slate-700 dark:text-slate-200 hover:shadow-lg'
                          }`}
                        >
                          <span className="font-arabic text-2xl">{l.lettre}</span>
                          <div className={`absolute bottom-2 right-2 transition-all ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-50 group-hover:scale-100'}`}>
                            {audioLoading && isActive ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-2 w-2" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] card-shadow p-8 border border-slate-50">
                  <header className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">الأصوات والمفردات</h3>
                    <div className="flex gap-2">
                       <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">Contrastes</span>
                       <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">Capital Image</span>
                    </div>
                  </header>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {phonemes.map(p => (
                       <button 
                        key={p.id} onClick={() => playPreview(p.audio, `phoneme-${p.id}`)}
                        aria-label={`Écouter le contraste ${p.lettre1.caractere} contre ${p.lettre2.caractere}`}
                        className={`p-5 rounded-3xl border-2 flex items-center justify-between transition-all ${
                          playingId === `phoneme-${p.id}` ? 'bg-brand-600 border-brand-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-900 border-transparent hover:border-slate-200 dark:border-slate-700'
                        }`}
                       >
                         <span className="font-arabic text-xl" dir="rtl">{p.lettre1.caractere} / {p.lettre2.caractere}</span>
                         <div className="flex items-center gap-2">
                            {audioLoading && playingId === `phoneme-${p.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4 opacity-50" />}
                         </div>
                       </button>
                     ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] card-shadow overflow-hidden border border-slate-100 dark:border-slate-700">
<div className="p-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                   <div className="flex gap-4">
                      <div className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black">MÉDIA OK</div>
                      <div className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-black">MANQUANT</div>
                   </div>
                   <div className="text-right">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">بيان حالة الوسائط</h3>
                      <p className="text-slate-400 text-sm font-bold">فحص سلامة ملفات الوسائط.</p>
                   </div>
                </div>
<div className="overflow-x-auto">
                   <table className="w-full text-right" dir="rtl">
                     <thead className="bg-white dark:bg-slate-800">
                       <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                         <th className="p-8">المادة (Item)</th>
                         <th className="p-8 text-center">الصوت (Audio)</th>
                         <th className="p-8 text-center">الصورة (Image)</th>
                         <th className="p-8 text-center">الإجراءات (Actions)</th>
                         <th className="p-8">المسار (Path)</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       <tr className="bg-brand-50/50"><td colSpan="5" className="p-4 font-black text-brand-700 text-xs uppercase tracking-widest px-8">قسم الحروف</td></tr>
                       {alphabet.slice(0, 28).map(l => (
                         <tr key={l.id} className="hover:bg-slate-50 dark:bg-slate-900/50 transition-colors group">
                           <td className="p-6 px-8">
                             <span className="font-arabic font-black text-2xl text-slate-800 dark:text-slate-100 ml-3">{l.lettre}</span> 
                             <span className="text-xs text-slate-400 font-bold">({l.translit})</span>
                           </td>
                           <td className="p-6 text-center"><ResourceStatus url={l.audio} type="audio" /></td>
                           <td className="p-6 text-center"><ResourceStatus url={`resources/images/lettres/lettre_${l.translit.toLowerCase()}.png`} type="image" /></td>
                           <td className="p-6 text-center">
                             <button 
                               onClick={() => playPreview(l.audio, `alpha-${l.id}`)}
                               className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all"
                               aria-label={`Tester ${l.lettre}`}
                             >
                               {playingId === `alpha-${l.id}` && audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                             </button>
                           </td>
                           <td className="p-6 text-[10px] text-slate-300 font-mono group-hover:text-slate-500 transition-colors">{l.audio}</td>
                         </tr>
                       ))}

                       {categories.map(cat => (
                         <React.Fragment key={cat.id}>
                           <tr className="bg-slate-50 dark:bg-slate-900/50">
                             <td colSpan="5" className="p-4 font-black text-brand-700 text-xs uppercase tracking-widest px-8">{cat.emoji} {cat.nomAr}</td>
                           </tr>
                           {cat.mots.map((m, idx) => (
                             <tr key={idx} className="hover:bg-slate-50 dark:bg-slate-900/50 transition-colors group">
                               <td className="p-6 px-8 flex items-center gap-3">
                                 {cat.id === 'nombres' && (
                                   <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-black text-slate-400 border border-slate-200 dark:border-slate-700">{m.fr}</span>
                                 )}
                                 <span className="font-arabic font-black text-xl text-slate-800 dark:text-slate-100">{m.ar}</span> 
                                 <span className="text-[10px] text-slate-400 font-bold">({m.fr})</span>
                               </td>
                               <td className="p-6 text-center"><ResourceStatus url={m.audio} type="audio" /></td>
                               <td className="p-6 text-center"><ResourceStatus url={m.image} type="image" /></td>
                               <td className="p-6 text-center">
                                 <button 
                                   onClick={() => playPreview(m.audio, `mot-${cat.id}-${idx}`)}
                                   className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all"
                                   aria-label={`Tester ${m.fr}`}
                                 >
                                   {playingId === `mot-${cat.id}-${idx}` && audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                 </button>
                               </td>
                               <td className="p-6 text-[10px] text-slate-300 font-mono group-hover:text-brand-600 transition-colors">
                                 <span className="bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-700 break-all inline-block max-w-[250px]">
                                   {m.image}
                                 </span>
                               </td>
                             </tr>
                           ))}
                         </React.Fragment>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
            )}

            {activeTab === 'analytics' && (() => {
              const modulePerf = AuditingMetrics.getModulePerformance()
              const classSummary = AuditingMetrics.getClassSummary()
              const struggling = AuditingMetrics.getStrugglingProfiles()

              const MODULE_LABELS = {
                ecoute: { name: 'استماع', emoji: '🎧' },
                memory: { name: 'ذاكرة', emoji: '🧠' },
                phonemes: { name: 'أصوات', emoji: '👂' },
                tracage: { name: 'تتبع', emoji: '✏️' },
                flashcards: { name: 'كلمات', emoji: '📷' },
                conversation: { name: 'محادثة', emoji: '💬' },
              }

              const formatMs = (ms) => ms ? `${(ms / 1000).toFixed(1)}s` : '—'

              return (
                <div className="space-y-8">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 card-shadow text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">إجمالي الأحداث</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{classSummary.totalEvents}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 card-shadow text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Profils Actifs</p>
                      <p className="text-3xl font-black text-blue-600">{classSummary.totalProfiles}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 card-shadow text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">متوسط الوقت</p>
                      <p className="text-3xl font-black text-amber-600">{formatMs(classSummary.avgResponseTime)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 card-shadow text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">تنبيهات</p>
                      <p className={`text-3xl font-black ${struggling.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {struggling.length > 0 ? `⚠️ ${struggling.length}` : '✅ 0'}
                      </p>
                    </div>
                  </div>

                  {/* Struggling Students Alert */}
                  {struggling.length > 0 && (
                    <div className="bg-rose-50 rounded-[2rem] p-6 border border-rose-200">
                      <h3 className="text-lg font-black text-rose-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" /> Élèves en difficulté
                      </h3>
                      <p className="text-sm text-rose-600 font-medium mb-4">هؤلاء التلاميذ لديهم نسبة نجاح أقل من 40% :</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {struggling.map(p => (
                          <div key={p.profileId} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-rose-100 flex items-center justify-between">
                            <div>
                              <p className="font-black text-slate-800 dark:text-slate-100">{p.profileName || p.profileId}</p>
                              <p className="text-xs text-slate-400">{p.correctEvents + p.errorEvents} interactions</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-rose-500">{p.successRate}%</p>
                              <p className="text-[10px] text-rose-400 font-bold uppercase">Réussite</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Module Performance Table */}
                  <div className="bg-white dark:bg-slate-800 rounded-[2rem] card-shadow border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Performance par Module</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900">
                            <th className="text-left px-6 py-3 font-black text-slate-500 uppercase text-xs">Module</th>
                            <th className="text-center px-4 py-3 font-black text-slate-500 uppercase text-xs">تفاعلات</th>
                            <th className="text-center px-4 py-3 font-black text-emerald-500 uppercase text-xs">✅ صحيح</th>
                            <th className="text-center px-4 py-3 font-black text-rose-500 uppercase text-xs">❌ أخطاء</th>
                            <th className="text-center px-4 py-3 font-black text-blue-500 uppercase text-xs">النسبة</th>
                            <th className="text-center px-4 py-3 font-black text-amber-500 uppercase text-xs">⏱ م. الوقت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(modulePerf).map(([mod, data]) => (
                            <tr key={mod} className="border-t border-slate-50 hover:bg-slate-25">
                              <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                                <span className="mr-2">{MODULE_LABELS[mod]?.emoji}</span>
                                {MODULE_LABELS[mod]?.name || mod}
                              </td>
                              <td className="px-4 py-4 text-center font-medium text-slate-600 dark:text-slate-300">{data.totalInteractions}</td>
                              <td className="px-4 py-4 text-center font-bold text-emerald-600">{data.correct}</td>
                              <td className="px-4 py-4 text-center font-bold text-rose-500">{data.errors}</td>
                              <td className="px-4 py-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                                  data.successRate >= 70 ? 'bg-emerald-50 text-emerald-600' :
                                  data.successRate >= 40 ? 'bg-amber-50 text-amber-600' :
                                  data.totalInteractions === 0 ? 'bg-slate-50 dark:bg-slate-900 text-slate-400' :
                                  'bg-rose-50 text-rose-600'
                                }`}>
                                  {data.totalInteractions > 0 ? `${data.successRate}%` : '—'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center font-medium text-amber-600">{formatMs(data.avgResponseTime)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Per-Student Performance */}
                  {classSummary.profiles.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] card-shadow border border-slate-100 dark:border-slate-700 overflow-hidden">
                      <div className="p-6 border-b border-slate-50">
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Performance par Élève</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900">
                              <th className="text-left px-6 py-3 font-black text-slate-500 uppercase text-xs">Élève</th>
                              <th className="text-center px-4 py-3 font-black text-slate-500 uppercase text-xs">Events</th>
                              <th className="text-center px-4 py-3 font-black text-blue-500 uppercase text-xs">النسبة</th>
                              <th className="text-center px-4 py-3 font-black text-amber-500 uppercase text-xs">⏱ م. الوقت</th>
                              <th className="text-center px-4 py-3 font-black text-purple-500 uppercase text-xs">Module Favori</th>
                              <th className="text-center px-4 py-3 font-black text-slate-500 uppercase text-xs">Dernière Activité</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classSummary.profiles.map(p => (
                              <tr key={p.profileId} className="border-t border-slate-50 hover:bg-slate-25">
                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{p.profileName || p.profileId}</td>
                                <td className="px-4 py-4 text-center font-medium text-slate-600 dark:text-slate-300">{p.totalEvents}</td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                                    p.successRate >= 70 ? 'bg-emerald-50 text-emerald-600' :
                                    p.successRate >= 40 ? 'bg-amber-50 text-amber-600' :
                                    'bg-rose-50 text-rose-600'
                                  }`}>
                                    {p.successRate}%
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center font-medium text-amber-600">{formatMs(p.avgResponseTime)}</td>
                                <td className="px-4 py-4 text-center">
                                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                                    {MODULE_LABELS[p.favoriteModule]?.emoji} {MODULE_LABELS[p.favoriteModule]?.name || p.favoriteModule || '—'}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center text-xs text-slate-400 font-medium">
                                  {p.lastActivity ? new Date(p.lastActivity).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Export */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        const data = AuditingMetrics.exportJSON()
                        const blob = new Blob([data], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `hurufi-analytics-${new Date().toISOString().slice(0, 10)}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all"
                    >
                      <Download className="h-4 w-4" /> تصدير JSON
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('مسح جميع البيانات التحليلية ؟')) {
                          AuditingMetrics.clear()
                          location.reload()
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 transition-all"
                    >
                      <Trash2 className="h-4 w-4" /> إعادة تعيين
                    </button>
                  </div>
                </div>
              )
            })()}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6 pt-10 text-center">
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] card-shadow p-12 border border-slate-50">
                  <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Trash2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3">منطقة الصيانة</h3>
                  <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">تنبيه: حذف البيانات لا رجعة فيه ويشمل جميع ملفات التلاميذ.</p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => { if(confirm('حذف جميع الملفات الشخصية ؟')) deleteAllProfiles() }}
                      className="w-full p-6 rounded-2xl bg-rose-500 text-white font-black text-lg hover:bg-rose-600 shadow-xl shadow-rose-100 transition-all active:scale-95"
                    >
                      حذف جميع ملفات التلاميذ
                    </button>
                    <button className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-sm hover:bg-slate-200 dark:bg-slate-700 transition-all">
                      حفظ النتائج (نسخة احتياطية)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}



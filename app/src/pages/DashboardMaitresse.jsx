import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useProfileStore, CHILD_AVATARS } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Lock, Download, Trash2, Star, BarChart3,
  Volume2, Play, Users, CheckCircle2, AlertCircle,
  Settings, ChevronRight, Search, FileText, Menu, X, Loader2, Trophy, Activity, ClipboardCheck
} from 'lucide-react'
import { alphabet } from '../data/alphabet'
import { phonemes } from '../data/phonemes'
import { conversations } from '../data/conversations'
import { categories } from '../data/vocabulaire'
import { AuditingMetrics } from '../utils/auditingMetrics'
import { generateDiploma, generateClassReport, generateStudentReport, generateAttestation } from '../utils/pdfExport'
import { changePin, getAttemptsInfo } from '../utils/pinSecurity'
import TeacherAuth from '../components/dashboard/TeacherAuth'

// ResourceStatus removed for MVP simplicity

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

  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('students') 
  const [playingId, setPlayingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  // PIN change state
  const [oldPinInput, setOldPinInput] = useState('')
  const [newPinInput, setNewPinInput] = useState('')
  const [pinChangeMsg, setPinChangeMsg] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)



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
    return <TeacherAuth onAuthenticated={setAuthenticated} />
  }

  const menuItems = [
    { id: 'students', label: 'متابعة التلاميذ', icon: Users, color: 'text-blue-500' },
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
                                  <button
                                    onClick={() => generateAttestation(p, stats)}
                                    title="Attestation de suivi pédagogique (% par module + signatures)"
                                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                                  >
                                    <ClipboardCheck className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase">وثيقة</span>
                                  </button>
                                  <Link
                                    to={`/evaluation?teacherMode=true&profileId=${p.id}`}
                                    title="Lancer une évaluation pour cet élève (sans points)"
                                    className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                                  >
                                    <ClipboardCheck className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase">تقييم</span>
                                  </Link>
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
                            <ProgressCard label="ذاكرة" value={stats.memory?.completed || 0} max={6} colorClass="text-purple-600" bgClass="bg-purple-50" toolTip="لعبة الذاكرة" />
                            <ProgressCard label="أصوات" value={stats.phonemes?.correct || 0} max={6} colorClass="text-emerald-600" bgClass="bg-emerald-50" toolTip="تمييز الأصوات" />
                            <ProgressCard label="تتبع" value={stats.tracage?.completed || 0} max={12} colorClass="text-orange-600" bgClass="bg-orange-50" toolTip="كتابة الحروف" />
                            <ProgressCard label="كلمات" value={stats.flashcards?.vus || 0} max={72} colorClass="text-pink-600" bgClass="bg-pink-50" toolTip="المفردات" />
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

            {/* Analytics, Audio, and Assets tabs have been removed for MVP simplicity */}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6 pt-10 text-center">
                {/* Change PIN */}
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] card-shadow p-12 border border-slate-50">
                  <div className="w-20 h-20 bg-brand-50 text-brand-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Lock className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">تغيير الرمز السري</h3>
                  <div className="max-w-xs mx-auto space-y-3" dir="ltr">
                    <input
                      type="password" value={oldPinInput} onChange={e => setOldPinInput(e.target.value)}
                      placeholder="الرمز الحالي" 
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-center outline-none focus:border-brand-400"
                    />
                    <input
                      type="password" value={newPinInput} onChange={e => setNewPinInput(e.target.value)}
                      placeholder="الرمز الجديد (4+ أحرف)"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-center outline-none focus:border-brand-400"
                    />
                    {pinChangeMsg && <p className={`text-sm font-bold ${pinChangeMsg.includes('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{pinChangeMsg}</p>}
                    <button
                      onClick={async () => {
                        const res = await changePin(oldPinInput, newPinInput)
                        setPinChangeMsg(res.success ? '✅ تم تغيير الرمز بنجاح' : res.message)
                        if (res.success) { setOldPinInput(''); setNewPinInput('') }
                      }}
                      disabled={!oldPinInput || !newPinInput}
                      className="w-full p-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-40 transition-all"
                    >
                      تحديث الرمز
                    </button>
                  </div>
                </div>

                {/* Danger zone */}
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



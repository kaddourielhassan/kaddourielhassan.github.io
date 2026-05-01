import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProfileStore, CHILD_AVATARS } from '../store/useProfileStore'
import { useGameStore } from '../store/useGameStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Lock, Download, Trash2, Star, BarChart3, 
  Volume2, Play, Users, CheckCircle2, AlertCircle, 
  Settings, ChevronRight, Search, FileText, Menu, X, Loader2, Trophy
} from 'lucide-react'
import { alphabet } from '../data/alphabet'
import { phonemes } from '../data/phonemes'
import { conversations } from '../data/conversations'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const DEFAULT_PIN = '2026'
const PIN_STORAGE_KEY = 'hurufi-teacher-pin'

// --- PDF GENERATION HELPERS ---

const generateDiploma = (student, stats) => {
  const doc = new jsPDF({ orientation: 'landscape' })
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()

  // Background
  doc.setFillColor(252, 247, 237)
  doc.rect(0, 0, width, height, 'F')
  
  // Border
  doc.setDrawColor(13, 148, 136)
  doc.setLineWidth(2)
  doc.rect(10, 10, width - 20, height - 20)
  doc.setLineWidth(0.5)
  doc.rect(12, 12, width - 24, height - 24)

  // Content
  doc.setTextColor(13, 148, 136)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(40)
  doc.text('CERTIFICAT DE RÉUSSITE', width / 2, 50, { align: 'center' })
  
  doc.setFontSize(20)
  doc.setTextColor(100, 116, 139)
  doc.text('Ce diplôme est fièrement décerné à', width / 2, 80, { align: 'center' })
  
  doc.setFontSize(45)
  doc.setTextColor(30, 41, 59)
  doc.text(student.prenom.toUpperCase(), width / 2, 105, { align: 'center' })
  
  doc.setFontSize(18)
  doc.setTextColor(100, 116, 139)
  doc.text(`Pour avoir brillamment complété le niveau ${student.niveau}`, width / 2, 130, { align: 'center' })
  doc.text(`du programme d'apprentissage de la langue arabe Hurûfî`, width / 2, 140, { align: 'center' })

  // Stats Summary
  doc.setFontSize(12)
  doc.text(`Points obtenus : ${student.pointsTotal} ⭐  |  Sessions : ${stats.totalSessions}`, width / 2, 160, { align: 'center' })

  // Footer
  doc.setFontSize(10)
  const date = new Date().toLocaleDateString('fr-FR')
  doc.text(`Fait le ${date}`, 30, height - 30)
  doc.text('La Maîtresse', width - 60, height - 30)
  
  doc.save(`Diplome_Hurufi_${student.prenom}.pdf`)
}

const generateClassReport = (profiles, getStats) => {
  const doc = new jsPDF()
  doc.setFontSize(20)
  doc.text('Rapport de Progrès Hurûfî', 14, 22)
  
  const tableData = profiles.map(p => {
    const s = getStats(p.id)
    return [
      p.prenom,
      p.niveau,
      p.pointsTotal,
      s.totalSessions,
      `${Math.round(((s.ecoute?.correct || 0) / 20) * 100)}%`,
      `${Math.round(((s.phonemes?.correct || 0) / 6) * 100)}%`
    ]
  })

  doc.autoTable({
    startY: 30,
    head: [['Prénom', 'Niveau', 'Points', 'Sessions', 'Écoute', 'Phonèmes']],
    body: tableData,
    headStyles: { fillColor: [13, 148, 136] },
  })

  doc.save('Rapport_Classe_Hurufi.pdf')
}

// --- HELPER COMPONENTS ---

function ResourceStatus({ url, type }) {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    if (!url) { setStatus('missing'); return }
    if (type === 'audio') {
      const a = new Audio(url)
      a.oncanplaythrough = () => setStatus('ok')
      a.onerror = () => setStatus('error')
      a.load()
    } else {
      const img = new Image()
      img.onload = () => setStatus('ok')
      img.onerror = () => setStatus('error')
      img.src = url
    }
  }, [url, type])

  if (status === 'checking') return <div className="h-2 w-8 bg-slate-100 rounded-full animate-pulse" />
  if (status === 'ok') return <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Disponible" />
  return <AlertCircle className="h-4 w-4 text-rose-500" aria-label="Manquant" />
}

function ProgressCard({ label, value, max = 20, colorClass, bgClass, toolTip }) {
  const percentage = Math.round((value / max) * 100)
  return (
    <div className={`${bgClass} rounded-2xl p-3 border border-white/50 shadow-sm relative group`} title={toolTip}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-xs font-black ${colorClass}`}>{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
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
          className="w-full max-w-md bg-white rounded-[2.5rem] card-shadow p-10 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="h-10 w-10 text-brand-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">فضاء المعلمة</h2>
          <p className="text-slate-500 font-medium mb-8 uppercase text-xs tracking-widest">Espace Sécurisé</p>
          
          <div className="space-y-4 text-left" dir="ltr">
            <label className="text-xs font-bold text-slate-400 ml-1">CODE PIN</label>
            <input
              type="password" value={pin} onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePin()}
              placeholder="••••" autoFocus
              className="w-full p-5 rounded-2xl border-2 border-slate-50 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 outline-none font-black text-center text-4xl tracking-[0.5em] bg-slate-50 transition-all"
            />
            <button onClick={handlePin} className="w-full p-5 rounded-2xl bg-brand-600 text-white font-black text-lg hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all active:scale-95">
              DÉVERROUILLER
            </button>
            <p className="text-center text-xs text-slate-300 mt-4 italic">Code d'accès requis pour protéger les données élèves.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-600 font-bold text-sm mt-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour au menu
          </Link>
        </motion.div>
      </div>
    )
  }

  const menuItems = [
    { id: 'students', label: 'Suivi des élèves', icon: Users, color: 'text-blue-500' },
    { id: 'audio', label: 'Audit des sons', icon: Volume2, color: 'text-purple-500' },
    { id: 'assets', label: 'État des médias', icon: FileText, color: 'text-emerald-500' },
    { id: 'settings', label: 'Paramètres', icon: Settings, color: 'text-slate-500' },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[90vh] gap-6" dir="ltr">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h1 className="font-black text-slate-800 text-lg">Hurûfî Pro</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-50 rounded-xl">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-0 z-50 md:relative md:block md:w-64 flex-shrink-0 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="bg-white h-full md:h-auto rounded-[2rem] card-shadow p-4 sticky top-6 border border-slate-100">
          <div className="px-4 py-6 mb-4 hidden md:block">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
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
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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
              <ArrowLeft className="h-4 w-4" /> Quitter
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
  {/* Hero Metrics Top */}
  <div className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-sm mb-6 text-center">
    <h2 className="text-2xl font-black text-slate-800 mb-2">Tableau de bord avancé</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <ProgressCard label="Élèves" value={42} colorClass="text-blue-600" bgClass="bg-blue-50" toolTip="Total profils enregistrés" />
      <ProgressCard label="Médias OK" value={28} colorClass="text-emerald-600" bgClass="bg-green-50" toolTip="Ressources valides" />
      <ProgressCard label="Sessions" value={127} colorClass="text-purple-600" bgClass="bg-purple-50" toolTip="Activités réalisées" />
      <ProgressCard label="Streak" value={7} colorClass="text-pink-600" bgClass="bg-pink-50" toolTip="Séquences réussies" />
    </div>
  </div>
</main>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-slate-400 font-medium text-sm">Contrôle pédagogique avancé</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => generateClassReport(profiles, getStats)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-100 text-slate-700 font-bold text-sm card-shadow hover:bg-slate-50 transition-all"
            >
              <Download className="h-4 w-4 text-brand-600" /> Export PDF Rapport
            </button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="text" placeholder="Chercher un prénom..." 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 card-shadow outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50 w-full sm:w-64 font-bold text-sm transition-all"
                aria-label="Rechercher un élève"
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            className="pb-10"
          >
            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredProfiles.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold">Aucun élève trouvé.</p>
                      <button onClick={() => setSearchTerm('')} className="text-brand-600 font-black text-xs mt-2 uppercase tracking-tighter hover:underline">Voir tout le monde</button>
                    </div>
                  ) : (
                    filteredProfiles.map((p) => {
                      const stats = getStats(p.id)
                      return (
                        <div key={p.id} className="bg-white rounded-[2.5rem] card-shadow p-7 border border-slate-50 group hover:border-brand-200 transition-all hover:shadow-xl">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner ${p.avatarColor || 'bg-slate-100'}`}>
                                {p.avatar && (p.avatar.includes('http') || p.avatar.includes('assets')) ? (
                                   <img src={p.avatar} alt="" className="w-16 h-16 object-contain" />
                                ) : (
                                  CHILD_AVATARS.find(a => a.img === p.avatar)?.emoji || '👤'
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{p.prenom}</h3>
                                  <button 
                                    onClick={() => generateDiploma(p, stats)}
                                    title="Générer un diplôme"
                                    className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                                  >
                                    <Trophy className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase">Diplôme</span>
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 rounded-lg bg-gold-500 text-white font-black text-[9px] uppercase shadow-sm">Niveau {p.niveau}</span>
                                  <span className="text-slate-400 font-bold text-xs">⭐ {p.pointsTotal} points</span>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => { if(confirm(`Réinitialiser ${p.prenom} ?`)) resetProfile(p.id) }} 
                              aria-label={`Réinitialiser le profil de ${p.prenom}`}
                              className="p-3 rounded-xl text-slate-300 hover:text-coral-500 hover:bg-coral-50 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                            <ProgressCard label="Écoute" value={stats.ecoute?.correct || 0} colorClass="text-blue-600" bgClass="bg-blue-50" toolTip="Module reconnaissance" />
                            <ProgressCard label="Mémoire" value={stats.memory?.completed || 0} max={10} colorClass="text-purple-600" bgClass="bg-purple-50" toolTip="Jeux de mémoire" />
                            <ProgressCard label="Phonèmes" value={stats.phonemes?.correct || 0} max={6} colorClass="text-emerald-600" bgClass="bg-emerald-50" toolTip="Distinction phonétique" />
                            <ProgressCard label="Tracé" value={stats.tracage?.completed || 0} max={12} colorClass="text-orange-600" bgClass="bg-orange-50" toolTip="Geste graphique" />
                            <ProgressCard label="Flash" value={stats.flashcards?.vus || 0} max={50} colorClass="text-pink-600" bgClass="bg-pink-50" toolTip="Vocabulaire vu" />
                            <div className="bg-brand-50 rounded-2xl p-3 flex flex-col justify-center items-center text-center border border-brand-100">
                              <span className="text-[10px] font-black text-brand-400 uppercase">Streak</span>
                              <span className="text-xl font-black text-brand-700">🔥 {stats.streak}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[11px] font-black text-slate-400 border-t border-slate-50 pt-5">
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Profil Actif</span>
                            <span className="uppercase tracking-widest">Sessions : {stats.totalSessions}</span>
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
                <section className="bg-white rounded-[2.5rem] card-shadow p-8 border border-slate-50">
                  <header className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-xl font-black text-slate-800">Audit Vocal : Alphabet</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Vérification de la clarté</p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-tighter">28 Fichiers</span>
                  </header>
                  <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-10 gap-3">
                    {alphabet.map(l => {
                      const isActive = playingId === `lettre-${l.id}`
                      return (
                        <button 
                          key={l.id} onClick={() => playPreview(l.audio, `lettre-${l.id}`)}
                          aria-label={`Écouter la lettre ${l.lettre}`}
                          className={`group relative h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                            isActive ? 'bg-brand-600 border-brand-600 text-white shadow-xl scale-110 z-10' : 'bg-white border-slate-50 hover:border-brand-200 text-slate-700 hover:shadow-lg'
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

                <section className="bg-white rounded-[2.5rem] card-shadow p-8 border border-slate-50">
                  <header className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800">Phonèmes & Vocabulaire</h3>
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
                          playingId === `phoneme-${p.id}` ? 'bg-brand-600 border-brand-600 text-white shadow-xl' : 'bg-slate-50 border-transparent hover:border-slate-200'
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
              <div className="bg-white rounded-[2.5rem] card-shadow overflow-hidden border border-slate-100">
                <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex gap-4">
                      <div className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black">MÉDIA OK</div>
                      <div className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-black">MANQUANT</div>
                   </div>
                   <div className="text-right" dir="rtl">
                     <h3 className="text-2xl font-black text-slate-800 mb-1">بيان حالة الوسائط</h3>
                     <p className="text-slate-400 text-sm font-bold">Vérification de l'intégrité des fichiers serveurs.</p>
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right" dir="rtl">
                    <thead className="bg-white">
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                        <th className="p-8">المادة (Item)</th>
                        <th className="p-8 text-center">الصوت (Audio)</th>
                        <th className="p-8 text-center">الصورة (Image)</th>
                        <th className="p-8">المسار (Path)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr className="bg-brand-50/50"><td colSpan="4" className="p-4 font-black text-brand-700 text-xs uppercase tracking-widest px-8">Section Alphabet</td></tr>
                      {alphabet.slice(0, 28).map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-6 px-8">
                            <span className="font-arabic font-black text-2xl text-slate-800 ml-3">{l.lettre}</span> 
                            <span className="text-xs text-slate-400 font-bold">({l.translit})</span>
                          </td>
                          <td className="p-6 text-center"><ResourceStatus url={l.audio} type="audio" /></td>
                          <td className="p-6 text-center"><ResourceStatus url={`resources/images/lettres/lettre_${l.translit.toLowerCase()}.png`} type="image" /></td>
                          <td className="p-6 text-[10px] text-slate-300 font-mono group-hover:text-slate-500 transition-colors">{l.audio}</td>
                        </tr>
                      ))}

                      {categories.map(cat => (
                        <React.Fragment key={cat.id}>
                          <tr className="bg-slate-50/50">
                            <td colSpan="4" className="p-4 font-black text-brand-700 text-xs uppercase tracking-widest px-8">{cat.emoji} {cat.nomAr}</td>
                          </tr>
                          {cat.mots.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="p-6 px-8 flex items-center gap-3">
                                {cat.id === 'nombres' && (
                                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-black text-slate-400 border border-slate-200">{m.fr}</span>
                                )}
                                <span className="font-arabic font-black text-xl text-slate-800">{m.ar}</span> 
                                <span className="text-[10px] text-slate-400 font-bold">({m.fr})</span>
                              </td>
                              <td className="p-6 text-center"><ResourceStatus url={m.audio} type="audio" /></td>
                              <td className="p-6 text-center"><ResourceStatus url={m.image} type="image" /></td>
                              <td className="p-6 text-[10px] text-slate-300 font-mono group-hover:text-slate-500 transition-colors break-all max-w-[250px]">{m.image}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6 pt-10 text-center">
                <div className="bg-white rounded-[3rem] card-shadow p-12 border border-slate-50">
                  <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Trash2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-3">Zone de Maintenance</h3>
                  <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Attention, la suppression des données est irréversible et affectera tous les profils élèves.</p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => { if(confirm('Supprimer TOUS les profils ?')) deleteAllProfiles() }}
                      className="w-full p-6 rounded-2xl bg-rose-500 text-white font-black text-lg hover:bg-rose-600 shadow-xl shadow-rose-100 transition-all active:scale-95"
                    >
                      Supprimer tous les profils élèves
                    </button>
                    <button className="w-full p-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition-all">
                      Sauvegarder les résultats (Backup)
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



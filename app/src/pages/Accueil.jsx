import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore, CHILD_AVATARS } from '../store/useProfileStore'
import { UserPlus, Sparkles, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'

export default function Accueil() {
  const profiles = useProfileStore(s => s.profiles)
  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const createProfile = useProfileStore(s => s.createProfile)
  const setActiveProfile = useProfileStore(s => s.setActiveProfile)
  const navigate = useNavigate()

  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNameAr, setNewNameAr] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [newGoal, setNewGoal] = useState(200)
  const [difficulty, setDifficulty] = useState('normal')
  const [currentUrl, setCurrentUrl] = useState('')
  const [isQrExpanded, setIsQrExpanded] = useState(false)

  useEffect(() => {
    setCurrentUrl(window.location.origin + window.location.pathname)
  }, [])

  const handleCreate = () => {
    if (!newName.trim()) return
    const id = createProfile({
      prenom: newName.trim(),
      prenomAr: newNameAr.trim() || null,
      avatar: CHILD_AVATARS[selectedAvatar],
      progress: 0,
      goal: newGoal,
      difficulty: difficulty
    })
    setActiveProfile(id)
    navigate('/modules')
    // Reset
    setNewName('')
    setSelectedAvatar(0)
    setNewGoal(200)
    setDifficulty('normal')
    // Effet visuel
    const btn = document.querySelector('.w-full.flex.items-center.justify-center.gap-2.p-3.5')
    if (btn) btn.style.transform = 'scale(0.95)'
  }

  const handleSelect = (id) => {
    setActiveProfile(id)
    // Micro-célébration visuelle
    const btn = document.querySelector(`[data-profile-id="${id}"]`)
    if (btn) {
      btn.style.transform = 'scale(0.95)'
      setTimeout(() => btn.style.transform = '', 150)
    }
    navigate('/modules')
  }

  const garcons = CHILD_AVATARS.filter(a => a.gender === 'garcon')
  const filles = CHILD_AVATARS.filter(a => a.gender === 'fille')

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4">

        {/* Left — Branding */}
        <motion.div className="space-y-6" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">حروفي</span>
            </h1>
            <p className="font-arabic text-3xl sm:text-4xl text-brand-700 mt-1" dir="rtl">حُرُوفِي</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mt-2">تعلّم العربية باللعب</p>
          </div>

          <div className="inline-block bg-gold-100 text-gold-600 shadow-sm px-5 py-2 rounded-full font-bold text-sm animate-pulse">
            ✨ التعلّم الممتع ✨
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
            مرحبًا بك في تطبيق <strong className="text-slate-800 dark:text-slate-100">تعلّم العربية</strong>!
            اكتشف <strong className="text-brand-600">الحروف</strong> و<strong className="text-brand-600">الأصوات</strong> والكثير من <strong className="text-brand-600">الكلمات</strong> عبر ألعاب ممتعة.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {['🎧 استماع', '🧠 ذاكرة', '👂 أصوات', '✏️ كتابة', '📷 كلمات', '💬 محادثة'].map((item, i) => (
              <span key={i} className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 pt-2">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-brand-100 flex items-start gap-3 shadow-sm max-w-md relative overflow-hidden flex-1">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-400" />
              <div className="h-9 w-9 flex-shrink-0 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-brand-700 text-sm mb-0.5">6 ألعاب تعليمية</h4>
                <p className="text-xs text-slate-500 font-medium">تمييز الحروف، ذاكرة، أصوات، تتبع، كلمات، ومحادثة — كل ما تحتاجه للتقدم!</p>
              </div>
            </div>

            {/* QR Code Card */}
            {currentUrl && (
              <div
                className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3 hover:shadow-md hover:border-brand-400/50 transition-all cursor-pointer"
                onClick={() => setIsQrExpanded(true)}
                title="اضغط لتكبير رمز QR"
              >
                <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-50">
                  <QRCodeSVG value={currentUrl} size={64} level="L" fgColor="#0d9488" />
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-sm mb-0.5">
                    <QrCode className="w-4 h-4 text-brand-500" />
                    امسحني!
                  </strong>
                  <span className="text-slate-400 font-medium text-xs max-w-[130px] block leading-tight">
                    اتصل من جهازك اللوحي
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

{/* Right — Profiles */}
        <motion.div
          className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] card-shadow-lg border border-slate-100 dark:border-slate-700/50 w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">من أنت؟ 🧒</h2>
            <p className="text-slate-400 font-medium text-sm">اختر ملفك أو أنشئ ملفًا جديدًا</p>
          </div>

          <div className="space-y-2.5 mb-5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {profiles.map(p => (
<button
                  key={p.id}
                  data-profile-id={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                    activeProfile?.id === p.id
                      ? 'border-brand-400 bg-brand-50/50 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:shadow-md bg-white dark:bg-slate-800'
                  }`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform ${p.avatarColor || 'bg-brand-50 text-brand-600'}`}>
                  {p.avatar?.startsWith('/') || p.avatar?.startsWith('http') || p.avatar?.startsWith(import.meta.env.BASE_URL || '') ? (
                    <img 
                      src={p.avatar} 
                      alt={p.prenom}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = '<span class="text-2xl">🧒</span>';
                      }}
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <span className="text-2xl">{p.avatar}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{p.prenom}</h3>
                  <p className="text-xs font-semibold text-brand-600">
                    {p.avatarName && <span className="text-slate-400">{p.avatarName} • </span>}
                    المستوى {p.niveau}
                  </p>
                  {/* Badge d'activité */}
                  {activeProfile?.id === p.id && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      نشط الآن
                    </span>
                  )}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>التقدم نحو الهدف</span>
                      <span>{Math.round(Math.min((p.pointsTotal / (p.goal || 200)) * 100, 100))}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((p.pointsTotal / (p.goal || 200)) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-amber-600 font-bold">
                      {p.pointsTotal} ⭐ {p.pointsTotal >= 100 && '🔥'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {profiles.length === 0 && !isCreating && (
              <div className="text-center py-8 text-slate-300 font-medium border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                لا يوجد ملف
              </div>
            )}
          </div>

          {isCreating ? (
            <div className="space-y-3 bg-brand-50/50 p-4 rounded-2xl border border-brand-100">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="اسمك (بالفرنسية)"
                autoFocus
                className="w-full p-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-brand-400 outline-none font-bold bg-white dark:bg-slate-800"
              />
              <input
                type="text"
                value={newNameAr}
                onChange={e => setNewNameAr(e.target.value)}
                placeholder="اسمك بالعربية (اختياري) — مثال: يَاسِين"
                dir="rtl"
                className="w-full p-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-brand-400 outline-none font-arabic text-lg bg-white dark:bg-slate-800"
              />
              {/* Objectif hebdomadaire */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">🎯 هَدَفُ الأُسْبُوع</p>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 200, 500].map(pts => (
                    <button
                      key={pts}
                      onClick={() => setNewGoal(pts)}
                      className={`p-2 rounded-lg text-xs font-bold transition-all ${newGoal === pts ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
                    >
                      {pts} ⭐
                    </button>
                  ))}
                </div>
              </div>
              {/* Niveau de difficulté */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">⚡ المُسْتَوَى</p>
                <div className="flex gap-2">
                  {['سَهْل', 'عَادِي', 'صَعْب'].map((diff, i) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(['easy', 'normal', 'hard'][i])}
                      className={`flex-1 p-2 rounded-lg text-xs font-bold transition-all ${difficulty === ['easy', 'normal', 'hard'][i] ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              {/* Avatars — Grille unique */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">اختر شخصيتك</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {CHILD_AVATARS.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAvatar(i)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all overflow-hidden ${
                        selectedAvatar === i
                          ? `${a.color} scale-105 shadow-md ring-2 ring-brand-400`
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      <div className="h-10 w-10 flex items-center justify-center">
                        {a.img ? (
                          <img 
                            src={a.img} 
                            alt={a.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                            className="w-full h-full object-contain" 
                          />
                        ) : (
                          <span className="text-2xl">{a.emoji}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 leading-tight text-center">{a.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setIsCreating(false); setNewName('') }} className="flex-1 p-3 rounded-xl font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition-colors">
                  إلغاء
                </button>
                <button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 p-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors">
                  إنشاء ✨
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-brand-300 text-brand-600 font-bold hover:bg-brand-50 hover:border-brand-400 transition-all"
            >
              <UserPlus className="h-5 w-5" />
              ملف جديد
            </button>
          )}
        </motion.div>
      </div>

      {/* QR Code Expanded Modal */}
      {isQrExpanded && currentUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4"
          onClick={() => setIsQrExpanded(false)}
        >
          <motion.div
            className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center flex flex-col items-center"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-3 justify-center">
              <QrCode className="w-8 h-8 text-brand-500" />
              امسح للعب!
            </h3>
            <p className="text-slate-500 font-medium text-base mb-2">
              امسح رمز QR من هاتفك أو جهازك اللوحي.
            </p>
            <p className="font-arabic text-lg text-brand-600 mb-6" dir="rtl">اِمْسَحْ لِلَّعِب!</p>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border-2 border-brand-100 inline-block mb-8">
              <QRCodeSVG value={currentUrl} size={300} level="M" fgColor="#0d9488" />
            </div>
            <button
              onClick={() => setIsQrExpanded(false)}
              className="w-full py-4 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 transition-colors text-lg"
            >
              إغلاق
            </button>
          </motion.div>
        </div>
      )}

    </div>
  )
}

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const VALIDATION_THRESHOLD = 0.6 // 60%

// ──────────────────────────────────────────────────────────────
// ATTESTATION DE SUIVI PÉDAGOGIQUE
// Document officiel : pseudo élève, % par module, signatures
// ──────────────────────────────────────────────────────────────
export const generateAttestation = (student, stats) => {
  const doc = new jsPDF()
  const w   = doc.internal.pageSize.getWidth()
  const h   = doc.internal.pageSize.getHeight()
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  // ── Cadre officiel ──
  doc.setDrawColor(13, 148, 136)
  doc.setLineWidth(2)
  doc.rect(6, 6, w - 12, h - 12)
  doc.setLineWidth(0.4)
  doc.setDrawColor(245, 158, 11)
  doc.rect(9, 9, w - 18, h - 18)

  // ── En-tête ──
  doc.setFillColor(13, 148, 136)
  doc.rect(6, 6, w - 12, 44, 'F')
  doc.setFillColor(245, 158, 11)
  doc.rect(6, 50, w - 12, 2.5, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PROGRAMME HURÛFÎ — APPRENTISSAGE DE L\'ARABE — ANNÉE 1', w / 2, 20, { align: 'center' })
  doc.setFontSize(20)
  doc.text('ATTESTATION DE SUIVI PÉDAGOGIQUE', w / 2, 38, { align: 'center' })

  // ── Infos élève ──
  let y = 62
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, y - 5, w - 28, 34, 3, 3, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(14, y - 5, w - 28, 34, 3, 3, 'S')

  // Ligne 1 : pseudo + date
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('Pseudo de l\'élève :', 20, y + 5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(13, 148, 136)
  doc.text(student.prenom.toUpperCase(), 68, y + 5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('Date :', w - 75, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text(date, w - 60, y + 5)

  // Ligne 2 : niveau + points
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('Niveau atteint :', 20, y + 18)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(`Niveau ${student.niveau}`, 68, y + 18)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('Points étoiles :', w - 75, y + 18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 158, 11)
  doc.text(`${student.pointsTotal} ⭐`, w - 45, y + 18)

  // ── Tableau des modules ──
  y += 40
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text('RÉSULTATS PAR MODULE', 14, y)
  doc.setDrawColor(13, 148, 136)
  doc.setLineWidth(1)
  doc.line(14, y + 2, 80, y + 2)

  const modules = [
    { name: 'Écoute & Reconnaissance', nameAr: 'الاستماع',  value: stats.ecoute?.correct     || 0, max: 20 },
    { name: 'Jeu de Mémoire',          nameAr: 'الذاكرة',   value: stats.memory?.completed   || 0, max: 6  },
    { name: 'Distinction Phonèmes',    nameAr: 'الأصوات',   value: stats.phonemes?.correct   || 0, max: 6  },
    { name: 'Traçage des Lettres',     nameAr: 'التتبع',    value: stats.tracage?.completed  || 0, max: 12 },
    { name: 'Syllabes',               nameAr: 'المقاطع',   value: stats.syllabes?.correct   || 0, max: 36 },
    { name: 'Vocabulaire',            nameAr: 'الكلمات',   value: stats.flashcards?.vus     || 0, max: 72 },
    { name: 'Conversation',           nameAr: 'المحادثة',  value: stats.conversation?.correct|| 0, max: 24 },
  ]

  const tableBody = modules.map(m => {
    const pct    = m.max > 0 ? Math.min(100, Math.round((m.value / m.max) * 100)) : 0
    const status = m.value === 0 ? 'Non travaillé' : pct >= 60 ? 'Validé ✓' : 'En cours'
    return [m.name, m.nameAr, `${m.value} / ${m.max}`, `${pct} %`, status]
  })

  doc.autoTable({
    startY: y + 6,
    head: [['Module', 'بالعربية', 'Exercices réalisés', '% Réussite', 'Statut']],
    body: tableBody,
    headStyles: {
      fillColor: [15, 23, 42], textColor: [255, 255, 255],
      fontSize: 9, fontStyle: 'bold', cellPadding: 5,
    },
    bodyStyles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') return
      if (data.column.index === 4) {
        const v = data.cell.raw
        if (v.includes('Validé'))       data.cell.styles.textColor = [16, 185, 129]
        else if (v === 'En cours')      data.cell.styles.textColor = [245, 158, 11]
        else                            data.cell.styles.textColor = [148, 163, 184]
      }
      if (data.column.index === 3) {
        const p = parseInt(data.cell.raw)
        if (p >= 60)      data.cell.styles.textColor = [16, 185, 129]
        else if (p > 0)   data.cell.styles.textColor = [245, 158, 11]
        else              data.cell.styles.textColor = [148, 163, 184]
      }
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // ── Modules non travaillés ──
  const notDone = modules.filter(m => m.value === 0)
  if (notDone.length > 0) {
    const boxH = 8 + notDone.length * 6
    doc.setFillColor(254, 252, 232)
    doc.roundedRect(14, y, w - 28, boxH, 2, 2, 'F')
    doc.setDrawColor(253, 224, 71)
    doc.setLineWidth(0.4)
    doc.roundedRect(14, y, w - 28, boxH, 2, 2, 'S')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(146, 100, 16)
    doc.text('Modules non encore travaillés :', 19, y + 7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    notDone.forEach((m, i) => {
      doc.text(`• ${m.name}  (${m.nameAr})`, 24, y + 13 + i * 6)
    })
    y += boxH + 8
  } else {
    doc.setFillColor(236, 253, 245)
    doc.roundedRect(14, y, w - 28, 12, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(16, 185, 129)
    doc.text('✓ Tous les modules ont été travaillés.', w / 2, y + 8, { align: 'center' })
    y += 18
  }

  // ── Appréciation ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text('Appréciation générale de l\'enseignant(e) :', 14, y)
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(14, y + 8,  w - 14, y + 8)
  doc.line(14, y + 17, w - 14, y + 17)
  y += 24

  // ── Zone signatures ──
  const sigY = h - 64

  // Cadre enseignant (gauche)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, sigY, 82, 50, 3, 3, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.roundedRect(14, sigY, 82, 50, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text('Nom de l\'enseignant(e) :', 19, sigY + 9)
  doc.setDrawColor(190, 190, 190)
  doc.setLineWidth(0.3)
  doc.line(19, sigY + 16, 90, sigY + 16)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Signature de l\'enseignant(e) :', 19, sigY + 27)
  doc.line(19, sigY + 46, 90, sigY + 46)

  // Cadre parents (droite)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(w - 96, sigY, 82, 50, 3, 3, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.roundedRect(w - 96, sigY, 82, 50, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text('Signature des parents :', w - 91, sigY + 9)
  doc.line(w - 91, sigY + 46, w - 20, sigY + 46)

  // Tampon global centré
  const validated = modules.filter(m => m.value > 0 && Math.min(100, Math.round((m.value / m.max) * 100)) >= 60).length
  const attempted = modules.filter(m => m.value > 0).length
  if (attempted > 0) {
    const stampX = w / 2
    const stampY = sigY + 25
    doc.setFillColor(attempted > 0 && validated === attempted ? 16 : 245,
                     attempted > 0 && validated === attempted ? 185 : 158,
                     attempted > 0 && validated === attempted ? 129 : 11)
    doc.circle(stampX, stampY, 18, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`${validated}/${attempted}`, stampX, stampY - 2, { align: 'center' })
    doc.setFontSize(6)
    doc.text('modules', stampX, stampY + 5, { align: 'center' })
    doc.text('validés', stampX, stampY + 11, { align: 'center' })
  }

  // ── Pied de page ──
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(
    `Document généré par HURÛFÎ Pro  |  ${date}  |  Document officiel à conserver`,
    w / 2, h - 11, { align: 'center' }
  )

  doc.save(`Attestation_${student.prenom}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

const MODULE_CONFIG = [
  { key: 'ecoute',   name: 'Ecoute & Reconnaissance', max: 20, valueKey: 'correct',   emoji: 'Ecoute' },
  { key: 'memory',   name: 'Jeu de Memoire',          max: 10, valueKey: 'completed', emoji: 'Memoire' },
  { key: 'phonemes', name: 'Distinction Phonemes',     max: 6,  valueKey: 'correct',   emoji: 'Phonemes' },
  { key: 'tracage',  name: 'Tracage des Lettres',      max: 12, valueKey: 'completed', emoji: 'Trace' },
  { key: 'flashcards', name: 'Flashcards Vocabulaire', max: 50, valueKey: 'vus',       emoji: 'Flash' },
]

export const generateDiploma = (student, stats) => {
  const doc = new jsPDF({ orientation: 'landscape' })
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()

  // --- DESIGN PREMIUM ---
  
  // Fond Dégradé léger (Simulation)
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, width, height, 'F')
  
  // Cadre double
  doc.setDrawColor(20, 184, 166) // Teal-500
  doc.setLineWidth(3)
  doc.rect(5, 5, width - 10, height - 10)
  
  doc.setDrawColor(245, 158, 11) // Amber-500
  doc.setLineWidth(1)
  doc.rect(8, 8, width - 16, height - 16)

  // Filigrane / Rosace
  doc.setDrawColor(241, 245, 249)
  doc.setLineWidth(0.5)
  for (let i = 0; i < 360; i += 15) {
    doc.line(width/2, height/2, width/2 + Math.cos(i) * 50, height/2 + Math.sin(i) * 50)
  }

  // Header
  doc.setTextColor(13, 148, 136)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('PROGRAMME D\'EXCELLENCE HURÛFÎ', width / 2, 20, { align: 'center' })
  
  doc.setFontSize(48)
  doc.text('DIPLÔME DE RÉUSSITE', width / 2, 55, { align: 'center' })
  
  // Badge doré
  doc.setFillColor(245, 158, 11)
  doc.circle(width - 40, height - 40, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('CERTIFIÉ', width - 40, height - 42, { align: 'center' })
  doc.text('2026', width - 40, height - 35, { align: 'center' })

  // Corps
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(22)
  doc.text('Ce titre honorifique est décerné à', width / 2, 85, { align: 'center' })
  
  doc.setFontSize(54)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text(student.prenom.toUpperCase(), width / 2, 115, { align: 'center' })
  
  doc.setDrawColor(226, 232, 240)
  doc.line(width / 2 - 60, 120, width / 2 + 60, 120)

  doc.setFontSize(18)
  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'normal')
  doc.text(`Pour son assiduité et ses progrès exceptionnels au Niveau ${student.niveau}`, width / 2, 140, { align: 'center' })

  // Footer / Scores
  doc.setFontSize(12)
  doc.setTextColor(148, 163, 184)
  doc.text(`Score Global : ${student.pointsTotal} points étoiles ⭐`, width / 2, 165, { align: 'center' })

  const date = new Date().toLocaleDateString('fr-FR')
  doc.setFontSize(11)
  doc.text(`Délivré le ${date}`, 30, height - 30)
  
  doc.setFontSize(14)
  doc.setTextColor(13, 148, 136)
  doc.text('LA MAÎTRESSE', width - 70, height - 70)
  doc.setDrawColor(13, 148, 136)
  doc.line(width - 90, height - 65, width - 50, height - 65)
  
  doc.save(`Diplome_Hurufi_${student.prenom}.pdf`)
}

export const generateClassReport = (profiles, getStats) => {
  const doc = new jsPDF()
  
  // Header Style
  doc.setFillColor(13, 148, 136)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('RAPPORT DE CLASSE HURÛFÎ', 105, 25, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const date = new Date().toLocaleDateString('fr-FR')
  doc.text(`Généré le ${date} | Total Élèves : ${profiles.length}`, 105, 33, { align: 'center' })

  const tableData = profiles.map(p => {
    const s = getStats(p.id)
    return [
      p.prenom.toUpperCase(),
      `Niveau ${p.niveau}`,
      `${p.pointsTotal} pts`,
      s.totalSessions,
      `${Math.round(((s.ecoute?.correct || 0) / 20) * 100)}%`,
      `${Math.round(((s.phonemes?.correct || 0) / 6) * 100)}%`,
      s.streak > 0 ? `🔥 ${s.streak}` : '-'
    ]
  })

  doc.autoTable({
    startY: 50,
    head: [['Nom de l\'Élève', 'Niveau', 'Étoiles', 'Sessions', 'Reconnaissance', 'Phonèmes', 'Série']],
    body: tableData,
    headStyles: { 
      fillColor: [20, 184, 166], 
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 50 },
    styles: { fontSize: 9, cellPadding: 5 }
  })

  doc.save(`Rapport_Classe_Hurufi_${date.replace(/\//g, '-')}.pdf`)
}

export const generateStudentReport = (student, stats, profileSummary) => {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  // ===== HEADER =====
  doc.setFillColor(13, 148, 136) // Teal-600
  doc.rect(0, 0, w, 48, 'F')
  
  // Decorative line
  doc.setFillColor(245, 158, 11) // Amber
  doc.rect(0, 48, w, 2, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('RAPPORT DE PROGRESSION', w / 2, 20, { align: 'center' })
  
  doc.setFontSize(36)
  doc.text(student.prenom.toUpperCase(), w / 2, 38, { align: 'center' })

  // Sub-header bar
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 50, w, 16, 'F')
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Date : ${date}`, 15, 60)
  doc.text(`Niveau : ${student.niveau}`, 80, 60)
  doc.text(`Programme : HURUFI 2026`, w - 15, 60, { align: 'right' })

  // ===== SECTION 1 : RESUME GLOBAL =====
  let y = 76
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text('1. RESUME GLOBAL', 15, y)
  
  y += 4
  doc.setDrawColor(20, 184, 166)
  doc.setLineWidth(1)
  doc.line(15, y, 60, y)

  // Compute global metrics
  const moduleResults = MODULE_CONFIG.map(mod => {
    const value = stats[mod.key]?.[mod.valueKey] || 0
    const pct = Math.min(100, Math.round((value / mod.max) * 100))
    const validated = pct >= VALIDATION_THRESHOLD * 100
    return { ...mod, value, pct, validated }
  })
  
  const modulesAttempted = moduleResults.filter(m => m.value > 0)
  const modulesValidated = moduleResults.filter(m => m.validated && m.value > 0)
  const globalSuccessRate = modulesAttempted.length > 0
    ? Math.round(modulesAttempted.reduce((s, m) => s + m.pct, 0) / modulesAttempted.length)
    : 0

  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)

  // KPI boxes
  const kpis = [
    { label: 'Points Etoiles', value: `${student.pointsTotal}`, color: [245, 158, 11] },
    { label: 'Sessions', value: `${stats.totalSessions}`, color: [59, 130, 246] },
    { label: 'Serie Active', value: `${stats.streak} jours`, color: [239, 68, 68] },
    { label: 'Taux Global', value: `${globalSuccessRate}%`, color: globalSuccessRate >= 60 ? [16, 185, 129] : [239, 68, 68] },
  ]

  const boxW = (w - 40) / 4
  kpis.forEach((kpi, i) => {
    const bx = 15 + i * (boxW + 4)
    // Box bg
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(bx, y, boxW, 22, 3, 3, 'F')
    // Label
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'bold')
    doc.text(kpi.label.toUpperCase(), bx + boxW / 2, y + 7, { align: 'center' })
    // Value
    doc.setFontSize(14)
    doc.setTextColor(...kpi.color)
    doc.text(kpi.value, bx + boxW / 2, y + 18, { align: 'center' })
  })

  // ===== SECTION 2 : DETAIL PAR MODULE =====
  y += 36
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text('2. DETAIL PAR MODULE', 15, y)
  
  y += 4
  doc.setDrawColor(20, 184, 166)
  doc.line(15, y, 60, y)
  y += 4

  // Validation legend
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.text('Seuil de validation : 60% de reussite minimum | Au moins 1 exercice tente', 15, y + 4)

  const tableBody = moduleResults.map(m => {
    const status = m.value === 0 ? 'Non tente' : m.validated ? 'VALIDE' : 'En cours'
    return [
      m.name,
      `${m.value} / ${m.max}`,
      `${m.pct}%`,
      status
    ]
  })

  doc.autoTable({
    startY: y + 8,
    head: [['Module', 'Exercices', 'Taux (%)', 'Statut']],
    body: tableBody,
    headStyles: { 
      fillColor: [15, 23, 42], 
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: 4
    },
    bodyStyles: { fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = data.cell.raw
        if (val === 'VALIDE') {
          data.cell.styles.textColor = [16, 185, 129]
        } else if (val === 'En cours') {
          data.cell.styles.textColor = [245, 158, 11]
        } else {
          data.cell.styles.textColor = [148, 163, 184]
        }
      }
      // Color the percentage
      if (data.section === 'body' && data.column.index === 2) {
        const pct = parseInt(data.cell.raw)
        if (pct >= 60) data.cell.styles.textColor = [16, 185, 129]
        else if (pct > 0) data.cell.styles.textColor = [245, 158, 11]
      }
    },
    margin: { left: 15, right: 15 },
  })

  // ===== SECTION 3 : METRIQUES COMPORTEMENTALES =====
  y = doc.lastAutoTable.finalY + 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text('3. METRIQUES COMPORTEMENTALES', 15, y)
  
  y += 4
  doc.setDrawColor(20, 184, 166)
  doc.line(15, y, 75, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)

  if (profileSummary) {
    const lines = [
      `Temps de reponse moyen : ${profileSummary.avgResponseTime ? (profileSummary.avgResponseTime / 1000).toFixed(1) + 's' : 'Non disponible'}`,
      `Module favori : ${profileSummary.favoriteModule || 'Aucun'}`,
      `Total evenements traces : ${profileSummary.totalEvents}`,
      `Reponses correctes : ${profileSummary.correctEvents} | Erreurs : ${profileSummary.errorEvents}`,
      `Premiere activite : ${profileSummary.firstActivity ? new Date(profileSummary.firstActivity).toLocaleDateString('fr-FR') : '-'}`,
      `Derniere activite : ${profileSummary.lastActivity ? new Date(profileSummary.lastActivity).toLocaleDateString('fr-FR') : '-'}`,
    ]
    if (profileSummary.confidenceDist) {
      const cd = profileSummary.confidenceDist
      const total = cd.high + cd.medium + cd.low
      if (total > 0) {
        lines.push(`Confiance : Haute ${cd.high} | Moyenne ${cd.medium} | Basse ${cd.low}`)
      }
    }
    lines.forEach((line, i) => {
      doc.text(`• ${line}`, 20, y + i * 6)
    })
    y += lines.length * 6 + 6
  } else {
    doc.text('Aucune donnee comportementale disponible pour cet eleve.', 20, y)
    y += 10
  }

  // ===== SECTION 4 : RECOMMANDATIONS =====
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text('4. RECOMMANDATIONS', 15, y)
  
  y += 4
  doc.setDrawColor(20, 184, 166)
  doc.line(15, y, 60, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)

  const weakModules = moduleResults.filter(m => m.value > 0 && !m.validated)
  const notAttempted = moduleResults.filter(m => m.value === 0)

  if (weakModules.length === 0 && notAttempted.length === 0) {
    doc.setTextColor(16, 185, 129)
    doc.text('Excellent ! Tous les modules tentes sont valides. Continuer ainsi !', 20, y)
    y += 8
  } else {
    if (weakModules.length > 0) {
      doc.setTextColor(245, 158, 11)
      doc.text('Modules a renforcer (taux < 60%) :', 20, y)
      y += 6
      doc.setTextColor(71, 85, 105)
      weakModules.forEach(m => {
        doc.text(`  - ${m.name} : ${m.pct}% (objectif : 60%)`, 25, y)
        y += 5
      })
      y += 3
    }
    if (notAttempted.length > 0) {
      doc.setTextColor(148, 163, 184)
      doc.text('Modules non encore explores :', 20, y)
      y += 6
      notAttempted.forEach(m => {
        doc.text(`  - ${m.name}`, 25, y)
        y += 5
      })
    }
  }

  // ===== VALIDATION STAMP =====
  const validated = modulesValidated.length
  const total = modulesAttempted.length

  y += 10
  if (total > 0 && validated === total) {
    doc.setFillColor(16, 185, 129)
    doc.roundedRect(w / 2 - 45, y, 90, 18, 4, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOUS LES MODULES VALIDES', w / 2, y + 12, { align: 'center' })
  } else if (total > 0) {
    doc.setFillColor(245, 158, 11)
    doc.roundedRect(w / 2 - 45, y, 90, 18, 4, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`${validated}/${total} MODULES VALIDES`, w / 2, y + 12, { align: 'center' })
  }

  // ===== FOOTER =====
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(15, pageH - 22, w - 15, pageH - 22)
  
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`Rapport genere automatiquement par HURUFI Pro | ${date}`, 15, pageH - 15)
  doc.text('Document confidentiel - Usage pedagogique exclusif', w - 15, pageH - 15, { align: 'right' })

  doc.save(`Rapport_${student.prenom}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// Les 28 lettres de l'alphabet arabe
// Les 12 premières sont les "prioritaires" (sans points) pour le traçage

const LETTER_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#ec4899', '#eab308',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e', '#d97706', '#14b8a6',
  '#6366f1', '#10b981', '#f59e0b', '#e879f9', '#0ea5e9', '#f472b6',
  '#a855f7', '#059669', '#fb923c', '#4ade80', '#818cf8', '#fbbf24',
  '#38bdf8', '#c084fc', '#34d399', '#fb7185',
]

export const alphabet = [
  // 12 lettres prioritaires (sans points) — pour traçage
  { id: 1,  lettre: 'ا', nom: 'أَلِف',   translit: 'Alif',    son: 'a',     audio: 'audio/lettres/lettre_01_alif.mp3',    prioritaire: true,  color: LETTER_COLORS[0] },
  { id: 2,  lettre: 'ح', nom: 'حَاء',    translit: 'Haa',     son: 'ḥ',     audio: 'audio/lettres/lettre_06_haa.mp3',     prioritaire: true,  color: LETTER_COLORS[1] },
  { id: 3,  lettre: 'د', nom: 'دَال',    translit: 'Daal',    son: 'd',     audio: 'audio/lettres/lettre_08_daal.mp3',    prioritaire: true,  color: LETTER_COLORS[2] },
  { id: 4,  lettre: 'ر', nom: 'رَاء',    translit: 'Raa',     son: 'r',     audio: 'audio/lettres/lettre_10_raa.mp3',     prioritaire: true,  color: LETTER_COLORS[3] },
  { id: 5,  lettre: 'س', nom: 'سِين',    translit: 'Siin',    son: 's',     audio: 'audio/lettres/lettre_12_siin.mp3',    prioritaire: true,  color: LETTER_COLORS[4] },
  { id: 6,  lettre: 'ص', nom: 'صَاد',    translit: 'Saad',    son: 'ṣ',     audio: 'audio/lettres/lettre_14_saad.mp3',    prioritaire: true,  color: LETTER_COLORS[5] },
  { id: 7,  lettre: 'ط', nom: 'طَاء',    translit: 'Taa',     son: 'ṭ',     audio: 'audio/lettres/lettre_16_taa.mp3',     prioritaire: true,  color: LETTER_COLORS[6] },
  { id: 8,  lettre: 'ع', nom: 'عَيْن',   translit: "'Ayn",    son: 'ʿ',     audio: 'audio/lettres/lettre_18_ayn.mp3',     prioritaire: true,  color: LETTER_COLORS[7] },
  { id: 9,  lettre: 'ل', nom: 'لَام',    translit: 'Laam',    son: 'l',     audio: 'audio/lettres/lettre_23_laam.mp3',    prioritaire: true,  color: LETTER_COLORS[8] },
  { id: 10, lettre: 'م', nom: 'مِيم',    translit: 'Miim',    son: 'm',     audio: 'audio/lettres/lettre_24_miim.mp3',    prioritaire: true,  color: LETTER_COLORS[9] },
  { id: 11, lettre: 'و', nom: 'وَاو',    translit: 'Waaw',    son: 'w',     audio: 'audio/lettres/lettre_27_waaw.mp3',    prioritaire: true,  color: LETTER_COLORS[10] },
  { id: 12, lettre: 'ه', nom: 'هَاء',    translit: 'Haa',     son: 'h',     audio: 'audio/lettres/lettre_26_ha.mp3',      prioritaire: true,  color: LETTER_COLORS[11] },

  // 16 lettres restantes (avec points)
  { id: 13, lettre: 'ب', nom: 'بَاء',    translit: 'Baa',     son: 'b',     audio: 'audio/lettres/lettre_02_baa.mp3',     prioritaire: false, color: LETTER_COLORS[12] },
  { id: 14, lettre: 'ت', nom: 'تَاء',    translit: 'Ta',      son: 't',     audio: 'audio/lettres/lettre_03_ta.mp3',      prioritaire: false, color: LETTER_COLORS[13] },
  { id: 15, lettre: 'ث', nom: 'ثَاء',    translit: 'Tha',     son: 'th',    audio: 'audio/lettres/lettre_04_tha.mp3',     prioritaire: false, color: LETTER_COLORS[14] },
  { id: 16, lettre: 'ج', nom: 'جِيم',    translit: 'Jim',     son: 'j',     audio: 'audio/lettres/lettre_05_jim.mp3',     prioritaire: false, color: LETTER_COLORS[15] },
  { id: 17, lettre: 'خ', nom: 'خَاء',    translit: 'Kha',     son: 'kh',    audio: 'audio/lettres/lettre_07_kha.mp3',     prioritaire: false, color: LETTER_COLORS[16] },
  { id: 18, lettre: 'ذ', nom: 'ذَال',    translit: 'Dhal',    son: 'dh',    audio: 'audio/lettres/lettre_09_dhal.mp3',    prioritaire: false, color: LETTER_COLORS[17] },
  { id: 19, lettre: 'ز', nom: 'زَاي',    translit: 'Zay',     son: 'z',     audio: 'audio/lettres/lettre_11_zay.mp3',     prioritaire: false, color: LETTER_COLORS[18] },
  { id: 20, lettre: 'ش', nom: 'شِين',    translit: 'Shin',    son: 'sh',    audio: 'audio/lettres/lettre_13_shin.mp3',    prioritaire: false, color: LETTER_COLORS[19] },
  { id: 21, lettre: 'ض', nom: 'ضَاد',    translit: 'Daad',    son: 'ḍ',     audio: 'audio/lettres/lettre_15_daad.mp3',    prioritaire: false, color: LETTER_COLORS[20] },
  { id: 22, lettre: 'ظ', nom: 'ظَاء',    translit: 'Zaa',     son: 'ẓ',     audio: 'audio/lettres/lettre_17_zaa.mp3',     prioritaire: false, color: LETTER_COLORS[21] },
  { id: 23, lettre: 'غ', nom: 'غَيْن',   translit: 'Ghayn',   son: 'gh',    audio: 'audio/lettres/lettre_19_ghayn.mp3',   prioritaire: false, color: LETTER_COLORS[22] },
  { id: 24, lettre: 'ف', nom: 'فَاء',    translit: 'Faa',     son: 'f',     audio: 'audio/lettres/lettre_20_faa.mp3',     prioritaire: false, color: LETTER_COLORS[23] },
  { id: 25, lettre: 'ق', nom: 'قَاف',    translit: 'Qaf',     son: 'q',     audio: 'audio/lettres/lettre_21_qaf.mp3',     prioritaire: false, color: LETTER_COLORS[24] },
  { id: 26, lettre: 'ك', nom: 'كَاف',    translit: 'Kaaf',    son: 'k',     audio: 'audio/lettres/lettre_22_kaaf.mp3',    prioritaire: false, color: LETTER_COLORS[25] },
  { id: 27, lettre: 'ن', nom: 'نُون',    translit: 'Nun',     son: 'n',     audio: 'audio/lettres/lettre_25_nun.mp3',     prioritaire: false, color: LETTER_COLORS[26] },
  { id: 28, lettre: 'ي', nom: 'يَاء',    translit: 'Ya',      son: 'y',     audio: 'audio/lettres/lettre_28_ya.mp3',      prioritaire: false, color: LETTER_COLORS[27] },
]

export const lettresPrioritaires = alphabet.filter(l => l.prioritaire)
export const getLettreById = (id) => alphabet.find(l => l.id === id)

// Données pour l'exercice Syllabes — Référentiel Année 1
// Consonne + voyelle courte (حَرَكَة) → syllabe

export const voyelles = [
  { id: 'fatha',  symbole: 'ـَ', nom: 'فَتْحَة', son: 'a',  color: '#f97316', description: '« a » court — comme dans « patte »' },
  { id: 'kasra',  symbole: 'ـِ', nom: 'كَسْرَة', son: 'i',  color: '#3b82f6', description: '« i » court — comme dans « vite »' },
  { id: 'damma',  symbole: 'ـُ', nom: 'ضَمَّة',  son: 'u',  color: '#22c55e', description: '« u » court — comme dans « pull »' },
]

// Les 12 lettres prioritaires avec leurs syllabes
export const syllabesData = [
  {
    lettreId: 1, lettre: 'ا', translit: 'Alif',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'أَ', son: 'a',  tts: 'أَ',  audio: 'audio/syllabes/alif_fatha.mp3'  },
      { voyelle: 'kasra', syllabe: 'إِ', son: 'i',  tts: 'إِ',  audio: 'audio/syllabes/alif_kasra.mp3'  },
      { voyelle: 'damma', syllabe: 'أُ', son: 'u',  tts: 'أُ',  audio: 'audio/syllabes/alif_damma.mp3'  },
    ]
  },
  {
    lettreId: 2, lettre: 'ح', translit: 'Haa',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'حَ', son: 'ḥa',  tts: 'حَ', audio: 'audio/syllabes/haa_fatha.mp3'  },
      { voyelle: 'kasra', syllabe: 'حِ', son: 'ḥi',  tts: 'حِ', audio: 'audio/syllabes/haa_kasra.mp3'  },
      { voyelle: 'damma', syllabe: 'حُ', son: 'ḥu',  tts: 'حُ', audio: 'audio/syllabes/haa_damma.mp3'  },
    ]
  },
  {
    lettreId: 3, lettre: 'د', translit: 'Daal',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'دَ', son: 'da',  tts: 'دَ', audio: 'audio/syllabes/daal_fatha.mp3' },
      { voyelle: 'kasra', syllabe: 'دِ', son: 'di',  tts: 'دِ', audio: 'audio/syllabes/daal_kasra.mp3' },
      { voyelle: 'damma', syllabe: 'دُ', son: 'du',  tts: 'دُ', audio: 'audio/syllabes/daal_damma.mp3' },
    ]
  },
  {
    lettreId: 4, lettre: 'ر', translit: 'Raa',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'رَ', son: 'ra',  tts: 'رَ', audio: 'audio/syllabes/raa_fatha.mp3'  },
      { voyelle: 'kasra', syllabe: 'رِ', son: 'ri',  tts: 'رِ', audio: 'audio/syllabes/raa_kasra.mp3'  },
      { voyelle: 'damma', syllabe: 'رُ', son: 'ru',  tts: 'رُ', audio: 'audio/syllabes/raa_damma.mp3'  },
    ]
  },
  {
    lettreId: 5, lettre: 'س', translit: 'Siin',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'سَ', son: 'sa',  tts: 'سَ', audio: 'audio/syllabes/siin_fatha.mp3' },
      { voyelle: 'kasra', syllabe: 'سِ', son: 'si',  tts: 'سِ', audio: 'audio/syllabes/siin_kasra.mp3' },
      { voyelle: 'damma', syllabe: 'سُ', son: 'su',  tts: 'سُ', audio: 'audio/syllabes/siin_damma.mp3' },
    ]
  },
  {
    lettreId: 6, lettre: 'ص', translit: 'Saad',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'صَ', son: 'ṣa', tts: 'صَ', audio: 'audio/syllabes/saad_fatha.mp3' },
      { voyelle: 'kasra', syllabe: 'صِ', son: 'ṣi', tts: 'صِ', audio: 'audio/syllabes/saad_kasra.mp3' },
      { voyelle: 'damma', syllabe: 'صُ', son: 'ṣu', tts: 'صُ', audio: 'audio/syllabes/saad_damma.mp3' },
    ]
  },
  {
    lettreId: 7, lettre: 'ط', translit: 'Taa',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'طَ', son: 'ṭa', tts: 'طَ', audio: 'audio/syllabes/taa_fatha.mp3'  },
      { voyelle: 'kasra', syllabe: 'طِ', son: 'ṭi', tts: 'طِ', audio: 'audio/syllabes/taa_kasra.mp3'  },
      { voyelle: 'damma', syllabe: 'طُ', son: 'ṭu', tts: 'طُ', audio: 'audio/syllabes/taa_damma.mp3'  },
    ]
  },
  {
    lettreId: 8, lettre: 'ع', translit: "'Ayn",
    syllabes: [
      { voyelle: 'fatha', syllabe: 'عَ', son: 'ʿa', tts: 'عَ', audio: 'audio/syllabes/ayn_fatha.mp3'  },
      { voyelle: 'kasra', syllabe: 'عِ', son: 'ʿi', tts: 'عِ', audio: 'audio/syllabes/ayn_kasra.mp3'  },
      { voyelle: 'damma', syllabe: 'عُ', son: 'ʿu', tts: 'عُ', audio: 'audio/syllabes/ayn_damma.mp3'  },
    ]
  },
  {
    lettreId: 9, lettre: 'ل', translit: 'Laam',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'لَ', son: 'la', tts: 'لَ', audio: 'audio/syllabes/laam_fatha.mp3' },
      { voyelle: 'kasra', syllabe: 'لِ', son: 'li', tts: 'لِ', audio: 'audio/syllabes/laam_kasra.mp3' },
      { voyelle: 'damma', syllabe: 'لُ', son: 'lu', tts: 'لُ', audio: 'audio/syllabes/laam_damma.mp3' },
    ]
  },
  {
    lettreId: 10, lettre: 'م', translit: 'Miim',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'مَ', son: 'ma', tts: 'مَ', audio: 'audio/syllabes/miim_fatha.mp3' },
      { voyelle: 'kasra', syllabe: 'مِ', son: 'mi', tts: 'مِ', audio: 'audio/syllabes/miim_kasra.mp3' },
      { voyelle: 'damma', syllabe: 'مُ', son: 'mu', tts: 'مُ', audio: 'audio/syllabes/miim_damma.mp3' },
    ]
  },
  {
    lettreId: 11, lettre: 'و', translit: 'Waaw',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'وَ', son: 'wa', tts: 'وَ', audio: 'audio/syllabes/waaw_fatha.mp3' },
      { voyelle: 'kasra', syllabe: 'وِ', son: 'wi', tts: 'وِ', audio: 'audio/syllabes/waaw_kasra.mp3' },
      { voyelle: 'damma', syllabe: 'وُ', son: 'wu', tts: 'وُ', audio: 'audio/syllabes/waaw_damma.mp3' },
    ]
  },
  {
    lettreId: 12, lettre: 'ه', translit: 'Haa',
    syllabes: [
      { voyelle: 'fatha', syllabe: 'هَ', son: 'ha', tts: 'هَ', audio: 'audio/syllabes/ha_fatha.mp3'   },
      { voyelle: 'kasra', syllabe: 'هِ', son: 'hi', tts: 'هِ', audio: 'audio/syllabes/ha_kasra.mp3'   },
      { voyelle: 'damma', syllabe: 'هُ', son: 'hu', tts: 'هُ', audio: 'audio/syllabes/ha_damma.mp3'   },
    ]
  },
]

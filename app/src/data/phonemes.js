// 6 paires de phonemes critiques a distinguer
// Source : Referentiel Annee 1

export const phonemes = [
  {
    id: 1,
    lettre1: { caractere: '\u062D', nom: 'Haa', type: 'Pharyngal' },
    lettre2: { caractere: '\u0647\u0640', nom: 'Ha', type: 'Glottal' },
    difficulte: 2,
    audio: 'audio/phonemes/phoneme_01_haa_vs_ha.mp3',
    astuce: 'Le son profond dans la gorge vs expiration legere',
    emoji: '\uD83E\uDEC1',
  },
  {
    id: 2,
    lettre1: { caractere: '\u0639', nom: 'Ayn', type: 'Pharyngal' },
    lettre2: { caractere: '\u0623', nom: 'Alif', type: 'Coup de glotte' },
    difficulte: 3,
    audio: 'audio/phonemes/phoneme_02_ayn_vs_alif.mp3',
    astuce: 'Constriction de la gorge vs son A normal',
    emoji: '\uD83D\uDC42',
  },
  {
    id: 3,
    lettre1: { caractere: '\u0635', nom: 'Saad', type: 'Emphatique' },
    lettre2: { caractere: '\u0633', nom: 'Siin', type: 'Simple' },
    difficulte: 1,
    audio: 'audio/phonemes/phoneme_03_saad_vs_siin.mp3',
    astuce: 'Bouche arrondie son grave vs son S francais',
    emoji: '\uD83D\uDD0A',
  },
  {
    id: 4,
    lettre1: { caractere: '\u0636', nom: 'Daad', type: 'Emphatique' },
    lettre2: { caractere: '\u062F', nom: 'Daal', type: 'Simple' },
    difficulte: 2,
    audio: 'audio/phonemes/phoneme_04_daad_vs_daal.mp3',
    astuce: 'D lourd et profond vs D normal',
    emoji: '\uD83D\uDCAA',
  },
  {
    id: 5,
    lettre1: { caractere: '\u0637', nom: 'Taa', type: 'Emphatique' },
    lettre2: { caractere: '\u062A', nom: 'Ta', type: 'Simple' },
    difficulte: 2,
    audio: 'audio/phonemes/phoneme_05_taa_vs_ta.mp3',
    astuce: 'T profond vs T normal',
    emoji: '\uD83C\uDFAF',
  },
  {
    id: 6,
    lettre1: { caractere: '\u0642', nom: 'Qaf', type: 'Uvulaire' },
    lettre2: { caractere: '\u0643', nom: 'Kaaf', type: 'Velaire' },
    difficulte: 3,
    audio: 'audio/phonemes/phoneme_06_qaf_vs_kaaf.mp3',
    astuce: 'Gorge arriere tres profonde vs K normal',
    emoji: '\uD83D\uDDE3\uFE0F',
  },
]

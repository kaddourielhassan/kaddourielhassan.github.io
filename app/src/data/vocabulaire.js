// Vocabulaire complet — ~100 mots — Référentiel Année 1

const rawCategories = [
  {
    id: 'couleurs', nom: 'Les couleurs', nomAr: 'الأَلْوَان', emoji: '🎨',
    mots: [
      { fr: 'Rouge', ar: 'أَحْمَر', translit: 'Aḥmar', audio: 'audio/vocabulaire/mot_01_ahmar.mp3' },
      { fr: 'Bleu', ar: 'أَزْرَق', translit: 'Azraq', audio: 'audio/vocabulaire/mot_02_azraq.mp3' },
      { fr: 'Vert', ar: 'أَخْضَر', translit: 'Akhḍar', audio: 'audio/vocabulaire/mot_03_akhdar.mp3' },
      { fr: 'Jaune', ar: 'أَصْفَر', translit: 'Aṣfar', audio: 'audio/vocabulaire/mot_04_asfar.mp3' },
      { fr: 'Blanc', ar: 'أَبْيَض', translit: 'Abyaḍ', audio: 'audio/vocabulaire/mot_05_abyad.mp3' },
      { fr: 'Noir', ar: 'أَسْوَد', translit: 'Aswad', audio: 'audio/vocabulaire/mot_06_aswad.mp3' },
      { fr: 'Orange', ar: 'بُرْتُقَالِي', translit: 'Burtuqālī', audio: 'audio/vocabulaire/mot_07_burtuqali.mp3' },
      { fr: 'Rose', ar: 'وَرْدِي', translit: 'Wardī', audio: 'audio/vocabulaire/mot_08_wardi.mp3' },
    ]
  },
  {
    id: 'nombres', nom: 'Les nombres', nomAr: 'الأَرْقَام', emoji: '🔢',
    mots: [
      { fr: '1', ar: 'وَاحِد', translit: 'Wāḥid' }, { fr: '2', ar: 'اِثْنَان', translit: 'Ithnān' },
      { fr: '3', ar: 'ثَلَاثَة', translit: 'Thalātha' }, { fr: '4', ar: 'أَرْبَعَة', translit: "Arba'a" },
      { fr: '5', ar: 'خَمْسَة', translit: 'Khamsa' }, { fr: '6', ar: 'سِتَّة', translit: 'Sitta' },
      { fr: '7', ar: 'سَبْعَة', translit: "Sab'a" }, { fr: '8', ar: 'ثَمَانِيَة', translit: 'Thamāniya' },
      { fr: '9', ar: 'تِسْعَة', translit: "Tis'a" }, { fr: '10', ar: 'عَشَرَة', translit: "'Ashara" },
    ]
  },
  {
    id: 'salutations', nom: 'Salutations', nomAr: 'التَّحِيَّات', emoji: '👋',
    mots: [
      { fr: 'Que la paix soit sur vous', ar: 'السَّلَامُ عَلَيْكُمْ', translit: 'As-salāmu alaykum' },
      { fr: 'Et sur vous la paix', ar: 'وَعَلَيْكُمُ السَّلَام', translit: "Wa 'alaykumu as-salām" },
      { fr: 'Bonjour (matin)', ar: 'صَبَاحُ الخَيْر', translit: 'Ṣabāḥu al-khayr' },
      { fr: 'Bonsoir', ar: 'مَسَاءُ الخَيْر', translit: "Masa'u al-khayr" },
      { fr: 'Au revoir', ar: 'مَعَ السَّلَامَة', translit: "Ma'a as-salāma" },
      { fr: 'Merci', ar: 'شُكْرًا', translit: 'Shukran' },
      { fr: 'De rien', ar: 'عَفْوًا', translit: "'Afwan" },
      { fr: 'Comment vas-tu ?', ar: 'كَيْفَ حَالُكَ؟', translit: 'Kayfa ḥāluka?' },
    ]
  },
  {
    id: 'classe', nom: 'Objets de la classe', nomAr: 'أَدَوَاتُ الفَصْل', emoji: '📚',
    mots: [
      { fr: 'Livre', ar: 'كِتَاب', translit: 'Kitāb', audio: 'audio/vocabulaire/mot_09_kitab.mp3' },
      { fr: 'Crayon', ar: 'قَلَم', translit: 'Qalam', audio: 'audio/vocabulaire/mot_10_qalam.mp3' },
      { fr: 'Table', ar: 'طَاوِلَة', translit: 'Ṭāwila', audio: 'audio/vocabulaire/mot_11_tawila.mp3' },
      { fr: 'Chaise', ar: 'كُرْسِي', translit: 'Kursī', audio: 'audio/vocabulaire/mot_12_kursi.mp3' },
      { fr: 'Cahier', ar: 'دَفْتَر', translit: 'Daftar' },
      { fr: 'Tableau', ar: 'سَبُّورَة', translit: 'Sabbūra' },
      { fr: 'Sac', ar: 'حَقِيبَة', translit: 'Ḥaqība' },
      { fr: 'Gomme', ar: 'مِمْحَاة', translit: 'Mimḥāt' },
      { fr: 'Règle', ar: 'مِسْطَرَة', translit: 'Misṭara' },
      { fr: 'Feuille', ar: 'وَرَقَة', translit: 'Waraqa' },
    ]
  },
  {
    id: 'animaux', nom: 'Les animaux', nomAr: 'الحَيَوَانَات', emoji: '🐱',
    mots: [
      { fr: 'Chat', ar: 'قِطّ', translit: 'Qiṭṭ' }, { fr: 'Chien', ar: 'كَلْب', translit: 'Kalb' },
      { fr: 'Oiseau', ar: 'طَائِر', translit: "Ta'ir" }, { fr: 'Poisson', ar: 'سَمَك', translit: 'Samak' },
      { fr: 'Lapin', ar: 'أَرْنَب', translit: 'Arnab' }, { fr: 'Poule', ar: 'دَجَاجَة', translit: 'Dajāja' },
    ]
  },
  {
    id: 'famille', nom: 'La famille', nomAr: 'العَائِلَة', emoji: '👨‍👩‍👧‍👦',
    mots: [
      { fr: 'Papa', ar: 'بَابَا / أَب', translit: 'Bābā' }, { fr: 'Maman', ar: 'مَامَا / أُمّ', translit: 'Māmā' },
      { fr: 'Frère', ar: 'أَخ', translit: 'Akh' }, { fr: 'Sœur', ar: 'أُخْت', translit: 'Ukht' },
      { fr: 'Grand-père', ar: 'جَدّ', translit: 'Jadd' }, { fr: 'Grand-mère', ar: 'جَدَّة', translit: 'Jadda' },
    ]
  },
  {
    id: 'emotions', nom: 'Les émotions', nomAr: 'المَشَاعِر', emoji: '😊',
    mots: [
      { fr: 'Content', ar: 'سَعِيد', translit: "Sa'īd" },
      { fr: 'Triste', ar: 'حَزِين', translit: 'Ḥazīn' },
      { fr: 'En colère', ar: 'غَاضِب', translit: 'Ghāḍib' },
    ]
  },
  {
    id: 'corps', nom: 'Le corps', nomAr: 'جِسْمُ الإِنْسَان', emoji: '🧍',
    mots: [
      { fr: 'Tête', ar: 'رَأْس', translit: "Ra's" }, { fr: 'Main', ar: 'يَد', translit: 'Yad' },
      { fr: 'Pied', ar: 'رِجْل', translit: 'Rijl' }, { fr: 'Œil', ar: 'عَيْن', translit: "'Ayn" },
      { fr: 'Bouche', ar: 'فَم', translit: 'Fam' },
    ]
  },
  {
    id: 'nourriture', nom: 'La nourriture', nomAr: 'الطَّعَام', emoji: '🍎',
    mots: [
      { fr: 'Pain', ar: 'خُبْز', translit: 'Khubz', image: 'resources/images/vocabulaire/nourriture-1.png' }, 
      { fr: 'Eau', ar: 'مَاء', translit: "Mā'", image: 'resources/images/vocabulaire/nourriture-2.png' },
      { fr: 'Lait', ar: 'حَلِيب', translit: 'Ḥalīb', image: 'resources/images/vocabulaire/nourriture-3.png' }, 
      { fr: 'Pomme', ar: 'تُفَّاحَة', translit: 'Tuffāḥa', image: 'resources/images/vocabulaire/nourriture-4.png' },
      { fr: 'Banane', ar: 'مَوْزَة', translit: 'Mawza', image: 'resources/images/vocabulaire/nourriture-5.png' }, 
      { fr: 'Jus', ar: 'عَصِير', translit: "'Aṣīr" },
      { fr: 'Gâteau', ar: 'كَعْكَة', translit: "Ka'ka" }, { fr: 'Bonbon', ar: 'حَلْوَى', translit: 'Ḥalwā' },
    ]
  },
  {
    id: 'consignes', nom: 'Consignes de classe', nomAr: 'تَعْلِيمَات', emoji: '📣',
    mots: [
      { fr: 'Assieds-toi', ar: 'اِجْلِسْ', translit: 'Ijlis' },
      { fr: 'Lève-toi', ar: 'قِفْ', translit: 'Qif' },
      { fr: 'Regarde', ar: 'اُنْظُرْ', translit: 'Unẓur' },
      { fr: 'Écoute', ar: 'اِسْتَمِعْ', translit: "Istami'" },
      { fr: 'Bravo !', ar: 'أَحْسَنْتَ', translit: 'Aḥsanta' },
    ]
  },
  {
    id: 'religieux', nom: 'Vocabulaire religieux', nomAr: 'مُفْرَدَات دِينِيَّة', emoji: '🕌',
    mots: [
      { fr: 'Au nom de Dieu', ar: 'بِسْمِ الله', translit: 'Bismillāh' },
      { fr: 'Louange à Dieu', ar: 'الحَمْدُ لِله', translit: 'Al-ḥamdu lillāh' },
      { fr: 'Si Dieu le veut', ar: 'إِنْ شَاءَ الله', translit: "In sha'a Allah" },
    ]
  },
  {
    id: 'outils', nom: 'Mots outils', nomAr: 'كَلِمَات أَسَاسِيَّة', emoji: '🔧',
    mots: [
      { fr: 'Oui', ar: 'نَعَمْ', translit: "Na'am" }, { fr: 'Non', ar: 'لَا', translit: 'Lā' },
      { fr: 'Et', ar: 'وَ', translit: 'Wa' }, { fr: 'Moi / Je', ar: 'أَنَا', translit: 'Anā' },
      { fr: 'Toi (m)', ar: 'أَنْتَ', translit: 'Anta' }, { fr: 'Toi (f)', ar: 'أَنْتِ', translit: 'Anti' },
      { fr: 'Voici (m)', ar: 'هَذَا', translit: 'Hādhā' }, { fr: 'Voici (f)', ar: 'هَذِهِ', translit: 'Hādhihi' },
      { fr: 'Où ?', ar: 'أَيْنَ', translit: 'Ayna' }, { fr: 'Quoi ?', ar: 'مَاذَا', translit: 'Mādhā' },
    ]
  },
]

export const categories = rawCategories.map((cat) => ({
  ...cat,
  mots: cat.mots.map((mot, index) => ({
    ...mot,
    // Every vocabulary entry exposes both image and audio paths.
    image: mot.image || `resources/images/vocabulaire/${cat.id}-${index + 1}.webp`,
    audio: mot.audio || `resources/audio/vocabulaire/${cat.id}-${index + 1}.mp3`,
  })),
}))

export const getAllMots = () => categories.flatMap(c => c.mots.map(m => ({ ...m, categorie: c.id })))
export const getMotsParCategorie = (catId) => categories.find(c => c.id === catId)?.mots || []

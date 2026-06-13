// Vocabulaire complet — ~100 mots — Référentiel Année 1
// v2: chemins audio unifiés vers /resources/audio/vocabulaire/${cat.id}-${index+1}.mp3

const rawCategories = [
  {
    id: 'couleurs', nom: 'Les couleurs', nomAr: 'الأَلْوَان', emoji: '🎨',
    mots: [
      { fr: 'Rouge',  ar: 'أَحْمَر',      translit: 'Aḥmar',     hex: '#ef4444' },
      { fr: 'Bleu',   ar: 'أَزْرَق',      translit: 'Azraq',     hex: '#3b82f6' },
      { fr: 'Vert',   ar: 'أَخْضَر',      translit: 'Akhḍar',    hex: '#10b981' },
      { fr: 'Jaune',  ar: 'أَصْفَر',      translit: 'Aṣfar',     hex: '#eab308' },
      { fr: 'Blanc',  ar: 'أَبْيَض',      translit: 'Abyaḍ',     hex: '#f8fafc' },
      { fr: 'Noir',   ar: 'أَسْوَد',      translit: 'Aswad',     hex: '#1e293b' },
      { fr: 'Orange', ar: 'بُرْتُقَالِي', translit: 'Burtuqālī', hex: '#f97316' },
      { fr: 'Rose',   ar: 'وَرْدِي',      translit: 'Wardī',     hex: '#ec4899' },
    ]
  },
  {
    id: 'nombres', nom: 'Les nombres', nomAr: 'الأَرْقَام', emoji: '🔢',
    mots: [
      { fr: '1',  ar: 'وَاحِد',   tts: 'وَاحِد',   translit: 'Wāḥid'    },
      { fr: '2',  ar: 'اِثْنَان',  tts: 'اِثْنَان',  translit: 'Ithnān'   },
      { fr: '3',  ar: 'ثَلَاثَة', tts: 'ثَلَاثَة', translit: 'Thalātha' },
      { fr: '4',  ar: 'أَرْبَعَة', tts: 'أَرْبَعَة', translit: "Arba'a"  },
      { fr: '5',  ar: 'خَمْسَة',  tts: 'خَمْسَة',  translit: 'Khamsa'   },
      { fr: '6',  ar: 'سِتَّة',   tts: 'سِتَّة',   translit: 'Sitta'    },
      { fr: '7',  ar: 'سَبْعَة',  tts: 'سَبْعَة',  translit: "Sab'a"    },
      { fr: '8',  ar: 'ثَمَانِيَة',tts: 'ثَمَانِيَة',translit: 'Thamāniya'},
      { fr: '9',  ar: 'تِسْعَة',  tts: 'تِسْعَة',  translit: "Tis'a"    },
      { fr: '10', ar: 'عَشَرَة',  tts: 'عَشَرَة',  translit: "'Ashara"  },
    ]
  },
  {
    id: 'salutations', nom: 'Salutations', nomAr: 'التَّحِيَّات', emoji: '👋',
    mots: [
      { fr: 'Que la paix soit sur vous', ar: 'السَّلَامُ عَلَيْكُمْ',  translit: 'As-salāmu alaykum'      },
      { fr: 'Et sur vous la paix',       ar: 'وَعَلَيْكُمُ السَّلَام', translit: "Wa 'alaykumu as-salām" },
      { fr: 'Bonjour (matin)',           ar: 'صَبَاحُ الخَيْر',        translit: 'Ṣabāḥu al-khayr'       },
      { fr: 'Bonsoir',                   ar: 'مَسَاءُ الخَيْر',        translit: "Masa'u al-khayr"        },
      { fr: 'Au revoir',                 ar: 'مَعَ السَّلَامَة',       translit: "Ma'a as-salāma"         },
      { fr: 'Merci',                     ar: 'شُكْرًا',                translit: 'Shukran'                },
      { fr: 'De rien',                   ar: 'عَفْوًا',                translit: "'Afwan"                 },
      { fr: 'Comment vas-tu ?',          ar: 'كَيْفَ حَالُكَ؟',        translit: 'Kayfa ḥāluka?'          },
    ]
  },
  {
    id: 'classe', nom: 'Objets de la classe', nomAr: 'أَدَوَاتُ الفَصْل', emoji: '📚',
    mots: [
      { fr: 'Livre',  ar: 'كِتَاب',   translit: 'Kitāb',   image: '/resources/images/vocabulaire/classe-1.webp' },
      { fr: 'Crayon', ar: 'قَلَم',    translit: 'Qalam',   image: '/resources/images/vocabulaire/classe-2.webp' },
      { fr: 'Table',  ar: 'طَاوِلَة', translit: 'Ṭāwila',  image: '/resources/images/vocabulaire/classe-3.webp' },
      { fr: 'Chaise', ar: 'كُرْسِي',  translit: 'Kursī',   image: '/resources/images/vocabulaire/classe-4.webp' },
      { fr: 'Cahier', ar: 'دَفْتَر',  translit: 'Daftar',  image: '/resources/images/vocabulaire/classe-5.webp' },
      { fr: 'Tableau',ar: 'سَبُّورَة',translit: 'Sabbūra', image: '/resources/images/vocabulaire/classe-6.webp' },
      { fr: 'Sac',    ar: 'حَقِيبَة', translit: 'Ḥaqība',  image: '/resources/images/vocabulaire/classe-7.webp' },
      { fr: 'Gomme',  ar: 'مِمْحَاة', translit: 'Mimḥāt',  image: '/resources/images/vocabulaire/classe-8.webp' },
      { fr: 'Règle',  ar: 'مِسْطَرَة',translit: 'Misṭara', image: '/resources/images/vocabulaire/classe-9.webp' },
      { fr: 'Feuille',ar: 'وَرَقَة',  translit: 'Waraqa',  image: '/resources/images/vocabulaire/classe-10.webp'},
    ]
  },
  {
    id: 'animaux', nom: 'Les animaux', nomAr: 'الحَيَوَانَات', emoji: '🐱',
    mots: [
      { fr: 'Chat',   ar: 'قِطّ',     tts: 'قِطٌّ',   translit: 'Qiṭṭ',   image: '/resources/images/vocabulaire/animaux-1.webp' },
      { fr: 'Chien',  ar: 'كَلْب',    translit: 'Kalb',                    image: '/resources/images/vocabulaire/animaux-2.webp' },
      { fr: 'Oiseau', ar: 'طَائِر',   translit: "Ṭā'ir",                  image: '/resources/images/vocabulaire/animaux-3.webp' },
      { fr: 'Poisson',ar: 'سَمَك',    translit: 'Samak',                   image: '/resources/images/vocabulaire/animaux-4.webp' },
      { fr: 'Lapin',  ar: 'أَرْنَب',  translit: 'Arnab',                   image: '/resources/images/vocabulaire/animaux-5.webp' },
      { fr: 'Poule',  ar: 'دَجَاجَة', translit: 'Dajāja',                  image: '/resources/images/vocabulaire/animaux-6.webp' },
    ]
  },
  {
    id: 'famille', nom: 'La famille', nomAr: 'العَائِلَة', emoji: '👨‍👩‍👧‍👦',
    mots: [
      { fr: 'Papa',       ar: 'بَابَا / أَب', translit: 'Bābā',  image: '/resources/images/vocabulaire/famille-1.webp' },
      { fr: 'Maman',      ar: 'مَامَا / أُمّ', translit: 'Māmā',  image: '/resources/images/vocabulaire/famille-2.png'  },
      { fr: 'Frère',      ar: 'أَخ',           translit: 'Akh',   image: '/resources/images/vocabulaire/famille-3.png'  },
      { fr: 'Sœur',       ar: 'أُخْت',         translit: 'Ukht',  image: '/resources/images/vocabulaire/famille-4.png'  },
      { fr: 'Grand-père', ar: 'جَدّ',   tts: 'جَدْ',     translit: 'Jadd',  image: '/resources/images/vocabulaire/famille-5.png'  },
      { fr: 'Grand-mère', ar: 'جَدَّة', tts: 'جَدَّةٌ',  translit: 'Jadda', image: '/resources/images/vocabulaire/famille-6.png'  },
    ]
  },
  {
    id: 'emotions', nom: 'Les émotions', nomAr: 'المَشَاعِر', emoji: '😊',
    mots: [
      { fr: 'Content',    ar: 'سَعِيد',  translit: "Sa'īd"  },
      { fr: 'Triste',     ar: 'حَزِين',  translit: 'Ḥazīn'  },
      { fr: 'En colère',  ar: 'غَاضِب',  translit: 'Ghāḍib' },
    ]
  },
  {
    id: 'corps', nom: 'Le corps', nomAr: 'جِسْمُ الإِنْسَان', emoji: '🧍',
    mots: [
      { fr: 'Tête',   ar: 'رَأْس', translit: "Ra's", image: '/resources/images/vocabulaire/corps-1.svg' },
      { fr: 'Main',   ar: 'يَد',   translit: 'Yad',  image: '/resources/images/vocabulaire/corps-2.svg' },
      { fr: 'Pied',   ar: 'رِجْل', translit: 'Rijl', image: '/resources/images/vocabulaire/corps-3.svg' },
      { fr: 'Œil',    ar: 'عَيْن', translit: "'Ayn", image: '/resources/images/vocabulaire/corps-4.svg' },
      { fr: 'Bouche', ar: 'فَم',   translit: 'Fam',  image: '/resources/images/vocabulaire/corps-5.svg' },
    ]
  },
  {
    id: 'nourriture', nom: 'La nourriture', nomAr: 'الطَّعَام', emoji: '🍎',
    mots: [
      { fr: 'Pain',    ar: 'خُبْز',    translit: 'Khubz',    image: '/resources/images/vocabulaire/nourriture-1.png' },
      { fr: 'Eau',     ar: 'مَاء',     translit: "Mā'",      image: '/resources/images/vocabulaire/nourriture-2.png' },
      { fr: 'Lait',    ar: 'حَلِيب',   translit: 'Ḥalīb',    image: '/resources/images/vocabulaire/nourriture-3.png' },
      { fr: 'Pomme',   ar: 'تُفَّاحَة',translit: 'Tuffāḥa',  image: '/resources/images/vocabulaire/nourriture-4.png' },
      { fr: 'Banane',  ar: 'مَوْزَة',  translit: 'Mawza',    image: '/resources/images/vocabulaire/nourriture-5.png' },
      { fr: 'Jus',     ar: 'عَصِير',   translit: "'Aṣīr",    image: '/resources/images/vocabulaire/nourriture-6.svg' },
      { fr: 'Gâteau',  ar: 'كَعْكَة',  translit: "Ka'ka",    image: '/resources/images/vocabulaire/nourriture-7.svg' },
      { fr: 'Bonbon',  ar: 'حَلْوَى',  translit: 'Ḥalwā',    image: '/resources/images/vocabulaire/nourriture-8.svg' },
    ]
  },
  {
    id: 'consignes', nom: 'Consignes de classe', nomAr: 'تَعْلِيمَات', emoji: '📣',
    mots: [
      { fr: 'Assieds-toi', ar: 'اِجْلِسْ',  translit: 'Ijlis',    image: '/resources/images/vocabulaire/consignes-1.svg' },
      { fr: 'Lève-toi',    ar: 'قِفْ',       translit: 'Qif',      image: '/resources/images/vocabulaire/consignes-2.svg' },
      { fr: 'Regarde',     ar: 'اُنْظُرْ',   translit: 'Unẓur',    image: '/resources/images/vocabulaire/consignes-3.svg' },
      { fr: 'Écoute',      ar: 'اِسْتَمِعْ', translit: "Istami'",  image: '/resources/images/vocabulaire/consignes-4.svg' },
      { fr: 'Bravo !',     ar: 'أَحْسَنْتَ', translit: 'Aḥsanta',  image: '/resources/images/vocabulaire/consignes-5.svg' },
    ]
  },
  {
    // L4 — 6 mots complets (3 ajoutés : Allah, Mosquée, Prière)
    id: 'religieux', nom: 'Vocabulaire religieux', nomAr: 'مُفْرَدَات دِينِيَّة', emoji: '🕌',
    mots: [
      { fr: 'Dieu',            ar: 'اللَّه',         translit: 'Allāh',             image: '/resources/images/vocabulaire/religieux-1.svg' },
      { fr: 'Mosquée',         ar: 'مَسْجِد',        translit: 'Masjid',            image: '/resources/images/vocabulaire/religieux-2.svg' },
      { fr: 'Prière',          ar: 'صَلَاة',         translit: 'Ṣalāt',             image: '/resources/images/vocabulaire/religieux-3.svg' },
      { fr: 'Au nom de Dieu',  ar: 'بِسْمِ الله',    translit: 'Bismillāh'          },
      { fr: 'Louange à Dieu',  ar: 'الحَمْدُ لِله',  translit: 'Al-ḥamdu lillāh'   },
      { fr: 'Si Dieu le veut', ar: 'إِنْ شَاءَ الله',translit: "In sha'a Allah"    },
    ]
  },
  {
    id: 'outils', nom: 'Mots outils', nomAr: 'كَلِمَات أَسَاسِيَّة', emoji: '🔧',
    mots: [
      { fr: 'Oui',       ar: 'نَعَمْ',  translit: "Na'am"  },
      { fr: 'Non',       ar: 'لَا',     translit: 'Lā'     },
      { fr: 'Et',        ar: 'وَ',      translit: 'Wa'     },
      { fr: 'Moi / Je',  ar: 'أَنَا',   translit: 'Anā'    },
      { fr: 'Toi (m)',   ar: 'أَنْتَ',  translit: 'Anta'   },
      { fr: 'Toi (f)',   ar: 'أَنْتِ',  translit: 'Anti'   },
      { fr: 'Voici (m)', ar: 'هَذَا',   translit: 'Hādhā'  },
      { fr: 'Voici (f)', ar: 'هَذِهِ',  translit: 'Hādhihi'},
      { fr: 'Où ?',      ar: 'أَيْنَ',  translit: 'Ayna'   },
      { fr: 'Quoi ?',    ar: 'مَاذَا',  translit: 'Mādhā'  },
    ]
  },
]

export const categories = rawCategories.map((cat) => ({
  ...cat,
  mots: cat.mots.map((mot, index) => ({
    ...mot,
    image: mot.image || (cat.id === 'couleurs' || cat.id === 'nombres' || cat.id === 'outils' ? null : '/resources/images/placeholder-word.svg'),
    audio: mot.audio || `/resources/audio/vocabulaire/${cat.id}-${index + 1}.mp3`,
  })),
}))

export const getAllMots = () => categories.flatMap(c => c.mots.map(m => ({ ...m, categorie: c.id })))
export const getMotsParCategorie = (catId) => categories.find(c => c.id === catId)?.mots || []

/**
 * Scénarios de conversation — Année 1, pré-A1
 * Aligné sur le référentiel : 3 phases (S1-10, S11-20, S21-30)
 * 8 scénarios × 3 rounds = 24 échanges au total
 *
 * Niveaux curriculum :
 *  N1 → [1, 5]  Salutations + Couleurs        (trimestre 1)
 *  N2 → [2, 6]  Présentation + Famille         (trimestre 2)
 *  N3 → [3, 7]  Émotions + Chiffres
 *  N4 → [4, 8]  Dans la classe + Animaux       (trimestre 3)
 */

export const conversations = [

  // ── 1. SALUTATIONS ────────────────────────────────────────────────────────
  {
    id: 1,
    title: 'Salutations',
    titleAr: 'التَّحِيَّات',
    emoji: '👋',
    rounds: [
      {
        question: 'السَّلَامُ عَلَيْكُمْ!',
        questionFr: 'Que la paix soit sur vous !',
        questionAudio: 'resources/audio/conversations/salut_1.mp3',
        options: [
          { text: 'وَعَلَيْكُمُ السَّلَام', textFr: 'Et sur vous la paix', correct: true },
          { text: 'شُكْرًا',               textFr: 'Merci',               correct: false },
        ]
      },
      {
        question: 'صَبَاحُ الخَيْر!',
        questionFr: 'Bonjour (matin) !',
        questionAudio: 'resources/audio/conversations/matin_1.mp3',
        options: [
          { text: 'صَبَاحُ النُّور',   textFr: 'Bonjour (réponse)',  correct: true },
          { text: 'مَسَاءُ الخَيْر',   textFr: 'Bonsoir',            correct: false },
        ]
      },
      {
        question: 'مَسَاءُ الخَيْر!',
        questionFr: 'Bonsoir !',
        questionAudio: 'resources/audio/conversations/masaa_1.mp3',
        options: [
          { text: 'مَسَاءُ النُّور',   textFr: 'Bonsoir (réponse)',  correct: true },
          { text: 'صَبَاحُ النُّور',   textFr: 'Bonjour (réponse)',  correct: false },
        ]
      },
    ]
  },

  // ── 2. PRÉSENTATION ───────────────────────────────────────────────────────
  {
    id: 2,
    title: 'Présentation',
    titleAr: 'التَّعَارُف',
    emoji: '🤝',
    rounds: [
      {
        question: 'مَا اسْمُكَ؟',
        questionFr: 'Comment t\'appelles-tu ?',
        questionAudio: 'resources/audio/conversations/nom_1.mp3',
        options: [
          { text: 'اِسْمِي يَاسِين',  textFr: 'Je m\'appelle Yassine', correct: true },
          { text: 'أَنَا بِخَيْر',    textFr: 'Je vais bien',          correct: false },
        ]
      },
      {
        question: 'كَمْ عُمْرُكَ؟',
        questionFr: 'Quel âge as-tu ?',
        questionAudio: 'resources/audio/conversations/age_1.mp3',
        options: [
          { text: 'عُمْرِي سَبْعُ سَنَوَات', textFr: 'J\'ai sept ans',    correct: true },
          { text: 'اِسْمِي أَحْمَد',          textFr: 'Je m\'appelle Ahmed', correct: false },
        ]
      },
      {
        question: 'كَيْفَ حَالُكَ؟',
        questionFr: 'Comment vas-tu ?',
        questionAudio: 'resources/audio/conversations/hal_1.mp3',
        options: [
          { text: 'بِخَيْر، الحَمْدُ لِله', textFr: 'Bien, louange à Dieu', correct: true },
          { text: 'مَعَ السَّلَامَة',         textFr: 'Au revoir',             correct: false },
        ]
      },
    ]
  },

  // ── 3. LES ÉMOTIONS ───────────────────────────────────────────────────────
  {
    id: 3,
    title: 'Les Émotions',
    titleAr: 'المَشَاعِر',
    emoji: '😊',
    rounds: [
      {
        question: 'كَيْفَ حَالُكَ اليَوْم؟',
        questionFr: 'Comment vas-tu aujourd\'hui ?',
        questionAudio: 'resources/audio/conversations/mood_1.mp3',
        options: [
          { text: 'أَنَا سَعِيد',  textFr: 'Je suis content',  correct: true },
          { text: 'أَنَا حَزِين',  textFr: 'Je suis triste',   correct: false },
        ]
      },
      {
        question: 'هَلْ أَنْتَ بِخَيْر؟',
        questionFr: 'Tu vas bien ?',
        questionAudio: 'resources/audio/conversations/mood_2.mp3',
        options: [
          { text: 'نَعَمْ، الحَمْدُ لِله', textFr: 'Oui, louange à Dieu', correct: true },
          { text: 'لَا، أَنَا غَاضِب',     textFr: 'Non, je suis en colère', correct: false },
        ]
      },
      {
        question: 'هَلْ أَنْتَ حَزِين؟',
        questionFr: 'Tu es triste ?',
        questionAudio: 'resources/audio/conversations/mood_3.mp3',
        options: [
          { text: 'لَا، أَنَا سَعِيد',     textFr: 'Non, je suis content', correct: true },
          { text: 'نَعَمْ، أَنَا غَاضِب',  textFr: 'Oui, je suis en colère', correct: false },
        ]
      },
    ]
  },

  // ── 4. DANS LA CLASSE ─────────────────────────────────────────────────────
  {
    id: 4,
    title: 'Dans la classe',
    titleAr: 'فِي الفَصْل',
    emoji: '🏫',
    rounds: [
      {
        question: 'اِسْتَمِعْ إِلَى الحِوَار!',
        questionFr: 'Écoute le dialogue !',
        questionAudio: 'resources/audio/conversations/classe_1.mp3',
        options: [
          { text: 'حَسَنًا، أُسْتَاذ', textFr: 'D\'accord, professeur', correct: true },
          { text: 'قِفْ',              textFr: 'Lève-toi',              correct: false },
        ]
      },
      {
        question: 'أَيْنَ الكِتَاب؟',
        questionFr: 'Où est le livre ?',
        questionAudio: 'resources/audio/conversations/classe_2.mp3',
        options: [
          { text: 'هَذَا هُوَ الكِتَاب',  textFr: 'Voici le livre',   correct: true },
          { text: 'الكِتَابُ أَحْمَر',    textFr: 'Le livre est rouge', correct: false },
        ]
      },
      {
        question: 'مَا هَذَا؟',
        questionFr: 'Qu\'est-ce que c\'est ?',
        questionAudio: 'resources/audio/conversations/classe_3.mp3',
        options: [
          { text: 'هَذَا قَلَم',   textFr: 'C\'est un crayon', correct: true },
          { text: 'هَذَا كُرْسِي', textFr: 'C\'est une chaise', correct: false },
        ]
      },
    ]
  },

  // ── 5. LES COULEURS ───────────────────────────────────────────────────────
  {
    id: 5,
    title: 'Les Couleurs',
    titleAr: 'الأَلْوَان',
    emoji: '🎨',
    rounds: [
      {
        question: 'مَا لَوْنُ هَذَا؟',
        questionFr: 'Quelle est la couleur de ceci ?',
        questionAudio: 'resources/audio/conversations/couleur_1.mp3',
        options: [
          { text: 'هَذَا أَحْمَر', textFr: 'C\'est rouge', correct: true },
          { text: 'هَذَا أَزْرَق', textFr: 'C\'est bleu',  correct: false },
        ]
      },
      {
        question: 'مَا لَوْنُ السَّمَاء؟',
        questionFr: 'Quelle est la couleur du ciel ?',
        questionAudio: 'resources/audio/conversations/couleur_2.mp3',
        options: [
          { text: 'السَّمَاءُ زَرْقَاء',  textFr: 'Le ciel est bleu',  correct: true },
          { text: 'السَّمَاءُ حَمْرَاء',  textFr: 'Le ciel est rouge', correct: false },
        ]
      },
      {
        question: 'مَا لَوْنُ العُشْب؟',
        questionFr: 'Quelle est la couleur de l\'herbe ?',
        questionAudio: 'resources/audio/conversations/couleur_3.mp3',
        options: [
          { text: 'العُشْبُ أَخْضَر', textFr: 'L\'herbe est verte',  correct: true },
          { text: 'العُشْبُ أَصْفَر', textFr: 'L\'herbe est jaune',  correct: false },
        ]
      },
    ]
  },

  // ── 6. LA FAMILLE ─────────────────────────────────────────────────────────
  {
    id: 6,
    title: 'La Famille',
    titleAr: 'العَائِلَة',
    emoji: '👨‍👩‍👧',
    rounds: [
      {
        question: 'مَنْ هَذَا؟',
        questionFr: 'Qui est-ce ? (masculin)',
        questionAudio: 'resources/audio/conversations/famille_1.mp3',
        options: [
          { text: 'هَذَا أَبِي',  textFr: 'C\'est mon papa',   correct: true },
          { text: 'هَذَا أَخِي',  textFr: 'C\'est mon frère',  correct: false },
        ]
      },
      {
        question: 'مَنْ هَذِهِ؟',
        questionFr: 'Qui est-ce ? (féminin)',
        questionAudio: 'resources/audio/conversations/famille_2.mp3',
        options: [
          { text: 'هَذِهِ أُمِّي',   textFr: 'C\'est ma maman',  correct: true },
          { text: 'هَذِهِ أُخْتِي',  textFr: 'C\'est ma sœur',   correct: false },
        ]
      },
      {
        question: 'هَلْ لَدَيْكَ أَخٌ؟',
        questionFr: 'As-tu un frère ?',
        questionAudio: 'resources/audio/conversations/famille_3.mp3',
        options: [
          { text: 'نَعَمْ، لَدَيَّ أَخٌ',   textFr: 'Oui, j\'ai un frère', correct: true },
          { text: 'نَعَمْ، لَدَيَّ قَلَم',   textFr: 'Oui, j\'ai un crayon', correct: false },
        ]
      },
    ]
  },

  // ── 7. LES CHIFFRES ───────────────────────────────────────────────────────
  {
    id: 7,
    title: 'Les Chiffres',
    titleAr: 'الأَرْقَام',
    emoji: '🔢',
    rounds: [
      {
        question: 'كَمْ قَلَمًا عِنْدَكَ؟',
        questionFr: 'Combien de crayons as-tu ?',
        questionAudio: 'resources/audio/conversations/chiffres_1.mp3',
        options: [
          { text: 'عِنْدِي ثَلَاثَةُ أَقْلَام', textFr: 'J\'ai trois crayons',  correct: true },
          { text: 'عِنْدِي كِتَاب',              textFr: 'J\'ai un livre',       correct: false },
        ]
      },
      {
        question: 'كَمْ عُمْرُكَ؟',
        questionFr: 'Quel âge as-tu ?',
        questionAudio: 'resources/audio/conversations/chiffres_2.mp3',
        options: [
          { text: 'عُمْرِي سَبْعُ سَنَوَات',   textFr: 'J\'ai sept ans',  correct: true },
          { text: 'عُمْرِي مِئَة سَنَة',        textFr: 'J\'ai cent ans',  correct: false },
        ]
      },
      {
        question: 'وَاحِد، اِثْنَان، ...؟',
        questionFr: 'Un, deux, ... ?',
        questionAudio: 'resources/audio/conversations/chiffres_3.mp3',
        options: [
          { text: 'ثَلَاثَة', textFr: 'Trois',   correct: true },
          { text: 'خَمْسَة',  textFr: 'Cinq',    correct: false },
        ]
      },
    ]
  },

  // ── 8. LES ANIMAUX ────────────────────────────────────────────────────────
  {
    id: 8,
    title: 'Les Animaux',
    titleAr: 'الحَيَوَانَات',
    emoji: '🐱',
    rounds: [
      {
        question: 'مَا هَذَا الحَيَوَان؟',
        questionFr: 'Quel est cet animal ?',
        questionAudio: 'resources/audio/conversations/animaux_1.mp3',
        options: [
          { text: 'هَذَا قِطٌّ',   textFr: 'C\'est un chat',  correct: true },
          { text: 'هَذَا كَلْب',   textFr: 'C\'est un chien', correct: false },
        ]
      },
      {
        question: 'مَا الحَيَوَانُ الَّذِي يَطِير؟',
        questionFr: 'Quel animal vole ?',
        questionAudio: 'resources/audio/conversations/animaux_2.mp3',
        options: [
          { text: 'الطَّائِرُ يَطِير',   textFr: 'L\'oiseau vole',   correct: true },
          { text: 'الأَرْنَبُ يَطِير',   textFr: 'Le lapin vole',    correct: false },
        ]
      },
      {
        question: 'مَا الحَيَوَانُ الَّذِي يَسْبَح؟',
        questionFr: 'Quel animal nage ?',
        questionAudio: 'resources/audio/conversations/animaux_3.mp3',
        options: [
          { text: 'السَّمَكُ يَسْبَح',   textFr: 'Le poisson nage',  correct: true },
          { text: 'الْقِطُّ يَسْبَح',    textFr: 'Le chat nage',     correct: false },
        ]
      },
    ]
  },
]

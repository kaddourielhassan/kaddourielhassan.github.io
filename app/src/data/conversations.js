export const conversations = [
  {
    id: 1,
    title: 'Salutations',
    titleAr: 'التَّحِيَّات',
    emoji: '👋',
    rounds: [
      {
        question: 'السَّلَامُ عَلَيْكُمْ!',
        questionAudio: 'resources/audio/conversations/salut_1.mp3',
        options: [
          { text: 'وَعَلَيْكُمُ السَّلَام', correct: true },
          { text: 'شُكْرًا', correct: false },
        ]
      },
      {
        question: 'صَبَاحُ الخَيْر!',
        questionAudio: 'resources/audio/conversations/matin_1.mp3',
        options: [
          { text: 'صَبَاحُ النُّور', correct: true },
          { text: 'مَسَاءُ الخَيْر', correct: false },
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Présentation',
    titleAr: 'التَّعَارُف',
    emoji: '🤝',
    rounds: [
      {
        question: 'مَا اسْمُكَ؟',
        questionAudio: 'resources/audio/conversations/nom_1.mp3',
        options: [
          { text: 'اِسْمِي...', correct: true },
          { text: 'أَنَا بِخَيْر', correct: false },
        ]
      },
      {
        question: 'كَمْ عُمْرُكَ؟',
        questionAudio: 'resources/audio/conversations/age_1.mp3',
        options: [
          { text: 'عُمْرِي 7 سَنَوَات', correct: true },
          { text: 'لَا شُكْرًا', correct: false },
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Les Émotions',
    titleAr: 'المَشَاعِر',
    emoji: '😊',
    rounds: [
      {
        question: 'كَيْفَ حَالُكَ اليَوْم؟',
        questionAudio: 'resources/audio/conversations/mood_1.mp3',
        options: [
          { text: 'أَنَا سَعِيد', correct: true },
          { text: 'أَنَا كِتَاب', correct: false },
        ]
      },
      {
        question: 'هَلْ أَنْتَ بِخَيْر؟',
        questionAudio: 'resources/audio/conversations/mood_2.mp3',
        options: [
          { text: 'نَعَمْ، الحَمْدُ لِله', correct: true },
          { text: 'لَا، أَنَا أَزْرَق', correct: false },
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Dans la classe',
    titleAr: 'فِي الفَصْل',
    emoji: '🏫',
    rounds: [
      {
        question: 'اِسْتَمِعْ إِلَى الحِوَار!',
        questionAudio: 'resources/audio/conversations/classe_1.mp3',
        options: [
          { text: 'حَسَنًا', correct: true },
          { text: 'قِفْ', correct: false },
        ]
      },
      {
        question: 'أَيْنَ الكِتَاب؟',
        questionAudio: 'resources/audio/conversations/classe_2.mp3',
        options: [
          { text: 'هَذَا هُوَ الكِتَاب', correct: true },
          { text: 'أَنَا يَاسِين', correct: false },
        ]
      }
    ]
  }
]

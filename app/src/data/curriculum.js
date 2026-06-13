/**
 * Système de Progression Curriculaire
 * 4 niveaux progressifs — chaque niveau se débloque après 70% de maîtrise du précédent
 */

import { alphabet } from './alphabet'
import { phonemes } from './phonemes'

export const CURRICULUM_LEVELS = [
  {
    id: 1,
    name: 'المستوى ١',
    nameAr: 'المُسْتَوَى الأَوَّل',
    descAr: 'أربع حروف أساسية',
    letterIds: [1, 2, 3, 4],      // ا ح د ر
    phonemeIds: [1],               // ح vs ه
    conversationIds: [1, 5],       // Salutations + Couleurs (trimestre 1)
    requiredMastery: 0.7,
    memoryPairs: 4,
    color: 'from-blue-400 to-blue-600',
    emoji: '🌱',
  },
  {
    id: 2,
    name: 'المستوى ٢',
    nameAr: 'المُسْتَوَى الثَّانِي',
    descAr: 'أربع حروف إضافية',
    letterIds: [5, 6, 7, 8],      // س ص ط ع
    phonemeIds: [2, 3],            // ع vs ا, ص vs س
    conversationIds: [2, 6],       // Présentation + Famille (trimestre 2)
    requiredMastery: 0.7,
    memoryPairs: 4,
    color: 'from-emerald-400 to-emerald-600',
    emoji: '🌿',
  },
  {
    id: 3,
    name: 'المستوى ٣',
    nameAr: 'المُسْتَوَى الثَّالِث',
    descAr: 'الحروف الأخيرة بلا نقاط',
    letterIds: [9, 10, 11, 12],    // ل م و ه
    phonemeIds: [4, 5],            // ض vs د, ط vs ت
    conversationIds: [3, 7],       // Émotions + Chiffres
    requiredMastery: 0.7,
    memoryPairs: 6,
    color: 'from-amber-400 to-amber-600',
    emoji: '🌳',
  },
  {
    id: 4,
    name: 'المستوى ٤',
    nameAr: 'المُسْتَوَى الرَّابِع',
    descAr: 'كل الحروف العربية',
    letterIds: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
    phonemeIds: [6],               // ق vs ك
    conversationIds: [4, 8],       // Dans la classe + Animaux (trimestre 3)
    requiredMastery: 0.7,
    memoryPairs: 6,
    color: 'from-purple-400 to-purple-600',
    emoji: '👑',
  },
]

/** Get all letter IDs available at a curriculum level (cumulative) */
export function getAvailableLetterIds(currentLevel) {
  const ids = []
  for (const level of CURRICULUM_LEVELS) {
    if (level.id <= currentLevel) ids.push(...level.letterIds)
  }
  return ids
}

/** Get alphabet objects available at a curriculum level */
export function getAvailableLetters(currentLevel) {
  const ids = getAvailableLetterIds(currentLevel)
  return alphabet.filter(l => ids.includes(l.id))
}

/** Get all phoneme IDs available at a curriculum level (cumulative) */
export function getAvailablePhonemeIds(currentLevel) {
  const ids = []
  for (const level of CURRICULUM_LEVELS) {
    if (level.id <= currentLevel) ids.push(...level.phonemeIds)
  }
  return ids
}

/** Get phoneme objects available at a curriculum level */
export function getAvailablePhonemes(currentLevel) {
  const ids = getAvailablePhonemeIds(currentLevel)
  return phonemes.filter(p => ids.includes(p.id))
}

/** Calculate mastery percentage for a specific level from SRS items */
export function calculateLevelMastery(srsItems, level) {
  const letterIds = level.letterIds
  if (letterIds.length === 0) return 1
  let totalScore = 0
  letterIds.forEach(id => {
    const item = srsItems[`letter_${id}`]
    if (!item) return
    totalScore += item.box * 0.25 // Box 1=25%, 2=50%, 3=75%, 4=100%
  })
  return totalScore / letterIds.length
}

/** Determine the highest unlocked curriculum level for a profile */
export function getCurrentLevel(srsItems) {
  let currentLevel = 1
  for (let i = 1; i < CURRICULUM_LEVELS.length; i++) {
    const prevLevel = CURRICULUM_LEVELS[i - 1]
    const mastery = calculateLevelMastery(srsItems, prevLevel)
    if (mastery >= prevLevel.requiredMastery) {
      currentLevel = CURRICULUM_LEVELS[i].id
    } else {
      break
    }
  }
  return currentLevel
}

/** Get memory pairs count for current level */
export function getMemoryPairs(currentLevel) {
  const level = CURRICULUM_LEVELS.find(l => l.id === currentLevel)
  return level?.memoryPairs || 4
}

/** Get all conversation IDs available at a curriculum level */
export function getAvailableConversationIds(currentLevel) {
  const ids = []
  for (const level of CURRICULUM_LEVELS) {
    if (level.id <= currentLevel && level.conversationIds) ids.push(...level.conversationIds)
  }
  return ids
}

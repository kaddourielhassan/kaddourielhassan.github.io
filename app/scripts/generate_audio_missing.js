/**
 * Génération audio ciblée — fichiers manquants v2
 * - 3 feedbacks arabes (أَحْسَنْتَ, مُمْتَاز, حَاوِلْ مَرَّةً أُخْرَى)
 * - 36 syllabes (12 lettres × 3 voyelles)
 * - 3 mots religieux (religieux-4 à 6)
 *
 * Usage : $env:ELEVENLABS_API_KEY='xxx' ; node scripts/generate_audio_missing.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const PUBLIC_DIR = path.join(__dirname, '../public')

const API_KEY  = process.env.ELEVENLABS_API_KEY
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'

if (!API_KEY) {
  console.error('❌ Clé API manquante.')
  console.error('👉 $env:ELEVENLABS_API_KEY=\'votre_clé\' ; node scripts/generate_audio_missing.js')
  process.exit(1)
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function generateSpeech(text, outputPath) {
  const fullPath = path.join(PUBLIC_DIR, outputPath)
  if (fs.existsSync(fullPath)) {
    console.log(`⏩ Existe déjà : ${outputPath}`)
    return
  }
  ensureDir(fullPath)
  console.log(`🎙️  "${text}" → ${outputPath}`)
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API ${response.status}: ${err}`)
    }
    const buf = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(fullPath, buf)
    console.log(`✅ Sauvegardé`)
    await new Promise(r => setTimeout(r, 600))
  } catch (e) {
    console.error(`❌ Échec pour "${text}":`, e.message)
  }
}

async function main() {
  const queue = []

  // ── 1. Feedbacks arabes ──────────────────────────────────────────────────────
  queue.push({ text: 'أَحْسَنْتَ',            path: 'audio/feedback/ahsanta.mp3' })
  queue.push({ text: 'مُمْتَاز',              path: 'audio/feedback/mumtaz.mp3'  })
  queue.push({ text: 'حَاوِلْ مَرَّةً أُخْرَى', path: 'audio/feedback/hawil.mp3'  })

  // ── 2. Syllabes (12 lettres × 3 voyelles) ───────────────────────────────────
  const syllabes = [
    { translit: 'alif',  syllabes: [{ tts: 'أَ', v: 'fatha' }, { tts: 'إِ', v: 'kasra' }, { tts: 'أُ', v: 'damma' }] },
    { translit: 'haa',   syllabes: [{ tts: 'حَ', v: 'fatha' }, { tts: 'حِ', v: 'kasra' }, { tts: 'حُ', v: 'damma' }] },
    { translit: 'daal',  syllabes: [{ tts: 'دَ', v: 'fatha' }, { tts: 'دِ', v: 'kasra' }, { tts: 'دُ', v: 'damma' }] },
    { translit: 'raa',   syllabes: [{ tts: 'رَ', v: 'fatha' }, { tts: 'رِ', v: 'kasra' }, { tts: 'رُ', v: 'damma' }] },
    { translit: 'siin',  syllabes: [{ tts: 'سَ', v: 'fatha' }, { tts: 'سِ', v: 'kasra' }, { tts: 'سُ', v: 'damma' }] },
    { translit: 'saad',  syllabes: [{ tts: 'صَ', v: 'fatha' }, { tts: 'صِ', v: 'kasra' }, { tts: 'صُ', v: 'damma' }] },
    { translit: 'taa',   syllabes: [{ tts: 'طَ', v: 'fatha' }, { tts: 'طِ', v: 'kasra' }, { tts: 'طُ', v: 'damma' }] },
    { translit: 'ayn',   syllabes: [{ tts: 'عَ', v: 'fatha' }, { tts: 'عِ', v: 'kasra' }, { tts: 'عُ', v: 'damma' }] },
    { translit: 'laam',  syllabes: [{ tts: 'لَ', v: 'fatha' }, { tts: 'لِ', v: 'kasra' }, { tts: 'لُ', v: 'damma' }] },
    { translit: 'miim',  syllabes: [{ tts: 'مَ', v: 'fatha' }, { tts: 'مِ', v: 'kasra' }, { tts: 'مُ', v: 'damma' }] },
    { translit: 'waaw',  syllabes: [{ tts: 'وَ', v: 'fatha' }, { tts: 'وِ', v: 'kasra' }, { tts: 'وُ', v: 'damma' }] },
    { translit: 'ha',    syllabes: [{ tts: 'هَ', v: 'fatha' }, { tts: 'هِ', v: 'kasra' }, { tts: 'هُ', v: 'damma' }] },
  ]

  syllabes.forEach(({ translit, syllabes: syls }) => {
    syls.forEach(({ tts, v }) => {
      queue.push({ text: tts, path: `audio/syllabes/${translit}_${v}.mp3` })
    })
  })

  // ── 3. Mots religieux manquants (index 4, 5, 6) ─────────────────────────────
  queue.push({ text: 'بِسْمِ اللَّه',      path: 'resources/audio/vocabulaire/religieux-4.mp3' })
  queue.push({ text: 'الحَمْدُ لِلَّه',   path: 'resources/audio/vocabulaire/religieux-5.mp3' })
  queue.push({ text: 'إِنْ شَاءَ اللَّه', path: 'resources/audio/vocabulaire/religieux-6.mp3' })

  console.log(`\n🚀 ${queue.length} fichiers à générer...\n`)
  for (const item of queue) {
    await generateSpeech(item.text, item.path)
  }
  console.log('\n🎉 Terminé !')
}

main().catch(console.error)

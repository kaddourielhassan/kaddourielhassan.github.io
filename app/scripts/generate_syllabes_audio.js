/**
 * Génération audio — 36 fichiers syllabes (12 lettres × 3 voyelles courtes)
 *
 * Les fichiers sont placés dans public/audio/syllabes/
 * La vitesse (speed: 1.3) empêche l'allongement des voyelles courtes.
 *
 * Usage :
 *   $env:ELEVENLABS_API_KEY='votre_clé' ; node scripts/generate_syllabes_audio.js
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
  console.error("👉  $env:ELEVENLABS_API_KEY='votre_clé' ; node scripts/generate_syllabes_audio.js")
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
  console.log(`🎙️  "${text}"  →  ${outputPath}`)
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept':        'audio/mpeg',
        'xi-api-key':    API_KEY,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        // speed > 1.0 empêche l'allongement des voyelles courtes
        speed: 1.3,
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API ${response.status}: ${err}`)
    }
    const buf = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(fullPath, buf)
    console.log(`✅ OK`)
    await new Promise(r => setTimeout(r, 600))
  } catch (e) {
    console.error(`❌ Échec : "${text}" —`, e.message)
  }
}

async function main() {
  const DIR = 'audio/syllabes'

  // Chaque syllabe est envoyée avec un point final (.) pour
  // forcer la TTS à couper net la voyelle (pas de trainée).
  const queue = [
    // ── Alif ──────────────────────────────────────────────
    { text: 'أَ.',  path: `${DIR}/alif_fatha.mp3` },
    { text: 'إِ.',  path: `${DIR}/alif_kasra.mp3` },
    { text: 'أُ.',  path: `${DIR}/alif_damma.mp3` },

    // ── Haa (ح) ───────────────────────────────────────────
    { text: 'حَ.',  path: `${DIR}/haa_fatha.mp3` },
    { text: 'حِ.',  path: `${DIR}/haa_kasra.mp3` },
    { text: 'حُ.',  path: `${DIR}/haa_damma.mp3` },

    // ── Daal (د) ──────────────────────────────────────────
    { text: 'دَ.',  path: `${DIR}/daal_fatha.mp3` },
    { text: 'دِ.',  path: `${DIR}/daal_kasra.mp3` },
    { text: 'دُ.',  path: `${DIR}/daal_damma.mp3` },

    // ── Raa (ر) ───────────────────────────────────────────
    { text: 'رَ.',  path: `${DIR}/raa_fatha.mp3` },
    { text: 'رِ.',  path: `${DIR}/raa_kasra.mp3` },
    { text: 'رُ.',  path: `${DIR}/raa_damma.mp3` },

    // ── Siin (س) ──────────────────────────────────────────
    { text: 'سَ.',  path: `${DIR}/siin_fatha.mp3` },
    { text: 'سِ.',  path: `${DIR}/siin_kasra.mp3` },
    { text: 'سُ.',  path: `${DIR}/siin_damma.mp3` },

    // ── Saad (ص) ──────────────────────────────────────────
    { text: 'صَ.',  path: `${DIR}/saad_fatha.mp3` },
    { text: 'صِ.',  path: `${DIR}/saad_kasra.mp3` },
    { text: 'صُ.',  path: `${DIR}/saad_damma.mp3` },

    // ── Taa emphatique (ط) ────────────────────────────────
    { text: 'طَ.',  path: `${DIR}/taa_fatha.mp3` },
    { text: 'طِ.',  path: `${DIR}/taa_kasra.mp3` },
    { text: 'طُ.',  path: `${DIR}/taa_damma.mp3` },

    // ── 'Ayn (ع) ──────────────────────────────────────────
    { text: 'عَ.',  path: `${DIR}/ayn_fatha.mp3` },
    { text: 'عِ.',  path: `${DIR}/ayn_kasra.mp3` },
    { text: 'عُ.',  path: `${DIR}/ayn_damma.mp3` },

    // ── Laam (ل) ──────────────────────────────────────────
    { text: 'لَ.',  path: `${DIR}/laam_fatha.mp3` },
    { text: 'لِ.',  path: `${DIR}/laam_kasra.mp3` },
    { text: 'لُ.',  path: `${DIR}/laam_damma.mp3` },

    // ── Miim (م) ──────────────────────────────────────────
    { text: 'مَ.',  path: `${DIR}/miim_fatha.mp3` },
    { text: 'مِ.',  path: `${DIR}/miim_kasra.mp3` },
    { text: 'مُ.',  path: `${DIR}/miim_damma.mp3` },

    // ── Waaw (و) ──────────────────────────────────────────
    { text: 'وَ.',  path: `${DIR}/waaw_fatha.mp3` },
    { text: 'وِ.',  path: `${DIR}/waaw_kasra.mp3` },
    { text: 'وُ.',  path: `${DIR}/waaw_damma.mp3` },

    // ── Haa légère (ه) ────────────────────────────────────
    { text: 'هَ.',  path: `${DIR}/ha_fatha.mp3` },
    { text: 'هِ.',  path: `${DIR}/ha_kasra.mp3` },
    { text: 'هُ.',  path: `${DIR}/ha_damma.mp3` },
  ]

  console.log(`\n🚀 ${queue.length} fichiers audio syllabes à générer...\n`)
  for (const item of queue) {
    await generateSpeech(item.text, item.path)
  }
  console.log('\n🎉 Terminé ! Fichiers dans public/audio/syllabes/')
}

main().catch(console.error)

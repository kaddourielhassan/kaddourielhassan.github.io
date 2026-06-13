/**
 * Génération audio — 16 fichiers conversations manquants
 *
 * Usage :
 *   $env:ELEVENLABS_API_KEY='9d5eed0b...' ; node scripts/generate_conversations_audio.js
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
  console.error("👉  $env:ELEVENLABS_API_KEY='votre_clé' ; node scripts/generate_conversations_audio.js")
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
        voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API ${response.status}: ${err}`)
    }
    const buf = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(fullPath, buf)
    console.log(`✅ OK`)
    await new Promise(r => setTimeout(r, 700))
  } catch (e) {
    console.error(`❌ Échec : "${text}" —`, e.message)
  }
}

async function main() {
  const DIR = 'resources/audio/conversations'

  const queue = [
    // ── Scénario 1 — Salutations (round 3 nouveau) ──────────────────────────
    { text: 'مَسَاءُ الخَيْر!',                    path: `${DIR}/masaa_1.mp3`    },

    // ── Scénario 2 — Présentation (round 3 nouveau) ─────────────────────────
    { text: 'كَيْفَ حَالُكَ؟',                      path: `${DIR}/hal_1.mp3`      },

    // ── Scénario 3 — Émotions (round 3 nouveau) ─────────────────────────────
    { text: 'هَلْ أَنْتَ حَزِين؟',                  path: `${DIR}/mood_3.mp3`     },

    // ── Scénario 4 — Dans la classe (round 3 nouveau) ───────────────────────
    { text: 'مَا هَذَا؟',                            path: `${DIR}/classe_3.mp3`   },

    // ── Scénario 5 — Les Couleurs (nouveau) ─────────────────────────────────
    { text: 'مَا لَوْنُ هَذَا؟',                    path: `${DIR}/couleur_1.mp3`  },
    { text: 'مَا لَوْنُ السَّمَاء؟',                path: `${DIR}/couleur_2.mp3`  },
    { text: 'مَا لَوْنُ العُشْب؟',                  path: `${DIR}/couleur_3.mp3`  },

    // ── Scénario 6 — La Famille (nouveau) ───────────────────────────────────
    { text: 'مَنْ هَذَا؟',                           path: `${DIR}/famille_1.mp3`  },
    { text: 'مَنْ هَذِهِ؟',                          path: `${DIR}/famille_2.mp3`  },
    { text: 'هَلْ لَدَيْكَ أَخٌ؟',                  path: `${DIR}/famille_3.mp3`  },

    // ── Scénario 7 — Les Chiffres (nouveau) ─────────────────────────────────
    { text: 'كَمْ قَلَمًا عِنْدَكَ؟',               path: `${DIR}/chiffres_1.mp3` },
    { text: 'كَمْ عُمْرُكَ؟',                        path: `${DIR}/chiffres_2.mp3` },
    { text: 'وَاحِد، اِثْنَان، مَاذَا يَأْتِي بَعْدَهُمَا؟', path: `${DIR}/chiffres_3.mp3` },

    // ── Scénario 8 — Les Animaux (nouveau) ──────────────────────────────────
    { text: 'مَا هَذَا الحَيَوَان؟',                path: `${DIR}/animaux_1.mp3`  },
    { text: 'مَا الحَيَوَانُ الَّذِي يَطِير؟',      path: `${DIR}/animaux_2.mp3`  },
    { text: 'مَا الحَيَوَانُ الَّذِي يَسْبَح؟',     path: `${DIR}/animaux_3.mp3`  },
  ]

  console.log(`\n🚀 ${queue.length} fichiers audio à générer...\n`)
  for (const item of queue) {
    await generateSpeech(item.text, item.path)
  }
  console.log('\n🎉 Terminé !')
}

main().catch(console.error)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'resources/**/*'],
      manifest: {
        name: 'Hurûfî - Apprendre l\'arabe',
        short_name: 'Hurûfî',
        description: 'Une application ludique pour apprendre l\'arabe aux enfants.',
        theme_color: '#4f46e5',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,mp3}'],
        maximumFileSizeToCacheInBytes: 5000000
      }
    })
  ],
  base: './',
})

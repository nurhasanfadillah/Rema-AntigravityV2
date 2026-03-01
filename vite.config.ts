import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'REMA – Redone Execution and Management Architecture',
        short_name: 'REMA',
        description: 'Platform manajemen pesanan, produksi, dan keuangan oleh PT. Redone Berkah Mandiri Utama.',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        lang: 'id',
        icons: [
          {
            src: '/ICON_APLIKASI_LOGO_REMAV2.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/ICON_APLIKASI_LOGO_REMAV2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
})

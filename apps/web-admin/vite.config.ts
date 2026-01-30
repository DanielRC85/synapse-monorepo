import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Regla 1: Todo lo que empiece por /api se va a Railway
      '/api': { 
        target: 'https://backend-core-production-ff8d.up.railway.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Regla 2: Login y Registro (/iam) se va a Railway
      '/iam': {
        target: 'https://backend-core-production-ff8d.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
      // Regla 3: Canales y Mensajes (/channels) se va a Railway
      '/channels': {
        target: 'https://backend-core-production-ff8d.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
      // Regla 4: Webhooks (por seguridad)
      '/webhook': {
         target: 'https://backend-core-production-ff8d.up.railway.app',
         changeOrigin: true,
         secure: false,
      }
    },
  },
})
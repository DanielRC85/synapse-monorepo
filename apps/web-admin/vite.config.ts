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
      '/api': { // Asegúrate de que tu Frontend llame a /api/...
        target: 'http://127.0.0.1:3000', // <--- ¡AQUÍ ESTÁ EL CAMBIO! (Antes decía localhost)
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // ⚠️ TRUCO ADICIONAL: Si tu frontend llama directo a /channels (sin /api), agrega esto:
      '/channels': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
      '/webhook': {
         target: 'http://127.0.0.1:3000',
         changeOrigin: true,
         secure: false,
      }
    },
  },
})
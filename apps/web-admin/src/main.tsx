import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <--- Importamos el Motor
import './index.css'
import App from './App.tsx'

// 1. Configuramos el motor de datos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Si falla, reintenta 1 vez
      refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Envolvemos la App con el Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
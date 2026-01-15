import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

// Creamos la instancia apuntando al Proxy configurado en Vite
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Inyectar Token
api.interceptors.request.use(
  (config) => {
    // Accedemos al store directamente sin hooks (fuera de React)
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Si recibimos 401 (Unauthorized), forzamos logout
    if (response && response.status === 401) {
      useAuthStore.getState().logout();
      // Opcional: Redirigir a login si no se usa un AuthGuard en el router
      window.location.href = '/login'; 
    }

    return Promise.reject(error);
  }
);

export default api;
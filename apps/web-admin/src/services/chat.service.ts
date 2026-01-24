import api from '../lib/api';
import type { Message } from '../types/chat';

export interface SendMessagePayload {
  recipient: string;
  content: string;
  tenantId: string;
}

export const chatService = {
  // 1. OBTENER HISTORIAL (CORREGIDO)
  // Antes llamabas a: /channels/messages/history (MAL ❌)
  // Ahora llamamos a: /messages/:tenantId (BIEN ✅)
  getMessages: async (tenantId: string): Promise<Message[]> => {
    try {
      // Ajuste clave: Pasamos el ID en la URL, no como query param
      const { data } = await api.get<Message[]>(`/messages/${tenantId}`);
      return data;
    } catch (error) {
      console.error("Error obteniendo chats (backend apagado o ruta mal):", error);
      return []; // Devuelve vacío para que no salga la pantalla roja de muerte
    }
  },

  // 2. ENVIAR MENSAJE (CORREGIDO)
  // Antes llamabas a: /channels/messages/send (MAL ❌ - Eso es para Meta)
  // Ahora llamamos a: /messages/send (BIEN ✅ - Esto es para React)
  sendMessage: async (payload: SendMessagePayload): Promise<void> => {
    await api.post('/messages/send', payload);
  },
};
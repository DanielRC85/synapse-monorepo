import api from '../lib/api';
// Usamos 'import type' para asegurar que Vite no intente empaquetar interfaces
import type { Message } from '../types/chat';

export interface SendMessagePayload {
  recipient: string;
  content: string;
  tenantId: string;
}

export const chatService = {
  // 1. OBTENER HISTORIAL
  // Llama a: GET http://localhost:3000/channels/messages/history?tenantId=...
  getMessages: async (tenantId: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>('/channels/messages/history', {
        params: { tenantId } 
    });
    return data;
  },

  // 2. ENVIAR MENSAJE
  // Llama a: POST http://localhost:3000/channels/messages/send
  sendMessage: async (payload: SendMessagePayload): Promise<void> => {
    await api.post('/channels/messages/send', payload);
  },
};
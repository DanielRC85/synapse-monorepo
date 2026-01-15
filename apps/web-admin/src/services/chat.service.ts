import api from '../lib/api';
import type { Message } from '../types/chat'; // Corrección TS1484

export const chatService = {
  /**
   * Obtiene el historial de mensajes.
   * El backend infiere el tenantId desde el Token, por eso _tenantId no se usa en la URL.
   */
  getMessages: async (_tenantId: string): Promise<Message[]> => { // Corrección TS6133 (guion bajo)
    const { data } = await api.get<Message[]>('/channels/messages');
    return data;
  },
};
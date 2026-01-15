export type MessageType = 'text' | 'image' | 'document' | 'audio';
export type MessageDirection = 'inbound' | 'outbound';

export interface Message {
  id: string;
  content: string;
  sender: string;
  type: MessageType;
  timestamp: string; // Recibimos ISO string o Timestamp del backend
  direction: MessageDirection;
  tenantId?: string; // Opcional, útil para contexto
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
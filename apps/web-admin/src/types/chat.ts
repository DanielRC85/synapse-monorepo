export type MessageType = 'text' | 'image' | 'document' | 'audio';
export type MessageDirection = 'inbound' | 'outbound';

export interface Message {
  id: string;
  content: string; // Prisma: content
  sender: string;  // Prisma: sender
  type: MessageType;
  
  // ⚠️ CORRECCIÓN CRUCIAL:
  // Prisma devuelve 'createdAt', no 'timestamp'.
  // Agregamos ambas para evitar errores si el backend cambia.
  createdAt: string; 
  timestamp?: string; 

  direction: MessageDirection;
  tenantId?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
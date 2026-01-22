import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import type { Message } from '../types/chat'; 

interface UseChatResult {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useChat = (tenantId: string | null): UseChatResult => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['chat', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      return await chatService.getMessages(tenantId);
    },
    // Polling: 3 segundos es un buen balance para MVP sin Websockets
    refetchInterval: 3000, 
    staleTime: 0,
    enabled: !!tenantId,
  });

  return {
    messages: data || [],
    isLoading,
    isError,
    error,
  };
};
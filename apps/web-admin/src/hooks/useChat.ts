import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import type { Message } from '../types/chat';

// Definimos que para enviar, AHORA necesitamos recipient
interface SendMessageArgs {
  content: string;
  recipient: string; 
}

interface UseChatResult {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  // La función sendMessage ahora pide (texto, destino)
  sendMessage: (content: string, recipient: string) => Promise<void>;
}

export const useChat = (tenantId: string | null): UseChatResult => {
  const queryClient = useQueryClient();

  // Lectura de mensajes (Polling cada 3s)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['chat', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      return await chatService.getMessages(tenantId);
    },
    refetchInterval: 3000, 
    staleTime: 0,
    enabled: !!tenantId,
  });

  // Envío de mensajes
  const mutation = useMutation({
    mutationFn: async ({ content, recipient }: SendMessageArgs) => {
      if (!tenantId) throw new Error("No hay Tenant ID");

      return chatService.sendMessage({
        tenantId,
        content,
        recipient, // <--- AQUÍ ESTÁ LA CORRECCIÓN. Ya no es fijo.
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', tenantId] });
    },
    onError: (err) => {
      console.error('Error enviando mensaje:', err);
    }
  });

  return {
    messages: data || [],
    isLoading,
    isError,
    error,
    sendMessage: async (content: string, recipient: string) => {
      await mutation.mutateAsync({ content, recipient });
    }
  };
};
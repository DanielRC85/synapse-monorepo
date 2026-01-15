import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import type { Message } from '../types/chat'; // Corrección TS1484

interface UseChatResult {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useChat = (tenantId: string | null): UseChatResult => {
  const { data, isLoading, isError, error } = useQuery({
    // Query Key única: Si cambia el tenantId, se resetea el caché
    queryKey: ['chat', tenantId],
    
    // Query Function
    queryFn: () => {
      if (!tenantId) return Promise.resolve([]);
      return chatService.getMessages(tenantId);
    },
    
    // Configuración de Polling (5 segundos)
    refetchInterval: 5000,
    
    // Configuración adicional
    staleTime: 2000, // Consideramos la data "fresca" por 2 segundos
    retry: 1, // Reintentar solo 1 vez si falla antes de lanzar error
    enabled: !!tenantId, // Solo ejecutar si hay tenantId
  });

  return {
    messages: data || [],
    isLoading,
    isError,
    error,
  };
};
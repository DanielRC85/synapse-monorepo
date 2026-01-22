import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import type { SendMessagePayload } from '../services/chat.service';

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => chatService.sendMessage(payload),
    onSuccess: (_, variables) => {
      // UX: Forzamos la recarga inmediata del chat al enviar
      queryClient.invalidateQueries({ queryKey: ['chat', variables.tenantId] });
    },
    onError: (error) => {
      // TODO: Conectar con un sistema de Toasts/Notificaciones real en el futuro
      console.error('Error enviando mensaje:', error);
    }
  });
};
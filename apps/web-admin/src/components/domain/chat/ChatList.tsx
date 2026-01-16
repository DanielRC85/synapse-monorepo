import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
// 👇 AQUÍ ESTÁ EL CAMBIO: Agregamos 'type'
import type { Message } from '../../../types/chat';
import { Loader2, MessageSquareOff } from 'lucide-react';

interface ChatListProps {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({ messages, isLoading, isError }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
        <p className="text-sm">Sincronizando mensajes...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 p-4 text-center">
        <MessageSquareOff className="w-10 h-10 mb-2 opacity-50" />
        <p className="font-medium">Sin conexión</p>
        <p className="text-xs text-red-400 mt-1">Verifica que el Backend (puerto 3000) esté corriendo.</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-slate-50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
          <MessageSquareOff className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-gray-600 font-medium">Bandeja vacía</p>
        <p className="text-xs mt-1 text-gray-400">Los mensajes nuevos aparecerán aquí automáticamente.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#efeae2] space-y-2">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
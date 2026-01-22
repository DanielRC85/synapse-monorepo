import React, { useState } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { clsx } from 'clsx'; // Usamos clsx para manejo limpio de clases

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    
    if (cleanText && !isLoading) {
      onSend(cleanText);
      setText(''); // Limpiar input solo si se envió
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-4 bg-white border-t border-gray-200 flex gap-2 items-center"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe un mensaje..."
        disabled={isLoading}
        autoFocus
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 transition-all"
      />
      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        className={clsx(
          "p-2 rounded-lg text-white transition-colors flex items-center justify-center",
          !text.trim() || isLoading 
            ? "bg-blue-300 cursor-not-allowed" // Estado deshabilitado
            : "bg-blue-600 hover:bg-blue-700 shadow-sm" // Estado activo
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <SendHorizontal className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};
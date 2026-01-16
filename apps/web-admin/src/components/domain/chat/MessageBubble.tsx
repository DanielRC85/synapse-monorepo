import React from 'react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
// 👇 AQUÍ ESTÁ EL CAMBIO: Agregamos 'type'
import type { Message } from '../../../types/chat';
import { CheckCheck, FileText, Image as ImageIcon, Mic } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOutbound = message.direction === 'outbound';

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            <span className="italic">Imagen</span>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            <span className="italic">Nota de voz</span>
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span className="underline">Documento</span>
          </div>
        );
      default:
        return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
    }
  };

  return (
    <div
      className={clsx(
        'flex w-full mb-4',
        isOutbound ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'relative max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-xl shadow-sm text-sm',
          isOutbound
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        )}
      >
        {!isOutbound && (
          <span className="block text-[10px] font-bold text-blue-600 mb-1">
            {message.sender}
          </span>
        )}

        <div className="mb-1">{renderContent()}</div>

        <div
          className={clsx(
            'flex items-center justify-end gap-1 text-[10px]',
            isOutbound ? 'text-blue-100' : 'text-gray-400'
          )}
        >
          <span>
            {message.timestamp
              ? format(new Date(message.timestamp), 'HH:mm')
              : ''}
          </span>
          {isOutbound && <CheckCheck className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
};
import { memo } from 'react';
import type { ChatMessage } from '../../types/realtime.types';

interface ChatMessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showSender?: boolean;
}

export const ChatMessageComponent = memo(({ message, isOwnMessage, showSender = true }: ChatMessageProps) => {
  const { payload } = message;
  const timestamp = new Date(message.timestamp);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 🎯 시스템 메시지 확인
  const isSystemMessage = payload.userId === 'system';

  // 🎯 시스템 메시지는 중앙 정렬
  if (isSystemMessage) {
    return (
      <div className="flex justify-center mb-3">
        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-body">
          {payload.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-darkOrange dark:bg-background text-background dark:text-darkOrange' 
          : 'bg-background/80 dark:bg-darkOrange/80 text-darkOrange dark:text-background border border-darkOrange/20 dark:border-background/20'
      }`}>
        {showSender && !isOwnMessage && (
          <div className="text-xs font-semibold mb-1 opacity-75 font-body">
            {payload.name}
          </div>
        )}
        
        <div className="text-sm font-body">
          {payload.content}
        </div>
        
        {payload.messageType === 'image' && (
          <div className="mt-2">
            <img 
              src={`/api/files/${payload.content}`} 
              alt="Shared image"
              className="max-w-full rounded"
            />
          </div>
        )}
        
        {payload.messageType === 'file' && (
          <div className="mt-2 p-2 bg-black bg-opacity-10 rounded flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-body">
              File: {payload.content}
            </span>
          </div>
        )}
        
        <div className={`text-xs mt-1 opacity-50 font-body ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
});

ChatMessageComponent.displayName = 'ChatMessage'; 
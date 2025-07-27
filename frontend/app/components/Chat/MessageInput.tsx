import { useState, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
const {t} = useTranslation();

export const MessageInput = ({ onSendMessage, disabled = false, placeholder = t('typeMessasge') }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);
  const isSendingRef = useRef(false);

  const handleSend = () => {
    console.log('🔍 MessageInput handleSend called:', { message, trimmed: message.trim(), disabled, isSending: isSendingRef.current });
    if (message.trim() && !disabled && !isSendingRef.current) {
      isSendingRef.current = true;
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      // Reset sending flag after a short delay
      setTimeout(() => {
        isSendingRef.current = false;
      }, 100);
    }
  };

  const handleButtonClick = () => {
    // console.log('🔍 MessageInput handleButtonClick called');
    handleSend();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // console.log('🔍 MessageInput handleKeyDown:', { key: e.key, shiftKey: e.shiftKey, message, isComposing: isComposingRef.current });
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleCompositionStart = () => {
    // console.log('🔍 Composition start');
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    // console.log('🔍 Composition end');
    isComposingRef.current = false;
  };

  return (
    <div className="border-t border-darkOrange dark:border-background bg-lightOrange dark:bg-darkBlue p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-3 py-2 border border-darkOrange/30 dark:border-background/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-darkOrange dark:focus:ring-background focus:border-transparent disabled:bg-darkOrange/10 dark:disabled:bg-background/10 disabled:cursor-not-allowed font-body bg-background dark:bg-darkOrange text-darkOrange dark:text-background placeholder-darkOrange/50 dark:placeholder-background/50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          onClick={handleButtonClick}
          disabled={!message.trim() || disabled}
          className="px-4 py-2 bg-darkOrange dark:bg-background text-background dark:text-darkOrange rounded-lg hover:bg-darkOrange/90 dark:hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-darkOrange dark:focus:ring-background focus:ring-offset-2 disabled:bg-darkOrange/30 dark:disabled:bg-background/30 disabled:cursor-not-allowed transition-colors font-body"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      
      <div className="mt-2 text-xs text-darkOrange/60 dark:text-background/60 font-body">
       {t('chat.sendMessage')}
      </div>
    </div>
  );
}; 
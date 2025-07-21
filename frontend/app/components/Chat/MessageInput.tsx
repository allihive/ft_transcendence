import { useState, useRef, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({ onSendMessage, disabled = false, placeholder = "Type a message..." }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  return (
    <div className="border-t border-darkOrange dark:border-background bg-lightOrange dark:bg-darkBlue p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-3 py-2 border border-darkOrange/30 dark:border-background/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-darkOrange dark:focus:ring-background focus:border-transparent disabled:bg-darkOrange/10 dark:disabled:bg-background/10 disabled:cursor-not-allowed font-body bg-background dark:bg-darkOrange text-darkOrange dark:text-background placeholder-darkOrange/50 dark:placeholder-background/50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="px-4 py-2 bg-darkOrange dark:bg-background text-background dark:text-darkOrange rounded-lg hover:bg-darkOrange/90 dark:hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-darkOrange dark:focus:ring-background focus:ring-offset-2 disabled:bg-darkOrange/30 dark:disabled:bg-background/30 disabled:cursor-not-allowed transition-colors font-body"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      
      <div className="mt-2 text-xs text-darkOrange/60 dark:text-background/60 font-body">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}; 
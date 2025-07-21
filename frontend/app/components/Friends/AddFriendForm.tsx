import { useState } from 'react';
import toast from 'react-hot-toast';

interface AddFriendFormProps {
  onSendRequest: (email: string) => Promise<void>;
  loading: boolean;
}

export const AddFriendForm = ({ onSendRequest, loading }: AddFriendFormProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email format.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSendRequest(email.trim());
      setEmail('');
    } catch (error) {
      // Error handling is done in useFriends hook, so we don't need to show toast here
      console.error('Friend request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-b border-darkOrange dark:border-background bg-lightOrange dark:bg-darkBlue">
      <h3 className="text-lg font-semibold text-darkOrange dark:text-background mb-4 font-title">Add Friend</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-darkOrange dark:text-background mb-2 font-body">
            Email Address
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              disabled={isSubmitting || loading}
              className="flex-1 min-w-0 px-3 py-2 border border-darkOrange/30 dark:border-background/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkOrange dark:focus:ring-background focus:border-transparent disabled:bg-darkOrange/10 dark:disabled:bg-background/10 disabled:cursor-not-allowed font-body bg-background dark:bg-darkOrange text-darkOrange dark:text-background placeholder-darkOrange/50 dark:placeholder-background/50"
            />
            <button
              type="submit"
              disabled={!email.trim() || isSubmitting || loading}
              className="flex-shrink-0 px-3 py-2 bg-darkOrange dark:bg-background text-background dark:text-darkOrange text-sm font-medium rounded-lg hover:bg-darkOrange/90 dark:hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-darkOrange dark:focus:ring-background focus:ring-offset-2 disabled:bg-darkOrange/50 dark:disabled:bg-background/50 disabled:cursor-not-allowed transition-colors font-body min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Sending...</span>
                  <span className="sm:hidden">...</span>
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">Send Request</span>
                  <span className="sm:hidden">Send</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="text-xs text-darkOrange/60 dark:text-background/60 font-body">
          <p>💡 Please enter the exact email address of the person.</p>
          <p className="mt-1">They will become your friend once they accept the request.</p>
        </div>
      </form>
    </div>
  );
}; 
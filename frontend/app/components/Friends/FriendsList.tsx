import { useState } from 'react';
import type { Friend } from '../../types/realtime.types';
import { useTranslation } from 'react-i18next';

interface FriendsListProps {
  friends: Friend[];
  onRemoveFriend: (friendId: string) => Promise<void>;
  onBlockFriend: (friendId: string) => Promise<void>;
  onStartChat: (friendId: string, friendName: string) => void;
  loading: boolean;
}

export const FriendsList = ({ 
  friends, 
  onRemoveFriend, 
  onBlockFriend, 
  onStartChat,
  loading 
}: FriendsListProps) => {
  const [expandedFriend, setExpandedFriend] = useState<string | null>(null);
  const { t } = useTranslation();

  const formatLastSeen = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleActionClick = (friendId: string) => {
    setExpandedFriend(expandedFriend === friendId ? null : friendId);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-lg font-medium font-title">{t('chat.noFriends')}</p>
        <p className="text-sm mt-1 font-body">{t('addFriendMsg')}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {friends.map(friend => (
        <div key={friend.id} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {friend.avatarUrl && friend.avatarUrl !== '' ? (
                    <img 
                      src={friend.avatarUrl} 
                      alt={friend.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium font-body">
                      {friend.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                
                {/* Online status */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>

              {/* Friend info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate font-body">
                    {friend.name}
                  </h3>
                  {friend.isOnline && (
                    <span className="text-xs text-green-600 font-medium font-body">{t('online')}</span>
                  )}
                </div>
                {!friend.isOnline && friend.lastSeen && (
                  <p className="text-xs text-gray-400 font-body">
                    {t('lastSeen')} {formatLastSeen(friend.lastSeen)}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Chat button */}
              <button
                onClick={() => onStartChat(friend.id, friend.name)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={t('chat.startChat')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>

              {/* More actions */}
              <button
                onClick={() => handleActionClick(friend.id)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('moreActions')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded actions */}
          {expandedFriend === friend.id && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    onRemoveFriend(friend.id);
                    setExpandedFriend(null);
                  }}
                  className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors font-body"
                >
                  {t('removeFriend')}
                </button>
                <button
                  onClick={() => {
                    onBlockFriend(friend.id);
                    setExpandedFriend(null);
                  }}
                  className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors font-body"
                >
                  {t('blockUser')}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 
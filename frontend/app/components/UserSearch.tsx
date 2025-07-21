import React, { useState, useEffect } from 'react';
import { searchUsers, type User } from '~/services/user.service';
import { FriendService } from '~/services/friend.service';
import { BiSearch } from 'react-icons/bi';

interface UserSearchProps {
  onUserSelect?: (user: User) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const users = await searchUsers(searchTerm.trim());
        setSearchResults(users);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSendFriendRequest = async (email: string) => {
    setSendingRequest(email);
    try {
      const success = await FriendService.sendFriendRequest(email);
      if (success) {
        alert('Friend request sent successfully!');
        setSearchResults(prev => prev.filter(user => user.email !== email));
      } else {
        alert('Failed to send friend request. User not found or request already exists.');
      }
    } catch (error) {
      alert('Failed to send friend request. Please try again.');
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-4">
        <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by email or name..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center py-4">
          <p className="font-body text-gray-500">Searching...</p>
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-title text-lg text-brown dark:text-darkBlue mb-2">
            Search Results ({searchResults.length})
          </h3>
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="font-body text-gray-600 dark:text-gray-400">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-body font-medium text-black dark:text-background">
                    {user.name}
                  </p>
                  <p className="font-body text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSendFriendRequest(user.email)}
                disabled={sendingRequest === user.email}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-body hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingRequest === user.email ? 'Sending...' : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!isSearching && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
        <div className="text-center py-4">
          <p className="font-body text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
}; 
import { useState } from 'react';
import type { Friend, Room } from '../../types/realtime.types';
import { AddFriendForm } from '../Friends/AddFriendForm';

interface ChatSidebarProps {
  // Rooms
  rooms: Array<Room & { unreadCount: number }>;
  currentRoomId: string | null;
  onRoomSelect: (roomId: string) => Promise<void>;
  onCreateRoom: () => void;
  onLeaveRoom: (roomId: string) => void;
  
  // Friends
  friends: Friend[];
  blockedFriends: Friend[];
  onFriendChat: (friendId: string, friendName: string) => void;
  onRemoveFriend: (friendId: string) => Promise<void>;
  onBlockFriend: (friendId: string) => Promise<void>;
  onUnblockFriend: (friendId: string) => Promise<void>;
  
  // Friend Requests
  pendingRequests: any[];
  onAcceptRequest: (requestId: string) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
  onSendFriendRequest: (email: string) => Promise<void>;
  
  // Connection status
  isConnected: boolean;
}

type SidebarTab = 'rooms' | 'friends' | 'requests';

export const ChatSidebar = ({ 
  rooms, 
  currentRoomId, 
  onRoomSelect, 
  onCreateRoom,
  onLeaveRoom,
  friends, 
  blockedFriends,
  onFriendChat,
  onRemoveFriend,
  onBlockFriend,
  onUnblockFriend,
  pendingRequests,
  onAcceptRequest,
  onRejectRequest,
  onSendFriendRequest,
  isConnected 
}: ChatSidebarProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('rooms');
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [expandedFriend, setExpandedFriend] = useState<string | null>(null);
  const [showBlockedFriends, setShowBlockedFriends] = useState(true);

  const handleRoomClick = async (roomId: string) => {
    if (roomId === currentRoomId) {
      setExpandedRoom(expandedRoom === roomId ? null : roomId);
    } else {
      try {
        await onRoomSelect(roomId);
        setExpandedRoom(null);
      } catch (error) {
        console.error('Failed to select room:', error);
      }
    }
  };

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

  const totalUnreadCount = rooms.reduce((total, room) => total + room.unreadCount, 0);
  const onlineFriends = friends.filter(friend => friend.isOnline);

  return (
    <div className="w-80 bg-lightOrange dark:bg-darkBlue border-r border-darkOrange dark:border-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-darkOrange dark:border-background">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-darkOrange dark:text-background font-title">Chat</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-darkOrange/70 dark:text-background/70 font-body">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex bg-darkOrange/20 dark:bg-background/20 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors font-body ${
              activeTab === 'rooms'
                ? 'bg-background dark:bg-darkOrange text-darkOrange dark:text-background shadow-sm'
                : 'text-darkOrange/80 dark:text-background/80 hover:text-darkOrange dark:hover:text-background'
            }`}
          >
            Rooms
            {totalUnreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {totalUnreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors font-body ${
              activeTab === 'friends'
                ? 'bg-background dark:bg-darkOrange text-darkOrange dark:text-background shadow-sm'
                : 'text-darkOrange/80 dark:text-background/80 hover:text-darkOrange dark:hover:text-background'
            }`}
          >
            Friends
            {onlineFriends.length > 0 && (
              <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                {onlineFriends.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors font-body ${
              activeTab === 'requests'
                ? 'bg-background dark:bg-darkOrange text-darkOrange dark:text-background shadow-sm'
                : 'text-darkOrange/80 dark:text-background/80 hover:text-darkOrange dark:hover:text-background'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingRequests.length}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'rooms' && (
          <div>
            {/* Create room button */}
            <div className="p-4 border-b border-darkOrange/20 dark:border-background/20">
              <button
                onClick={onCreateRoom}
                className="w-full py-2 px-4 bg-darkOrange dark:bg-background text-background dark:text-darkOrange rounded-lg hover:bg-darkOrange/90 dark:hover:bg-background/90 transition-colors font-body"
              >
                + Create Room
              </button>
            </div>

            {/* Rooms list */}
            <div className="divide-y divide-darkOrange/20 dark:divide-background/20">
              {rooms.map(room => (
                <div 
                  key={room.id} 
                  className="p-4 hover:bg-darkOrange/10 dark:hover:bg-background/10 transition-colors cursor-pointer"
                  onClick={() => handleRoomClick(room.id).catch(console.error)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-darkOrange dark:text-background truncate font-body">
                          {room.name}
                        </h3>
                        {room.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-darkOrange/60 dark:text-background/60 font-body">
                        {room.memberCount} members
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {room.id === currentRoomId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLeaveRoom(room.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            {/* Blocked friends section */}
            <div className="p-4 border-b border-darkOrange/20 dark:border-background/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-darkOrange dark:text-background font-body">
                  Blocked Friends ({blockedFriends.length})
                </h3>
                <button
                  onClick={() => setShowBlockedFriends(!showBlockedFriends)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-body"
                >
                  {showBlockedFriends ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showBlockedFriends && (
                <div className="space-y-2">
                  {blockedFriends.length === 0 ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500 font-body">No blocked friends</p>
                    </div>
                  ) : (
                    blockedFriends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            {friend.avatarUrl ? (
                              <img 
                                src={friend.avatarUrl} 
                                alt={friend.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 text-xs font-medium font-body">
                                {friend.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-body truncate">
                            {friend.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onUnblockFriend(friend.id)}
                          className="text-xs text-green-600 hover:text-green-700 font-body"
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Friends list */}
            <div className="divide-y divide-darkOrange/20 dark:divide-background/20">
              {friends.length === 0 ? (
                <div className="p-4 text-center text-darkOrange/60 dark:text-background/60">
                  <p className="font-body">No friends yet</p>
                </div>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="p-4 hover:bg-darkOrange/10 dark:hover:bg-background/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            {friend.avatarUrl ? (
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
                            <h3 className="text-sm font-medium text-darkOrange dark:text-background truncate font-body">
                              {friend.name}
                            </h3>
                            {friend.isOnline && (
                              <span className="text-xs text-green-600 font-medium font-body">online</span>
                            )}
                          </div>
                          {!friend.isOnline && friend.lastSeen && (
                            <p className="text-xs text-darkOrange/60 dark:text-background/60 font-body">
                              Last seen: {formatLastSeen(friend.lastSeen)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {/* Chat button */}
                        <button
                          onClick={() => onFriendChat(friend.id, friend.name)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Start chat"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>

                        {/* More actions */}
                        <button
                          onClick={() => setExpandedFriend(expandedFriend === friend.id ? null : friend.id)}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More actions"
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
                            Remove
                          </button>
                          <button
                            onClick={() => {
                              onBlockFriend(friend.id);
                              setExpandedFriend(null);
                            }}
                            className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors font-body"
                          >
                            Block
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {/* Add Friend Form */}
            <div className="p-4 border-b border-darkOrange/20 dark:border-background/20">
              <h3 className="text-sm font-medium text-darkOrange dark:text-background mb-3 font-body">
                Add Friend
              </h3>
              <AddFriendForm onSendRequest={onSendFriendRequest} loading={false} />
            </div>

            {/* Pending Requests */}
            <div className="divide-y divide-darkOrange/20 dark:divide-background/20">
              {pendingRequests.length === 0 ? (
                <div className="p-4 text-center text-darkOrange/60 dark:text-background/60">
                  <p className="font-body">No pending requests</p>
                </div>
              ) : (
                pendingRequests.map(request => (
                  <div key={request.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg m-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                          {request.requesterAvatar ? (
                            <img 
                              src={request.requesterAvatar} 
                              alt={request.requesterName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-medium font-body">
                              {request.requesterName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>

                        {/* Request info */}
                        <div>
                          <h3 className="text-sm font-medium text-darkOrange dark:text-background font-body">
                            {request.requesterName}
                          </h3>
                          <p className="text-xs text-darkOrange/60 dark:text-background/60 font-body">
                            Wants to be your friend
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onAcceptRequest(request.id)}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-body"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => onRejectRequest(request.id)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-body"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}; 
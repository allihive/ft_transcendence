import { useEffect, useRef, useState } from 'react';
import { ChatMessageComponent } from './ChatMessage';
import { MessageInput } from './MessageInput';
import type { ChatMessage, RoomMember, Friend } from '../../types/realtime.types';
import { roomAPI } from '../../api/room';
import toast from 'react-hot-toast';
import { useFriends } from '../../stores/useFriends';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  messages: ChatMessage[];
  members: RoomMember[];
  currentUserId: string;
  onSendMessage: (roomId: string, content: string) => void;
  isConnected: boolean;
}

export const ChatRoom = ({ 
  roomId, 
  roomName, 
  messages, 
  members, 
  currentUserId, 
  onSendMessage,
  isConnected
}: ChatRoomProps) => {
  const { friends } = useFriends();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (content: string) => {
    console.log('🔍 ChatRoom handleSendMessage called:', {
      content,
      roomId,
      isConnected,
      connectionStatus: isConnected ? 'connected' : 'disconnected'
    });
    
    if (!isConnected) {
      toast.error('Not connected to chat server. Please wait...');
      return;
    }
    
    onSendMessage(roomId, content);
  };

  const handleInviteFriends = async () => {
    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend to invite.');
      return;
    }

    setIsInviting(true);
    try {
      const selectedFriendNames = friends
        .filter(friend => selectedFriends.includes(friend.id))
        .map(friend => friend.name);

      const response = await roomAPI.inviteUsersToRoom(roomId, selectedFriendNames);
      
      if (response.success.length > 0) {
        toast.success(`Successfully invited ${response.success.length} friend(s)!`);
      }
      
      if (response.failed.length > 0) {
        const failedNames = response.failed.map(f => f.name).join(', ');
        toast.error(`Failed to invite: ${failedNames}`);
      }
      
      setShowInviteModal(false);
      setSelectedFriends([]);
    } catch (error) {
      toast.error('Failed to invite friends. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  // members에서 필터링하되, friends에서 온라인 상태를 가져와서 사용
  const onlineMembers = members.filter(member => {
    const friend = friends.find(f => f.id === member.userId);
    return friend?.isOnline;
  });

  const offlineMembers = members.filter(member => {
    const friend = friends.find(f => f.id === member.userId);
    return !friend?.isOnline;
  });
  
  // Filter out friends who are already in the room
  const availableFriends = friends.filter((friend: Friend) => 
    !members.some(member => member.userId === friend.id)
  );

  return (
    <div className="flex h-full bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-lightOrange dark:bg-darkBlue border-b border-darkOrange dark:border-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-darkOrange dark:text-background font-title">{roomName}</h2>
              <p className="text-sm text-darkOrange/70 dark:text-background/70 font-body">
                {members.length} members • {onlineMembers.length} online
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Invite Friends Button */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-body"
              >
                Invite Friends
              </button>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-darkOrange/70 dark:text-background/70 font-body">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="text-center text-darkOrange/50 dark:text-background/50 font-body">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  isOwnMessage={message.payload.userId === currentUserId}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isConnected}
          placeholder={
            isConnected 
              ? "Type a message..." 
              : "Connecting to chat server..."
          }
        />
      </div>

      {/* Members Sidebar */}
      <div className="w-64 bg-lightOrange dark:bg-darkBlue border-l border-darkOrange dark:border-background">
        <div className="p-4 border-b border-darkOrange dark:border-background">
          <h3 className="text-sm font-medium text-darkOrange dark:text-background font-body">Members</h3>
        </div>
        
        <div className="p-4">
          {/* Online Members */}
          {onlineMembers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-green-600 mb-2 font-body">Online ({onlineMembers.length})</h4>
              <div className="space-y-1">
                {onlineMembers.map((member: RoomMember) => (
                  <div key={member.userId} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-darkOrange dark:text-background font-body">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Offline Members */}
          {offlineMembers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 font-body">Offline ({offlineMembers.length})</h4>
              <div className="space-y-1">
                {offlineMembers.map((member: RoomMember) => (
                  <div key={member.userId} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-darkOrange/60 dark:text-background/60 font-body">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-lightOrange dark:bg-darkBlue border border-darkOrange dark:border-background rounded-lg p-6 w-96 max-h-96 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-darkOrange dark:text-background font-title">Invite Friends</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setSelectedFriends([]);
                }}
                className="text-darkOrange/60 dark:text-background/60 hover:text-darkOrange dark:hover:text-background transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {availableFriends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-darkOrange/60 dark:text-background/60 font-body">All your friends are already in this room!</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto mb-4">
                  <div className="space-y-2">
                    {availableFriends.map((friend: Friend) => (
                      <label key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-darkOrange/10 dark:hover:bg-background/10 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={() => toggleFriendSelection(friend.id)}
                          className="rounded border-darkOrange/30 dark:border-background/30"
                        />
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm text-darkOrange dark:text-background font-body">{friend.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setSelectedFriends([]);
                    }}
                    className="flex-1 py-2 px-4 text-darkOrange dark:text-background bg-background/50 dark:bg-darkOrange/50 border border-darkOrange/30 dark:border-background/30 rounded-lg hover:bg-background/70 dark:hover:bg-darkOrange/70 transition-colors font-body"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteFriends}
                    disabled={selectedFriends.length === 0 || isInviting}
                    className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-body"
                  >
                    {isInviting ? 'Inviting...' : `Invite (${selectedFriends.length})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 
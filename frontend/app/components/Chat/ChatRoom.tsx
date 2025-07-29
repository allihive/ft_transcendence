import { useEffect, useRef, useState } from 'react';
import { ChatMessageComponent } from './ChatMessage';
import { MessageInput } from './MessageInput';
import type { ChatMessage, RoomMember, Friend } from '../../types/realtime.types';
import { roomAPI } from '../../api/room';
import toast from 'react-hot-toast';
import { useFriends } from '../../stores/useFriends';
import { useTranslation } from 'react-i18next';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  messages: ChatMessage[];
  members: RoomMember[];
  currentUserId: string;
  onSendMessage: (roomId: string, content: string) => void;
  isConnected: boolean;
  lastReadTimestamp?: number;
}

export const ChatRoom = ({ 
  roomId, 
  roomName, 
  messages, 
  members, 
  currentUserId, 
  onSendMessage,
  isConnected,
  lastReadTimestamp
}: ChatRoomProps) => {

  const friendsStore = useFriends();
  const { friends } = friendsStore;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastReadMessageRef = useRef<HTMLDivElement>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  // const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
  const { t } = useTranslation();

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      // Always scroll to bottom for new messages, regardless of current position
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      // setIsAtBottom(true);
    }
  }, [messages]);

  //let the last read message to the center-top of the container
  useEffect(() => {
    if (messagesContainerRef.current && lastReadMessageRef.current && !hasRestoredScroll && messages.length > 0) {
      // Use multiple requestAnimationFrame calls to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (messagesContainerRef.current && lastReadMessageRef.current) {
              const container = messagesContainerRef.current;
              const lastReadElement = lastReadMessageRef.current;
              
              //set the last read message to the center-top of the container
              const containerHeight = container.clientHeight;
              const elementTop = lastReadElement.offsetTop;
              const targetScrollTop = elementTop - (containerHeight * 0.25); // up 25% of the container height
              
              container.scrollTop = Math.max(0, targetScrollTop);
              setHasRestoredScroll(true);
              
              // Check if we're at bottom after positioning
              // const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
              // setIsAtBottom(isNearBottom);
              // console.log(`🎯 Positioned last read message for room ${roomId} at center-top`);
            }
          });
        });
      });
    } else if (messagesContainerRef.current && !lastReadTimestamp && !hasRestoredScroll && messages.length > 0) {
      // lastReadTimestamp not set, position at bottom
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
              setHasRestoredScroll(true);
              // setIsAtBottom(true);
              // console.log(`📜 No lastReadTimestamp for room ${roomId}, positioning at bottom`);
            }
          });
        });
      });
    }

    return () => {
      if (messagesContainerRef.current) {
        const currentScrollTop = messagesContainerRef.current.scrollTop;
        sessionStorage.setItem(`chatScroll_${roomId}`, currentScrollTop.toString());
        // console.log(`📜 Saved scroll position for room ${roomId}: ${currentScrollTop}`);
      }
    };
  }, [roomId, hasRestoredScroll, messages.length, lastReadTimestamp]);

  // reset scroll state when room changes
  useEffect(() => {
    // console.log(`🔄 Room changed to ${roomId}, resetting scroll state`);
    setHasRestoredScroll(false);
    // setIsAtBottom(true);
  }, [roomId]);

  // scroll event detection
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
      // setIsAtBottom(isNearBottom);
    }
  };

  const handleSendMessage = (content: string) => {

    if (!isConnected) {
      toast.error(t('chatError.chatServerFailure'));
      return;
    }
    
    onSendMessage(roomId, content);
    
    // Force scroll to bottom when sending message
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        // setIsAtBottom(true);
      }
    }, 100);
  };

  const handleInviteFriends = async () => {
    if (selectedFriends.length === 0) {
      toast.error(t('chatError.selectFriend'));
      return;
    }

    // Debug authentication state
    // console.log('🔍 ChatRoom - Authentication check before invite:');
    // console.log('🔍 Current user:', user);
    // console.log('🔍 User ID:', user?.id);
    // console.log('🔍 User name:', user?.name);
    // console.log('🔍 Is user logged in:', !!user);

    setIsInviting(true);
    try {
      const selectedFriendNames = friends
        .filter(friend => selectedFriends.includes(friend.id))
        .map(friend => friend.name);

      console.log('🔍 Inviting friends:', selectedFriendNames);
      console.log('🔍 Room ID:', roomId);

      const response = await roomAPI.inviteUsersToRoom(roomId, selectedFriendNames);
      
      if (response.success.length > 0) {
        toast.success(t('chat.inviteSucccess', {name: response.success.length}));
      }
      
      if (response.failed.length > 0) {
        const failedMessages = response.failed.map(f => `${f.name} (${f.reason})`).join(', ');
        toast.error(t('chatError.inviteFailure', {name: failedMessages}));
      }
    
      setShowInviteModal(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error('❌ Invite error:', error);
      toast.error(t('chatError.invite'));
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

  const onlineMembers = members.filter(member => {
    return member.isOnline;
  });

  const offlineMembers = members.filter(member => {
    return !member.isOnline;
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
                {members.length} {t('chat.members')} • {onlineMembers.length} {t('online')}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Invite Friends Button */}
              <button
                onClick={async () => {
                  // Refresh friends list before opening invite modal
                  try {
                    await friendsStore.loadFriends();
                    console.log('✅ Refreshed friends list for invite modal');
                  } catch (error) {
                    console.error('❌ Failed to refresh friends list:', error);
                  }
                  setShowInviteModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-body"
              >
                {t('chat.invite')}
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
        <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef} onScroll={handleScroll}>
          {messages.length === 0 ? (
            <div className="text-center text-darkOrange/50 dark:text-background/50 font-body">
              {t('chat.noMessages')}
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(-1000) // only keep the most recent 1000 messages
                .map((message, index, sortedMessages) => {
                  const prevMessage = index > 0 ? sortedMessages[index - 1] : null;
                  const showSender = !prevMessage || 
                    prevMessage.payload.userId !== message.payload.userId ||
                    message.timestamp - prevMessage.timestamp > 300000; //show sender if 5 minutes passed
                  
                  //the closest message to the lastReadTimestamp
                  const isLastReadMessage = lastReadTimestamp && 
                    message.timestamp > lastReadTimestamp &&
                    (!prevMessage || prevMessage.timestamp <= lastReadTimestamp);
                  
                  return (
                    <div 
                      key={`${message.id}-${index}`}
                      ref={isLastReadMessage ? lastReadMessageRef : undefined}
                    >
                      <ChatMessageComponent
                        message={message}
                        isOwnMessage={message.payload.userId === currentUserId}
                        showSender={showSender}
                      />
                    </div>
                  );
                })}
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
          <h3 className="text-sm font-medium text-darkOrange dark:text-background font-body">{t('chat.members')}</h3>
        </div>
        
        <div className="p-4">
          {/* Online Members */}
          {onlineMembers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-green-600 mb-2 font-body">{t('Online')} ({onlineMembers.length})</h4>
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
              <h4 className="text-xs font-medium text-gray-500 mb-2 font-body">{t('Offline')} ({offlineMembers.length})</h4>
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
              <h3 className="text-lg font-medium text-darkOrange dark:text-background font-title">{t('chat.invite')}</h3>
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
                <p className="text-darkOrange/60 dark:text-background/60 font-body">{t('chat.allFriends')}</p>
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
                    {t('cancel')}
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChatSidebar } from '../../components/Sidebar/ChatSidebar';
import { ChatRoom } from '../../components/Chat/ChatRoom';
import { useChat } from '../../stores/useChat';
import { useFriends } from '../../stores/useFriends';
import { useAuth } from '../../stores/useAuth';
import { websocketService } from '../../services/websocket.service';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';


const ChatPage = () => {
  const navigate = useNavigate();
  const { user, isLoggingIn } = useAuth();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const { t } = useTranslation();

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🔍 ChatPage redirect check:', { isLoggingIn, user: user ? 'exists' : 'null' });
    if (!isLoggingIn && !user) {
      console.log('🚨 Redirecting to login - user is null');
      navigate('/login');
    }
  }, [isLoggingIn, user, navigate]);

  if (!user) {
    return null;
  }
  // Chat state + connect to WebSocket
  const chat = useChat(user.id, user.name);
  
  // Friends state
  const friends = useFriends();

  // Load initial data
  useEffect(() => {
    // once user is logged in, initialize chat
    if (!user) {
      console.log('⏳ User not logged in, skipping chat initialization');
      return;
    }

    const initializeChat = async () => {
      try {
        console.log('🔄 Initializing chat for user:', user.name);
        
        // Load user's room list
        await chat.loadUserRooms();
        
        // Load friend data
        await friends.loadFriends();
        await friends.loadPendingRequests();
        
        console.log('✅ Chat initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize chat:', error);
      }
    };

    initializeChat();
  
    return () => {
      console.log('🛑 ChatPage unmounting, WebSocket connection maintained globally');
    };
  }, [user]);


  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      await chat.createRoom(newRoomName.trim());
      setShowCreateRoomModal(false);
      setNewRoomName('');
      toast.success(t('chat.roomSuccess',{name: newRoomName.trim()}));
    } catch (error) {
      console.error('Failed to create room:', error);
      const errorMessage = error instanceof Error ? error.message : t('chatError.roomFailure');
      toast.error(errorMessage);
    }
  };

  const currentRoom = chat.currentRoom;

  return (
    <div className="h-screen bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange flex">
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Sidebar */}
        <ChatSidebar
          rooms={chat.rooms}
          currentRoomId={chat.currentRoomId}
          onRoomSelect={async (roomId: string) => {
            try {
              await chat.setCurrentRoom(roomId);
            } catch (error) {
              console.error('Failed to select room:', error);
              toast.error(t('charError.joinRoomFailure'));
            }
          }}
          onCreateRoom={() => setShowCreateRoomModal(true)}
          onLeaveRoom={chat.leaveRoom}
          friends={friends.friends}
          blockedFriends={friends.blockedFriends}
          onRemoveFriend={friends.removeFriend}
          onBlockFriend={friends.blockFriend}
          onUnblockFriend={friends.unblockFriend}
          pendingRequests={friends.pendingRequests}
          onAcceptRequest={friends.acceptFriendRequest}
          onRejectRequest={friends.rejectFriendRequest}
          onSendFriendRequest={friends.sendFriendRequest}
          isConnected={chat.connectionStatus === 'connected'}
        />

        {/* Chat Area */}
        <div className="flex-1">
          {currentRoom ? (
            <ChatRoom
              roomId={currentRoom.id}
              roomName={currentRoom.name}
              messages={currentRoom.messages}
              members={currentRoom.members}
              currentUserId={user.id}
              onSendMessage={chat.sendMessage}
              isConnected={chat.connectionStatus === 'connected'}
              lastReadTimestamp={currentRoom.lastReadTimestamp}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-background/50 dark:bg-darkBlue/50">
              <div className="text-center text-darkOrange/70 dark:text-background/70">
                <svg className="w-16 h-16 mx-auto mb-4 text-darkOrange/50 dark:text-background/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-medium mb-2 font-title">{t('chat.selectChatRoom')}</h3>
                <p className="text-sm font-body">{t('chat.selectOrCreate')}.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-lightOrange dark:bg-darkBlue border border-darkOrange dark:border-background rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-darkOrange dark:text-background mb-4 font-title">{t('chat.createRoom')}</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-darkOrange dark:text-background mb-2 font-body">
                  {t('chat.roomName')}
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder={t('chat.roomName')}
                  className="w-full px-3 py-2 border border-darkOrange/30 dark:border-background/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkOrange dark:focus:ring-background focus:border-transparent bg-background dark:bg-darkOrange text-darkOrange dark:text-background placeholder-darkOrange/50 dark:placeholder-background/50 font-body"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreateRoomModal(false);
                    setNewRoomName('');
                  }}
                  className="flex-1 py-2 px-4 text-darkOrange dark:text-background bg-background/50 dark:bg-darkOrange/50 border border-darkOrange/30 dark:border-background/30 rounded-lg hover:bg-background/70 dark:hover:bg-darkOrange/70 transition-colors font-body"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoomName.trim()}
                  className="flex-1 py-2 px-4 bg-darkOrange dark:bg-background text-background dark:text-darkOrange rounded-lg hover:bg-darkOrange/90 dark:hover:bg-background/90 disabled:bg-darkOrange/50 dark:disabled:bg-background/50 disabled:cursor-not-allowed transition-colors font-body"
                >
                  {t('create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection status indicator - small and clean */}
      <div className="fixed bottom-4 right-4">
        {chat.connectionStatus === 'connecting' && (
          <div className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-body flex items-center space-x-2">
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{t('connecting')}...</span>
          </div>
        )}
        
        {chat.connectionStatus === 'error' && (
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-body flex items-center space-x-2">
            <span>{t('connectionFailure')}</span>
            <button
              onClick={() => websocketService.connect()}
              className="text-white hover:text-gray-200 underline"
            >
              {t('retry')}
            </button>
          </div>
        )}
        
        {friends.error && (
          <div className="bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-body flex items-center space-x-2 mt-2">
            <span>{t('chatError.friendList')}</span>
            <button
              onClick={() => friends.clearError()}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 
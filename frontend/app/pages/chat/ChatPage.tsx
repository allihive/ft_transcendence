import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChatSidebar } from '../../components/Sidebar/ChatSidebar';
import { ChatRoom } from '../../components/Chat/ChatRoom';
import { useChat } from '../../stores/useChat';
import { useFriends } from '../../stores/useFriends';
import { useAuth } from '../../stores/useAuth';
import { websocketService } from '../../services/websocket.service';
import toast from 'react-hot-toast';


const ChatPage = () => {
  const navigate = useNavigate();
  const { user, isLoggingIn } = useAuth();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggingIn && !user) {
      navigate('/login');
    }
  }, [isLoggingIn, user, navigate]);

  // Don't render anything while loading or if no user
  if (isLoggingIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
        <div className="text-center text-darkOrange dark:text-background">
          <div className="animate-spin w-8 h-8 border-2 border-darkOrange dark:border-background border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Chat state
  const chat = useChat(user.id, user.name);
  
  // Friends state
  const friends = useFriends();

  // Load initial data and connect to WebSocket
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Load user's room list
        await chat.loadUserRooms();
        
        // Connect to WebSocket
        await chat.connectWebSocket();
        
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
      chat.disconnectWebSocket();
    };
  }, []);

  // 스크롤 위치 복원
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('chatPageScrollPosition');
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
      }, 100);
    }

    return () => {
      sessionStorage.setItem('chatPageScrollPosition', window.scrollY.toString());
    };
  }, []);

  // Set up WebSocket handlers for friends - useChat에서 이미 연결하므로 핸들러만 추가
  useEffect(() => {
    // useChat에서 이미 WebSocket을 연결하므로, 여기서는 핸들러만 추가
    const friendHandlers = {
      onFriendRequest: (message: any) => {
        console.log('Friend request received:', message);
        friends.loadPendingRequests();
      },
      onFriendRequestResponse: (message: any) => {
        console.log('Friend request response:', message);
        friends.loadFriends();
        friends.loadPendingRequests();
      },
      onFriendList: (message: any) => {
        friends.handleFriendListUpdate(message);
      },
      onErrorMessage: (message: any) => {
        console.log('WebSocket error message:', message);
        
        // 친구 목록 업데이트 에러 처리
        if (message.payload?.code === 'FRIEND_LIST_UPDATE_ERROR') {
          friends.handleFriendListError(message);
        }
      }
    };

    // 기존 핸들러에 친구 핸들러 추가
    websocketService.addEventHandlers(friendHandlers);
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      await chat.createRoom(newRoomName.trim());
      setShowCreateRoomModal(false);
      setNewRoomName('');
      toast.success(`Room "${newRoomName.trim()}" created successfully!`);
    } catch (error) {
      console.error('Failed to create room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      toast.error(errorMessage);
    }
  };

  const handleFriendChat = (friendId: string, friendName: string) => {
    // For demo, create a private room with the friend
    // In real implementation, you might want to check if a private room already exists
    console.log(`Starting chat with ${friendName} (${friendId})`);
    // Implementation depends on your private messaging strategy
  };

  const currentRoom = chat.rooms.find(room => room.id === chat.currentRoomId);

  return (
    <div className="h-screen bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange flex">
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Sidebar */}
        <ChatSidebar
          rooms={chat.rooms.map(room => ({ ...room, unreadCount: room.unreadCount || 0 }))}
          currentRoomId={chat.currentRoomId}
          onRoomSelect={async (roomId: string) => {
            try {
              await chat.setCurrentRoom(roomId);
            } catch (error) {
              console.error('Failed to select room:', error);
              toast.error('Failed to join room. Please try again.');
            }
          }}
          onCreateRoom={() => setShowCreateRoomModal(true)}
          onLeaveRoom={chat.leaveRoom}
          friends={friends.friends}
          blockedFriends={friends.blockedFriends}
          onFriendChat={handleFriendChat}
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
              friends={friends.friends}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-background/50 dark:bg-darkBlue/50">
              <div className="text-center text-darkOrange/70 dark:text-background/70">
                <svg className="w-16 h-16 mx-auto mb-4 text-darkOrange/50 dark:text-background/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-medium mb-2 font-title">Select a chat room</h3>
                <p className="text-sm font-body">Select a chat room from the left or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-lightOrange dark:bg-darkBlue border border-darkOrange dark:border-background rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-darkOrange dark:text-background mb-4 font-title">Create New Room</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-darkOrange dark:text-background mb-2 font-body">
                  Room Name
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
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
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoomName.trim()}
                  className="flex-1 py-2 px-4 bg-darkOrange dark:bg-background text-background dark:text-darkOrange rounded-lg hover:bg-darkOrange/90 dark:hover:bg-background/90 disabled:bg-darkOrange/50 dark:disabled:bg-background/50 disabled:cursor-not-allowed transition-colors font-body"
                >
                  Create
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
            <span>Connecting to chat...</span>
          </div>
        )}
        
        {chat.connectionStatus === 'error' && (
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-body flex items-center space-x-2">
            <span>⚠️ Connection failed</span>
            <button
              onClick={() => chat.connectWebSocket()}
              className="text-white hover:text-gray-200 underline"
            >
              Retry
            </button>
          </div>
        )}
        
        {friends.error && (
          <div className="bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-body flex items-center space-x-2 mt-2">
            <span>Failed to load friends list</span>
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
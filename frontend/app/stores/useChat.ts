import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../services/websocket.service';
import { roomAPI } from '../api/room';
import type { 
  ChatMessage, 
  SyncMessage, 
  Room,
  ConnectionStatus,
  WebSocketEventHandlers,
  UnreadCountMessage,
  RoomMember,
  RoomStateMessage,
  UserStatusMessage
} from '../types/realtime.types';

interface ChatRoom extends Room {
  messages: ChatMessage[];
  members: RoomMember[];
  lastReadTimestamp?: number;
  unreadCount: number;
}

interface UseChatState {
  rooms: ChatRoom[];
  // friends: Friend[];
  currentRoomId: string | null;
  connectionStatus: ConnectionStatus;
  loading: boolean;
  error: string | null;
}

interface UseChatActions {
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  loadUserRooms: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => void;
  createRoom: (name: string, description?: string, isPrivate?: boolean) => Promise<Room>;
  inviteUsersToRoom: (roomId: string, userNames: string[]) => Promise<void>;
  setCurrentRoom: (roomId: string | null) => void;
  clearError: () => void;
}

export const useChat = (userId: string, userName: string): UseChatState & UseChatActions => {
  const [state, setState] = useState<UseChatState>({
    rooms: [],
    currentRoomId: null,
    connectionStatus: 'disconnected',
    loading: false,
    error: null
  });

  const handlersRef = useRef<WebSocketEventHandlers>({
    onOpen: () => {
      console.log('🎉 WebSocket onOpen event triggered (before setState)');
      setState(prev => {
        console.log('setState: connectionStatus changing from', prev.connectionStatus, 'to connected');
        return { ...prev, connectionStatus: 'connected' };
      });
    },

    onClose: () => {
      console.log('🛑 WebSocket onClose event triggered (before setState)');
      setState(prev => {
        console.log('setState: connectionStatus changing from', prev.connectionStatus, 'to disconnected');
        return { ...prev, connectionStatus: 'disconnected' };
      });
    },

    onError: (error) => {
      console.log('❌ WebSocket onError event triggered (before setState)', error);
      setState(prev => {
        console.log('setState: connectionStatus changing from', prev.connectionStatus, 'to error');
        return { ...prev, connectionStatus: 'error' };
      });
    },

    onChatMessage: (message: ChatMessage) => {
      console.log(`📨 Chat message received: ${message.payload.content} in room ${message.payload.roomId}`);
      
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === message.payload.roomId) {
            return {
              ...room,
              messages: [...room.messages, message],
              unreadCount: room.id === prev.currentRoomId ? 0 : room.unreadCount + 1
            };
          }
          return room;
        })
      }));
    },

    onSync: (message: SyncMessage) => {
      const { roomId, users, messages } = message.payload;
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === roomId) {
            return {
              ...room,
              // 백엔드에서 보낸 messages는 ChatMessagePayload[]이므로 ChatMessage로 변환
              messages: messages.map(msg => ({
                id: crypto.randomUUID(), // 백엔드에서 id를 제공하지 않으므로 생성
                timestamp: Date.now(), // 백엔드에서 timestamp를 제공하지 않으므로 생성
                version: '1.0',
                type: 'chat' as const,
                payload: msg
              })),
              members: users.map(user => ({
                userId: user.userId,
                name: user.name,
                joinedAt: new Date().toISOString(), // 백엔드에서 제공하지 않으므로 생성
                isOnline: user.status === 'online'
              }))
            };
          }
          return room;
        })
      }));
    },

    onRoomState: (message: RoomStateMessage) => {
      const { room, previousMessages, unreadMessages, members, readState } = message.payload;
      const allMessages = [...previousMessages, ...unreadMessages];
      
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(existingRoom => {
          if (existingRoom.id === room.id) {
            return {
              ...existingRoom,
              ...room,
              // 백엔드에서 보낸 메시지들을 ChatMessage로 변환
              messages: allMessages.map(msg => ({
                id: msg.id,
                timestamp: parseInt(msg.timestamp),
                version: '1.0',
                type: 'chat' as const,
                payload: {
                  roomId: room.id,
                  userId: msg.userId,
                  name: msg.userName,
                  content: msg.content,
                  messageType: msg.messageType as 'text' | 'image' | 'file'
                }
              })),
              members: members, // 백엔드에서 이미 RoomMember[] 형태로 제공
              unreadCount: readState.unreadCount
            };
          }
          return existingRoom;
        })
      }));
    },

    onRoomJoined: (message) => {
      console.log('🏠 Room joined:', message);
    },

    onReconnect: () => {
      console.log('🔄 WebSocket reconnected, restoring room sync...');
      // Restore room sync after reconnection
      setState(current => {
        console.log(`🔄 Restoring sync for ${current.rooms.length} rooms after reconnection`);
        current.rooms.forEach(room => {
          console.log(`🔄 Restoring sync for room: ${room.name} (${room.id})`);
          websocketService.requestRoomSync(room.id);
        });
        return current;
      });
    },

    onUnreadCount: (message: UnreadCountMessage) => {
      const { roomId, unreadCount } = message.payload;
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room =>
          room.id === roomId ? { ...room, unreadCount } : room
        )
      }));
    },
  });

  // Load user's rooms
  const loadUserRooms = useCallback(async () => {
    console.log('🔄 Starting to load user rooms for userId:', userId);
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const roomsData = await roomAPI.getUserRooms(userId);
      console.log('📋 Raw rooms data from API:', roomsData);
      
      // Load member information for each room
      const rooms: ChatRoom[] = await Promise.all(
        roomsData.roomList.map(async (room) => {
          console.log(`🔄 Loading members for room: ${room.name} (${room.id})`);
          try {
            const members = await roomAPI.getRoomMembers(room.id);
            console.log(`✅ Loaded ${members.length} members for room ${room.name}`);
            return {
              ...room,
              messages: [],
              members: members.map(m => ({
                userId: m.userId,
                name: m.name,
                joinedAt: new Date().toISOString(), //the server does not provide this value
                isOnline: m.isOnline
              })),
              unreadCount: 0
            };
          } catch (error) {
            console.warn(`Failed to load members for room ${room.id}:`, error);
            return {
              ...room,
              messages: [],
              members: [],
              unreadCount: 0
            };
          }
        })
      );
      
      console.log(`✅ Final rooms data:`, rooms);
      setState(prev => ({ ...prev, rooms, loading: false }));
      console.log(`✅ Loaded ${rooms.length} rooms with member information for user`);
    } catch (error) {
      console.error('❌ Error loading user rooms:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load rooms',
        loading: false
      }));
    }
  }, [userId]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(async () => {
    console.log('🔄 Starting WebSocket connection...');
    console.log('🔍 Current connection status before connect:', state.connectionStatus);
    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));
    
    try {
      console.log('🔍 Connecting with handlers:', handlersRef.current);
      await websocketService.connect(handlersRef.current);
      console.log('✅ WebSocket connection established successfully');
      console.log('🔍 Connection status after connect:', state.connectionStatus);
      
      // After successful connection, sync all rooms
      setState(current => {
        console.log(`🔄 Current state before sync:`, {
          roomsCount: current.rooms.length,
          rooms: current.rooms.map(r => ({ id: r.id, name: r.name })),
          connectionStatus: current.connectionStatus
        });
        
        console.log(`🔄 Syncing ${current.rooms.length} rooms after WebSocket connection`);
        current.rooms.forEach(room => {
          console.log(`🔄 Syncing room: ${room.name} (${room.id})`);
          websocketService.requestRoomSync(room.id);
        });
        return current;
      });
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      setState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Failed to connect'
      }));
      
      // Auto-retry connection after 5 seconds
      setTimeout(() => {
        console.log('🔄 Auto-retrying WebSocket connection...');
        connectWebSocket();
      }, 5000);
    }
  }, [state.connectionStatus]);

  // Disconnect from WebSocket
  const disconnectWebSocket = useCallback(() => {
    websocketService.disconnect();
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
  }, []);

  // Join a room
  const joinRoom = useCallback(async (roomId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Get room details from API
      const roomData = await roomAPI.getRoom(roomId);
      const members = await roomAPI.getRoomMembers(roomId);

      // Add room to state if not already present
      setState(prev => {
        const existingRoom = prev.rooms.find(r => r.id === roomId);
        if (!existingRoom) {
          const newRoom: ChatRoom = {
            ...roomData,
            messages: [],
            members: members.map(m => ({
              userId: m.userId,
              name: m.name,
              joinedAt: new Date().toISOString(), // API에서 제공하지 않으므로 생성
              isOnline: m.isOnline
            })),
            unreadCount: 0
          };
          return {
            ...prev,
            rooms: [...prev.rooms, newRoom],
            loading: false
          };
        }
        return { ...prev, loading: false };
      });

      // Request sync for this room
      websocketService.requestRoomSync(roomId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to join room',
        loading: false
      }));
    }
  }, []);

  // Leave a room
  const leaveRoom = useCallback(async (roomId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await roomAPI.leaveRoom(roomId);
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId),
        currentRoomId: prev.currentRoomId === roomId ? null : prev.currentRoomId,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to leave room',
        loading: false
      }));
    }
  }, []);

  // Send a message to a room
  const sendMessage = useCallback((roomId: string, content: string) => {
    console.log('🔍 useChat sendMessage called:', { roomId, content, userId, userName });
    console.log('🔍 Current connection status:', state.connectionStatus);
    console.log('🔍 WebSocket connected:', websocketService.isConnected());
    
    if (!content.trim()) {
      console.log('❌ Empty message, not sending');
      return;
    }
    
    if (state.connectionStatus !== 'connected') {
      console.error('❌ WebSocket not connected, cannot send message');
      return;
    }
    console.log('🔍 websocketService.isConnected():', websocketService.isConnected());
    if (!websocketService.isConnected()) {
      console.error('❌ WebSocket service not connected');
      return;
    }
    
    console.log(`📤 Sending message: "${content}" to room ${roomId}`);
    try {
      websocketService.sendChatMessage(roomId, content.trim(), userId, userName);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }, [userId, userName, state.connectionStatus]);

  // Create a new room
  const createRoom = useCallback(async (name: string, description?: string, isPrivate: boolean = false): Promise<Room> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const roomData = await roomAPI.createRoom({
        name,
        description,
        isPrivate,
        maxUsers: 50 // Default max users
      });
      
      // Automatically join the created room
      await joinRoom(roomData.id);
      
      setState(prev => ({ ...prev, loading: false }));
      return roomData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      throw error;
    }
  }, [joinRoom]);

  // Invite users to room
  const inviteUsersToRoom = useCallback(async (roomId: string, userNames: string[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await roomAPI.inviteUsersToRoom(roomId, userNames);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to invite users',
        loading: false
      }));
    }
  }, []);

  // Set current room and join it
  const setCurrentRoom = useCallback(async (roomId: string | null) => {
    if (roomId && roomId !== state.currentRoomId) {
      try {
        // Join the room first
        await joinRoom(roomId);
      } catch (error) {
        console.error('Failed to join room:', error);
        // Don't set current room if join fails
        return;
      }
    }
    
    setState(prev => ({
      ...prev,
      currentRoomId: roomId,
      // Mark current room as read
      rooms: prev.rooms.map(room => 
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    }));
  }, [joinRoom, state.currentRoomId]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get current room
  const currentRoom = state.rooms.find(room => room.id === state.currentRoomId);

  return {
    ...state,
    connectWebSocket,
    disconnectWebSocket,
    loadUserRooms,
    joinRoom,
    leaveRoom,
    sendMessage,
    createRoom,
    inviteUsersToRoom,
    setCurrentRoom,
    clearError
  };
}; 
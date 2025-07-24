import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../services/websocket.service';
import { roomAPI } from '../api/room';
import type { 
  ChatMessage, 
  Room,
  ConnectionStatus,
  WebSocketEventHandlers,
  UnreadCountMessage,
  RoomMember,
  RoomStateMessage,
  RoomJoinedMessage
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
  currentRoom: ChatRoom | undefined;
  connectionStatus: ConnectionStatus;
  loading: boolean;
  error: string | null;
}

interface UseChatActions {
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
    currentRoom: undefined,
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
      
      setState(prev => {
        // Check if message already exists in the current state (ID 기반 중복 체크)
        const existingRoom = prev.rooms.find(room => room.id === message.payload.roomId);
        if (existingRoom) {
          // Check for exact duplicate (same ID)
          if (existingRoom.messages.some(msg => msg.id === message.id)) {
            console.log(`🔄 Skipping duplicate message (same ID): ${message.id}`);
            return prev;
          }
        }
        
        // handle auto-marking message as read when you are in the current room and not the own message
        const isCurrentRoom = message.payload.roomId && message.payload.roomId === prev.currentRoomId;
        const isOwnMessage = message.payload.userId === userId;
        
        if (isCurrentRoom && !isOwnMessage) {
          console.log(`📖 Auto-marking message as read (current room): ${message.id}`);
          // send mark read request to backend
          if (websocketService.isConnected() && message.payload.roomId) {
            websocketService.markMessageAsRead(message.payload.roomId, message.timestamp);
          }
        }
        
        return {
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === message.payload.roomId) {
              return {
                ...room,
                messages: [...room.messages, message]
                // unreadCount is updated by server through unread_count message
              };
            }
            return room;
          })
        };
      });
    },



    onRoomState: (message: RoomStateMessage) => {
      console.log(`🔄 onRoomState called for room: ${message.payload.room.name}`);
      console.log(`🔄 Previous messages: ${message.payload.previousMessages.length}`);
      console.log(`🔄 Unread messages: ${message.payload.unreadMessages.length}`);
      console.log(`🔄 Total messages: ${message.payload.previousMessages.length + message.payload.unreadMessages.length}`);
      console.log(`📊 Read state:`, message.payload.readState);
      
      const { room, previousMessages, unreadMessages, members, readState } = message.payload;
      const allMessages = [...previousMessages, ...unreadMessages];
      
      setState(prev => {
        const existingRoom = prev.rooms.find(r => r.id === room.id);
        
        // If room doesn't exist, add it
        if (!existingRoom) {
          console.log(`🔄 Adding new room ${room.name} with ${allMessages.length} messages`);
          return {
            ...prev,
            rooms: [...prev.rooms, {
              ...room,
              // 백엔드에서 보낸 메시지들을 ChatMessage로 변환
              messages: allMessages.map(msg => ({
                id: msg.id,
                timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp).getTime() : msg.timestamp,
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
              members: members,
              unreadCount: readState.unreadCount,
              lastReadTimestamp: readState.lastReadTimestamp
            }]
          };
        }
        
        // If room exists but has no messages, load them
        if (existingRoom.messages.length === 0) {
          console.log(`🔄 First time loading messages for room ${room.name}: ${allMessages.length} messages`);
          return {
            ...prev,
            rooms: prev.rooms.map(r => 
              r.id === room.id ? {
                ...r,
                ...room,
                messages: allMessages.map(msg => ({
                  id: msg.id,
                  timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp).getTime() : msg.timestamp,
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
                members: members,
                unreadCount: readState.unreadCount,
                lastReadTimestamp: readState.lastReadTimestamp
              } : r
            )
          };
        }
        
        // need to replace the messages with the new messages other wise it will be duplicated everytime loading the room
        console.log(`🔄 Room ${room.name} already has ${existingRoom.messages.length} messages, replacing with new messages`);
        const newMessages = allMessages.map(msg => ({
          id: msg.id,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp).getTime() : msg.timestamp,
          version: '1.0',
          type: 'chat' as const,
          payload: {
            roomId: room.id,
            userId: msg.userId,
            name: msg.userName,
            content: msg.content,
            messageType: msg.messageType as 'text' | 'image' | 'file'
          }
        }));
        
        return {
          ...prev,
          rooms: prev.rooms.map(r => 
            r.id === room.id ? {
              ...r,
              ...room,
              messages: newMessages,
              members: members,
              unreadCount: readState.unreadCount,
              lastReadTimestamp: readState.lastReadTimestamp
            } : r
          )
        };
      });
    },

    onRoomJoined: (message: RoomJoinedMessage) => {
      console.log('🏠 Room joined:', message);
      const { roomId, newMemberName } = message.payload;
      
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === roomId) {
            // check if the new member already exists in the room
            const memberExists = room.members.some(member => member.name === newMemberName);
            if (memberExists) {
              console.log(`🔄 Member ${newMemberName} already exists in room ${roomId}`);
              return room;
            }
            
            // new memeber added assume online
            const newMember: RoomMember = {
              userId: `unknown_${Date.now()}`, // temporary id
              name: newMemberName,
              joinedAt: Date.now(),
              isOnline: true
            };
            
            console.log(`✅ Adding new member ${newMemberName} to room ${room.name}`);
            return {
              ...room,
              members: [...room.members, newMember],
              memberCount: room.memberCount + 1
            };
          }
          return room;
        })
      }));
    },

    onUnreadCount: (message: UnreadCountMessage) => {
      const { roomId, unreadCount } = message.payload;
      console.log(`📊 Unread count update: Room ${roomId} -> ${unreadCount}`);
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room =>
          room.id === roomId ? { ...room, unreadCount } : room
        )
      }));
    }


  });

  // WebSocket connection and event handlers setup
  useEffect(() => {
    console.log('🔗 useChat: Setting up WebSocket event handlers');
  
    if (websocketService.isConnected()) {
      console.log('🔗 useChat: WebSocket already connected, just registering handlers');
      websocketService.addEventHandlers(handlersRef.current);
      // update connection status to connected helps components to show the correct connection status
      setState(prev => ({ ...prev, connectionStatus: 'connected' }));
    } else {
      console.log('🔗 useChat: Connecting to WebSocket and registering handlers');
      websocketService.connect(handlersRef.current);
    }

    // Cleanup function - need to keep event handlers for other components (when you switch to another chat page)
    return () => {
      console.log('🔗 useChat: Component unmounting, but keeping event handlers for other components');
    };
  }, []);

  // Update currentRoom when currentRoomId or rooms change
  useEffect(() => {
    const currentRoom = state.rooms.find(room => room.id === state.currentRoomId);
    setState(prev => ({ ...prev, currentRoom }));
  }, [state.currentRoomId, state.rooms]);

  // Listen for user status updates from useFriends
  useEffect(() => {
    const handleUserStatusUpdate = (event: CustomEvent) => {
      const { userId, isOnline } = event.detail;
      console.log('🟢 useChat received userStatusUpdate event:', { userId, isOnline });
      
      setState(prev => {
        // Check if any room has this user as a member
        const hasUserInAnyRoom = prev.rooms.some(room => 
          room.members.some(member => member.userId === userId)
        );
        
        if (!hasUserInAnyRoom) {
          console.log('🟢 User not found in any room, skipping update:', userId);
          return prev; // No change needed
        }
        
        return {
          ...prev,
          rooms: prev.rooms.map(room => ({
            ...room,
            members: room.members.map(member =>
              member.userId === userId
                ? { ...member, isOnline }
                : member
            )
          }))
        };
      });
    };

    window.addEventListener('userStatusUpdate', handleUserStatusUpdate as EventListener);
    
    return () => {
      window.removeEventListener('userStatusUpdate', handleUserStatusUpdate as EventListener);
    };
  }, []);

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
          console.log(`🔄 Loading members for room: ${room.name} (${room.id}) with unreadCount: ${room.unreadCount}`);
          try {
            const members = await roomAPI.getRoomMembers(room.id);
            console.log(`✅ Loaded ${members.length} members for room ${room.name}`);
            return {
              ...room,
              messages: [],
              members: members.map(m => ({
                userId: m.userId,
                name: m.name,
                joinedAt: Date.now(), //the server does not provide this value
                isOnline: m.isOnline
              })),
              unreadCount: room.unreadCount || 0
            };
          } catch (error) {
            console.warn(`Failed to load members for room ${room.id}:`, error);
            return {
              ...room,
              messages: [],
              members: [],
              unreadCount: room.unreadCount || 0
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

  // Join a room
  const joinRoom = useCallback(async (roomId: string, requestSync: boolean = true) => {
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
              joinedAt: Date.now(),
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

      // request room sync if requestSync is true and websocket is connected
      if (requestSync && websocketService.isConnected()) {
        websocketService.requestRoomSync(roomId);
        console.log(`✅ Room sync request sent for room: ${roomId}`);
      } else if (requestSync) {
        console.warn(`⚠️ WebSocket not connected, cannot request room sync for room: ${roomId}`);
      }
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
      
      // no sync request already done in the joinRoom function
      await joinRoom(roomData.id, false);
      
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
        // 🎯 joinRoom은 호출하되 sync 요청은 하지 않음 (중복 방지)
        await joinRoom(roomId, false);
        
        // 🎯 현재 룸으로 설정한 후에만 sync 요청
        setState(prev => ({
          ...prev,
          currentRoomId: roomId
        }));
        
        // 🎯 룸 설정 후 sync 요청
        if (websocketService.isConnected()) {
          websocketService.requestRoomSync(roomId);
          console.log(`✅ Room sync request sent for current room: ${roomId}`);
        }
      } catch (error) {
        console.error('Failed to join room:', error);
        // Don't set current room if join fails
        return;
      }
    } else {
      // 🎯 룸을 떠날 때 (roomId가 null) 이전 룸의 unreadCount를 0으로 업데이트
      if (roomId === null && state.currentRoomId) {
        console.log(`📊 Leaving room ${state.currentRoomId}, setting unreadCount to 0`);
        setState(prev => ({
          ...prev,
          rooms: prev.rooms.map(room =>
            room.id === state.currentRoomId ? { ...room, unreadCount: 0 } : room
          ),
          currentRoomId: roomId
        }));
      } else {
        setState(prev => ({
          ...prev,
          currentRoomId: roomId
        }));
      }
    }
  }, [joinRoom, state.currentRoomId]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
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
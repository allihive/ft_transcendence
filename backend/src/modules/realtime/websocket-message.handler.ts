import { EntityManager } from "@mikro-orm/core";
import { MessageService } from "./message.service";
import { SyncService } from "./sync.service";
import { RoomService } from "./room.service";
import { WebSocketErrorHandler } from "./websocket-error-handler";

import { AnyMessage, ChatMessage, SyncMessage, PingMessage, PongMessage } from "./dto";

export class WebSocketMessageHandler {
  constructor(
    private readonly messageService: MessageService,
    private readonly syncService: SyncService,
    private readonly roomService: RoomService,
    private readonly connectionManager?: any 
  ) {}

  async handleMessage(
    em: EntityManager, 
    message: AnyMessage, 
    userId: string, 
    userName: string,
    sendMessageCallback: (message: any) => void,
    broadcastToRoomCallback: (roomId: string, message: any) => void,
    socketId?: string // Add socketId for pong tracking
  ): Promise<void> {
    console.log(`🎯 WebSocketMessageHandler: Processing ${message.type} for user ${userId}`);
    
    switch ((message as any).type) {
      case 'chat':
        console.log(`💬 Handling chat message for user ${userId}`);
        await this.handleChatMessage(em, message as ChatMessage, userId, userName, broadcastToRoomCallback);
        break;
      case 'sync':
        console.log(`🔄 Handling sync message for user ${userId}`);
        await this.handleSyncMessage(em, message as SyncMessage, userId, sendMessageCallback);
        break;
      case 'ping':
        console.log(`🏓 Handling ping message for user ${userId}`);
        await this.handlePingMessage(message as PingMessage, sendMessageCallback);
        break;
      case 'pong':
        console.log(`🏓 Handling pong message for user ${userId}`);
        await this.handlePongMessage(message as PongMessage, socketId);
        break;
      default:
        console.warn('Unknown message type:', (message as any).type);
        // 알 수 없는 메시지 타입은 상위로 전파
        throw new Error(`Unknown message type: ${(message as any).type}`);
    }
  }

  private async handleChatMessage(
    em: EntityManager, 
    message: ChatMessage, 
    userId: string, 
    userName: string,
    broadcastToRoomCallback: (roomId: string, message: any) => void
  ): Promise<void> {
    console.log(`💬 Processing chat message from ${userName} in room ${message.payload.roomId}`);
    console.log(`🔍 Chat message details:`, {
      userId,
      userName,
      roomId: message.payload.roomId,
      content: message.payload.content,
      messageType: message.payload.messageType
    });
    
    const roomId = message.payload.roomId;
    if (!roomId) {
      console.error('❌ Room ID is missing from chat message');
      throw new Error('Room ID is required for chat messages');
    }

    // Check if user is in the room (database check)
    const isUserInRoom = await this.roomService.isUserInRoomDatabase(em, roomId, userId);
    console.log(`🔍 User ${userId} in room ${roomId}: ${isUserInRoom}`);
    
    if (!isUserInRoom) {
      console.error(`❌ User ${userId} is not in room ${roomId}`);
      throw new Error('User is not a member of this room');
    }

    try {
      // Save message to database
      const chatMessage = await this.messageService.saveChatMessage(
        em, 
        roomId, 
        userId, 
        userName, 
        message.payload.content,
        message.payload.messageType || 'text',
        message.payload.originalFilename,
        message.payload.mimeType,
        message.payload.fileSize
      );
      console.log(`✅ Message saved to database:`, chatMessage.id);

      // Broadcast to room
      broadcastToRoomCallback(roomId, chatMessage);
      console.log(`✅ Message broadcasted to room ${roomId}`);
    } catch (error) {
      console.error(`❌ Error saving/broadcasting chat message:`, error);
      throw error;
    }
  }

  private async handleSyncMessage(
    em: EntityManager, 
    message: SyncMessage, 
    userId: string,
    sendMessageCallback: (message: any) => void
  ): Promise<void> {
    const roomId = message.payload.roomId;
    console.log(`🔄 Processing sync request for room ${roomId} from user ${userId}`);
    
    if (!roomId) {
      console.error('❌ Room ID is missing from sync message');
      throw new Error('Room ID is required for sync messages');
    }

    // Get room data
    const room = await this.roomService.getRoom(em, roomId);
    if (!room) {
      console.error(`❌ Room ${roomId} not found`);
      throw new Error(`Room ${roomId} not found`);
    }
    console.log(`✅ Found room: ${room.name} (${room.id})`);

    // Get room members
    const roomMembers = await this.roomService.getRoomMembers(em, roomId);
    console.log(`✅ Found ${roomMembers.length} members in room ${room.name}`);
    
    // Get messages and sync data
    const roomData = await this.syncService.syncRoomMessages(em, userId, roomId);
    console.log(`✅ Sync data for room ${room.name}:`, {
      previousMessages: roomData.previousMessages.length,
      unreadMessages: roomData.unreadMessages.length,
      lastReadTimestamp: roomData.lastReadTimestamp
    });

    // Create room state message using existing message timestamp
    const roomStateMessage = {
      id: `room_state_${Date.now()}`,
      type: 'room_state',
      payload: {
        room: {
          id: room.id,
          name: room.name,
          masterId: room.masterId,
          description: room.description || '',
          isPrivate: room.isPrivate,
          maxUsers: room.maxUsers,
          memberCount: roomMembers.length,
          createdAt: room.createdAt?.toISOString(),
          updatedAt: room.updatedAt?.toISOString()
        },
        previousMessages: roomData.previousMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp).toISOString()
        })),
        unreadMessages: roomData.unreadMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp).toISOString()
        })),
        members: roomMembers.map(member => ({
          userId: member.userId,
          name: member.name,
          joinedAt: member.joinedAt?.toISOString()
        })),
        readState: {
          lastReadTimestamp: new Date(roomData.lastReadTimestamp).toISOString(),
          unreadCount: roomData.unreadMessages.length,
          totalMessages: roomData.previousMessages.length + roomData.unreadMessages.length
        }
      },
      timestamp: new Date(message.timestamp).toISOString()
    };
    console.log(`🔄 Sending room state message for room ${room.name}:`, {
      roomId: room.id,
      totalMessages: roomData.previousMessages.length + roomData.unreadMessages.length,
      members: roomMembers.length
    });
    sendMessageCallback(roomStateMessage);
  }

  private async handlePingMessage(
    message: PingMessage, 
    sendMessageCallback: (message: any) => void
  ): Promise<void> {
    console.log(`🏓 Creating pong response for ping message:`, message.id);
    // Create pong response using existing timestamp
    const pongMessage = this.messageService.createPongMessage(message.timestamp);
    console.log(`🏓 Sending pong response:`, pongMessage);
    sendMessageCallback(pongMessage);
  }

  private async handlePongMessage(
    message: PongMessage,
    socketId?: string
  ): Promise<void> {
    // Handle pong for latency tracking using ConnectionManager
    if (socketId && this.connectionManager) {
      this.connectionManager.handlePongReceived(socketId);
    }
  }
} 
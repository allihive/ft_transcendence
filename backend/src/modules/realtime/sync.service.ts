import { EntityManager } from "@mikro-orm/core";
import { randomUUID } from 'crypto';
import { ChatMessage } from './dto';
import { ChatMessage as ChatMessageEntity } from './entities/chat-message.entity';
import { UserReadMessageEntity } from './entities/user-read-message.entity';
import { User } from '../user/entities/user.entity';
import { Room } from './entities/room.entity';
// import { MessageService } from "./message.service"; // Circular dependency - injected via setDependencies
// import { EventService } from "./event.service";

export class SyncService {
  constructor(
    private roomService?: any, // RoomService (optional to avoid circular dependency)
    private friendshipService?: any, // FriendshipService (optional)
    private messageService?: any, // MessageService (optional to avoid circular dependency)
    private eventService?: any // EventService (optional to avoid circular dependency)
  ) {}

  setDependencies(roomService: any, friendshipService: any, messageService: any, eventService: any) {
    this.roomService = roomService;
    this.friendshipService = friendshipService;
    this.messageService = messageService;
    this.eventService = eventService;
  }

  async restoreUserSession(em: EntityManager, userId: string, sendMessageCallback: (message: any) => void): Promise<void> {
    try {

      // 1. 친구 목록 동기화
      await this.syncFriendList(em, userId, sendMessageCallback);
      console.log(`[${userId}] Friend list synchronized`);

      // 2. 사용자의 룸들을 메모리에 복원
      const userRooms = await this.restoreUserRoomsToMemory(em, userId);
      console.log(`[${userId}] Restored to ${userRooms.length} rooms in memory`);
      
      // 3. 읽지 않은 메시지 수만 확인 (메시지 동기화는 룸 입장 시에)
      for (const roomId of userRooms) {
        // 읽지 않은 메시지 수만 확인
        const unreadCount = await this.getUnreadMessageCount(em, userId, roomId);
        
        if (unreadCount > 0) {
          // EventService를 통해 unread count 업데이트 이벤트 발생
          if (!this.eventService) {
            console.warn(`[${userId}] EventService not available for unread count update`);
            return;
          }
          this.eventService.emitUnreadCountUpdate({
            roomId,
            userId,
            unreadCount
          });
        }
      }

    } catch (error) {
      console.error(`[${userId}] Error restoring session:`, error);
    }
  }

  async restoreUserRoomsToMemory(em: EntityManager, userId: string): Promise<string[]> {
    try {
      if (!this.roomService) {
        console.warn('RoomService not available for memory restoration');
        return [];
      }

      // 데이터베이스에서 사용자의 룸 목록 조회
      const userRooms = await this.roomService.getUserRooms(em, userId);
      const roomIds: string[] = [];

      // 각 룸을 메모리에 추가 (이미 있으면 중복 추가되지 않음)
      for (const room of userRooms) {
        this.roomService.addUserToRoomInMemory(userId, room.id);
        roomIds.push(room.id);
        console.log(`[${userId}] Added to room ${room.id} in memory`);
      }

      return roomIds;
    } catch (error) {
      console.error(`[${userId}] Error restoring rooms to memory:`, error);
      return [];
    }
  }

  async syncFriendList(em: EntityManager, userId: string, sendMessageCallback: (message: any) => void): Promise<void> {
    try {
      if (!this.friendshipService) {
        console.warn('FriendshipService not available for friend sync');
        return;
      }

      // 친구 목록 조회 및 전송
      const friendList = await this.friendshipService.getFriendsList(em, userId);
      sendMessageCallback({
        id: friendList.id,
        type: 'friend_list',
        payload: friendList.payload,
        timestamp: friendList.timestamp,
        version: friendList.version
      });

    } catch (error) {
      console.error(`[${userId}] Error syncing friend list:`, error);
    }
  }



  // Get previous messages and unread messages for room sync
  async syncRoomMessages(em: EntityManager, userId: string, roomId: string): Promise<{
    previousMessages: ChatMessage[];
    unreadMessages: ChatMessage[];
    lastReadTimestamp: number;
  }> {
    // Get user's last read timestamp
    const userRead = await em.findOne(UserReadMessageEntity, { user: { id: userId }, room: { id: roomId } });
    const lastReadTimestamp = userRead?.lastReadTimestamp || 0;

    // Get previous messages (최대 1000개까지 가져오기)
    const previousMessageEntities = await em.find(ChatMessageEntity, {
      roomId
    }, {
      orderBy: { timestamp: 'DESC' }
    });

    // Get unread messages (after last read timestamp) - DESC order for efficiency
    const unreadMessageEntities = await em.find(ChatMessageEntity, {
      roomId,
      timestamp: { $gt: lastReadTimestamp }
    }, {
      orderBy: { timestamp: 'DESC' }
    });

    // Convert to ChatMessage format
    const previousMessages = this.messageService?.setMapInChatMessageForm(previousMessageEntities.reverse()) || [];
    const unreadMessages = this.messageService?.setMapInChatMessageForm(unreadMessageEntities.reverse()) || [];

    // 🎯 메시지들을 메모리 캐시에 저장
    if (this.messageService && (previousMessages.length > 0 || unreadMessages.length > 0)) {
      const allMessages = [...previousMessages, ...unreadMessages];
      this.messageService.addMessagesToCache(roomId, allMessages);
      console.log(`[${userId}] Synced ${allMessages.length} messages to memory cache for room ${roomId}`);
    }

    return {
      previousMessages,
      unreadMessages,
      lastReadTimestamp
    };
  }

  // 읽지 않은 메시지 수만 조회 (가벼운 쿼리)
  async getUnreadMessageCount(em: EntityManager, userId: string, roomId: string): Promise<number> {
    // Get user's last read timestamp
    const userRead = await em.findOne(UserReadMessageEntity, { user: { id: userId }, room: { id: roomId } });
    const lastReadTimestamp = userRead?.lastReadTimestamp || 0;

    // Count unread messages (after last read timestamp)
    const unreadCount = await em.count(ChatMessageEntity, {
      roomId,
      timestamp: { $gt: lastReadTimestamp }
    });

    return unreadCount;
  }

  // Mark messages as read up to a certain timestamp
  async markMessagesAsRead(em: EntityManager, userId: string, roomId: string, lastReadTimestamp: number): Promise<void> {
    // Find or create UserReadMessage record
    let userRead = await em.findOne(UserReadMessageEntity, { user: { id: userId }, room: { id: roomId } });
    
    if (!userRead) {
      // Find user and room entities
      const user = await em.findOne(User, { id: userId });
      const room = await em.findOne(Room, { id: roomId });
      
      if (!user || !room) {
        throw new Error(`User ${userId} or Room ${roomId} not found`);
      }

      // Create new record if it doesn't exist
      userRead = em.create(UserReadMessageEntity, {
        id: randomUUID(),
        user,
        room,
        lastReadTimestamp: 0,
        unreadCount: 0,
        updatedAt: new Date()
      });
    }

    // Update last read timestamp
    userRead.lastReadTimestamp = lastReadTimestamp;
    await em.persistAndFlush(userRead);
  }



  // // Get unread counts for all user's rooms
  // async getAllUnreadCounts(em: EntityManager, userId: string): Promise<{ roomId: string; unreadCount: number }[]> {
  //   try {
  //     if (!this.roomService) {
  //       return [];
  //     }

  //     // Get user's rooms
  //     const userRooms = await this.roomService.getUserRooms(em, userId);
  //     const unreadCounts: { roomId: string; unreadCount: number }[] = [];

  //     // Get user's read records for all rooms
  //     const userReadRecords = await em.find(UserReadMessageEntity, { user: { id: userId } }, { populate: ['room'] });

  //     for (const room of userRooms) {
  //       const userRead = userReadRecords.find(record => record.room?.id === room.id);
  //       const lastReadTimestamp = userRead?.lastReadTimestamp || 0;

  //       const unreadCount = await em.count(ChatMessageEntity, {
  //         roomId: room.id,
  //         timestamp: { $gt: lastReadTimestamp }
  //       });

  //       if (unreadCount > 0) {
  //         unreadCounts.push({
  //           roomId: room.id,
  //           unreadCount
  //         });
  //       }
  //     }

  //     return unreadCounts;
  //   } catch (error) {
  //     console.error(`Error getting unread counts for user ${userId}:`, error);
  //     return [];
  //   }
  // }
} 
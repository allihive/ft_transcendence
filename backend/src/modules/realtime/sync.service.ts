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

      // 1. sync friend list
      await this.syncFriendList(em, userId, sendMessageCallback);
      console.log(`[${userId}] Friend list synchronized`);

      // 2. restore user rooms to memory
      const userRooms = await this.restoreUserRoomsToMemory(em, userId);
      console.log(`[${userId}] Restored to ${userRooms.length} rooms in memory`);
      
      // 3. check unread message count (message sync is done when user enters the room)
      for (const roomId of userRooms) {
        // check unread message count
        const unreadCount = await this.getUnreadMessageCount(em, userId, roomId);
        
        if (unreadCount > 0) {
          // emit unread count update event through EventService
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

      // get user rooms from database
      const userRooms = await this.roomService.getUserRooms(em, userId);
      const roomIds: string[] = [];

      // add each room to memory (no duplicate addition if already exists)
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

      // get friend list and send it to user
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

    console.log(`[${userId}] Syncing room ${roomId}, lastReadTimestamp: ${lastReadTimestamp}`);

    // Get all messages for the room (최대 1000개까지 가져오기)
    const allMessageEntities = await em.find(ChatMessageEntity, {
      roomId
    }, {
      orderBy: { timestamp: 'ASC' }  // sort by timestamp in ascending order as it will be put it in revers anyway later
    });

    // Split into previous and unread messages based on lastReadTimestamp
    const previousMessages: ChatMessage[] = [];
    const unreadMessages: ChatMessage[] = [];

    for (const msgEntity of allMessageEntities) {
      const chatMessage = this.messageService?.setMapInChatMessageForm([msgEntity])?.[0];
      if (chatMessage) {
        if (msgEntity.timestamp <= lastReadTimestamp) {
          previousMessages.push(chatMessage);
        } else {
          unreadMessages.push(chatMessage);
        }
      }
    }

    console.log(`[${userId}] Room ${roomId}: ${previousMessages.length} previous, ${unreadMessages.length} unread messages`);

    // save messages to memory cache
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

  // get unread message count (lightweight query)
  async getUnreadMessageCount(em: EntityManager, userId: string, roomId: string): Promise<number> {
    // Get user's last read timestamp
    const userRead = await em.findOne(UserReadMessageEntity, { user: { id: userId }, room: { id: roomId } });
    const lastReadTimestamp = userRead?.lastReadTimestamp || 0;

    // Count unread messages (after last read timestamp)
    const unreadCount = await em.count(ChatMessageEntity, {
      roomId,
      timestamp: { $gt: lastReadTimestamp },
      userId: { $ne: userId } // not including messages sent by the user
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
} 
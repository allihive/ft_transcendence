import { EntityManager } from "@mikro-orm/core";
import { v4 as uuidv4 } from 'uuid';
import { Room } from "./entities/room.entity";
import { RoomMember as RoomMemberEntity } from "./entities/room-member.entity";
import { User } from "../user/entities/user.entity";
import { NotFoundException } from "../../common/exceptions/NotFoundException";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { ConnectionService } from "./connection.service";
import { EventService } from "./event.service";

export class RoomService {
  // In-memory room tracking for WebSocket connections: caching for quick access
  private usersInRoom = new Map<string, Set<string>>(); // roomId -> Set of userId
  private roomsInUser = new Map<string, Set<string>>(); // userId -> Set of roomIds

  constructor(
    private eventService: EventService
  ) {}

  // ==============================================
  // Database Operations (HTTP API용)
  // ===========================================

  async createRoom(em: EntityManager, name: string, masterId: string, description?: string, isPrivate = false, maxUsers = 50): Promise<Room> {
    // Check if user already has a room with the same name (only among user's rooms)
    const userRooms = await this.getUserRooms(em, masterId);
    console.log(`[createRoom] User ${masterId} has ${userRooms.length} rooms:`, userRooms.map(r => r.name));
    
    const existingUserRoom = userRooms.find(room => room.name === name);
    if (existingUserRoom) {
      console.log(`[createRoom] Duplicate room name found: "${name}" for user ${masterId}`);
      throw new BadRequestException(`You already have a room named "${name}". Please choose a different name.`);
    }

    console.log(`[createRoom] Creating room "${name}" for user ${masterId}`);

    const room = em.create(Room, {
      id: uuidv4(),
      name,
      masterId,
      description,
      isPrivate,
      maxUsers,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await em.persistAndFlush(room);
    
    // Add master to room members after room is persisted
    const user = await em.findOne(User, { id: masterId });
    if (user) {
      await this.addUsersToRoomDatabase(em, room.id, [user.name], masterId, user.name);
      this.addUserToRoomInMemory(masterId, room.id);
    }
    
    // Return room with populated members for accurate memberCount
    return await em.findOne(Room, { id: room.id }, { populate: ['members'] }) || room;
  }

  async getRoom(em: EntityManager, roomId: string): Promise<Room | null> {
    const room = await em.findOne(Room, { id: roomId }, { populate: ['members'] });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }


  // Find user by name (for invitation system)
  async findUserByName(em: EntityManager, name: string): Promise<User> {
    const user = await em.findOne(User, { name });
    if (!user) {
      throw new NotFoundException(`User ${name} not found`);
    }
    return user;
  }
  
  // Add users to room (database only, for HTTP API) - 다중 초대 지원
  async addUsersToRoomDatabase(em: EntityManager, roomId: string, inviteeNames: string[], inviterId: string, inviterName: string): Promise<{ success: string[], failed: { name: string, reason: string }[] }> {
    const room = await em.findOne(Room, { id: roomId }, { populate: ['members'] });
    if (!room) throw new NotFoundException('Room not found');

    //the reason using this rather than throwing an error is that we want to process possible users to be invited
    const results = {
      success: [] as string[],
      failed: [] as { name: string, reason: string }[]
    };

    for (const name of inviteeNames) {
      try {
        // 사용자 이름으로 실제 User 찾기
        const inviteeUser = await this.findUserByName(em, name);

        // 이미 룸에 있는지 확인
        const existingMember = room.members.getItems().find(member => member.userId === inviteeUser.id);
        if (existingMember) {
          results.failed.push({ name, reason: 'User already in room' });
          continue;
        }

        // 룸이 가득 찬지 확인
        if (room.members.length >= room.maxUsers) {
          results.failed.push({ name, reason: 'Room is full' });
          continue;
        }

        // 멤버 추가
        const member = em.create(RoomMemberEntity, {
          id: uuidv4(),
          userId: inviteeUser.id,
          name,
          joinedAt: new Date(),
          room,
        });

        room.members.add(member);
        
        // 메모리에 추가
        this.addUserToRoomInMemory(inviteeUser.id, roomId);

        // 이벤트 발생 (초대자와 피초대자가 다른 경우만)
        if (inviteeUser.id !== inviterId) {
          this.eventService.emitRoomInvitation({
            roomId: room.id,
            roomName: room.name,
            inviteeName: name,
            inviterName: inviterName
          });
        }

        results.success.push(name);
        
      } catch (error) {
        // NotFoundException이면 'User not found', 그 외는 'Failed to add user'
        if (error instanceof NotFoundException) {
          results.failed.push({ name, reason: 'User not found' });
        } else {
          results.failed.push({ name, reason: 'Failed to add user' });
        }
      }
    }

    // 변경사항 저장
    if (results.success.length > 0) {
      room.updatedAt = new Date();
      await em.persistAndFlush(room);
    }

    return results;
  }

  // Get room members (database)
  async getRoomMembers(em: EntityManager, roomId: string): Promise<RoomMemberEntity[]> {
    const room = await em.findOne(Room, { id: roomId }, { populate: ['members'] });
    if (!room) {
      throw new NotFoundException(`Room ${roomId} not found`);
    }

    return room.members.getItems();
  }

  // Check if user is in room (database)
  async isUserInRoomDatabase(em: EntityManager, roomId: string, userId: string): Promise<boolean> {
    const room = await em.findOne(Room, { id: roomId }, { populate: ['members'] });
    if (!room) {
      throw new NotFoundException(`Room ${roomId} not found`);
    }

    return room.members.getItems().some(member => member.userId === userId);
  }

  // Remove user from room (database)
  async removeUserFromRoomDatabase(em: EntityManager, roomId: string, userId: string): Promise<void> {
    const room = await em.findOne(Room, { id: roomId }, { populate: ['members'] });
    if (!room) {
      throw new NotFoundException(`Room ${roomId} not found`);
    }

    console.log(`🔍 Room found: ${room.name}, current members: ${room.members.length}`);
    
    const member = room.members.getItems().find(member => member.userId === userId);
    if (!member) {
      console.log(`User ${userId} not found in room ${roomId} members`);
      console.log(`Current members: ${room.members.getItems().map(m => `${m.name}(${m.userId})`).join(', ')}`);
      throw new NotFoundException(`User ${userId} not found in room ${roomId}`);
    }

    console.log(`Found member ${member.name} (${member.userId}), removing...`);
    
    room.members.remove(member);
    room.updatedAt = new Date();

    await em.persistAndFlush(room);
    await this.checkAndDeleteEmptyRoom(em, roomId);
  }

  // 빈 방 체크 및 자동 삭제
  private async checkAndDeleteEmptyRoom(em: EntityManager, roomId: string): Promise<boolean> {
    try {
      const room = await em.findOne(Room, { id: roomId }, { populate: ['members'] });
      if (!room) return false;

      // 방에 멤버가 없으면 삭제
      if (room.members.length === 0) {
        console.log(`Room ${room.name} (${roomId}) is empty, deleting...`);
        
        // 관련 데이터 정리
        await this.cleanupEmptyRoomData(em, roomId);
        
        // 방 삭제
        await em.removeAndFlush(room);
        
        // 메모리에서도 제거
        this.usersInRoom.delete(roomId);
        
        console.log(`Empty room ${room.name} (${roomId}) deleted successfully`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking/deleting empty room:', error);
      return false;
    }
  }

  // 빈 방 관련 데이터 정리
  private async cleanupEmptyRoomData(em: EntityManager, roomId: string): Promise<void> {
    try {
      // 1. UserReadMessage 정리
      await em.nativeDelete('UserReadMessage', { room: roomId });
      
      // 2. ChatMessage 정리 - 모든 메시지 삭제
      await em.nativeDelete('ChatMessage', { roomId });
      
      console.log(`Cleaned up all data (messages, read states) for room ${roomId}`);
    } catch (error) {
      console.error('Error cleaning up room data:', error);
    }
  }

  // Leave room (both memory and database)
  async leaveRoom(em: EntityManager, userId: string, roomId: string): Promise<void> {
    // Remove from memory (WebSocket)
    this.removeUserFromRoom(userId, roomId);
    
    // Remove from database (throws exception if fails)
    await this.removeUserFromRoomDatabase(em, roomId, userId);
  }

  // Get rooms that a user has joined
  async getUserRooms(em: EntityManager, userId: string): Promise<Room[]> {
    const roomMembers = await em.find(RoomMemberEntity, { userId: userId }, { populate: ['room'] });
    return roomMembers.map(member => member.room);
  }


  // =============================================
  // Memory Operations
  // ===========================================

  // Add user to room in memory 
  addUserToRoomInMemory(userId: string, roomId: string): boolean {
    // Add room to user's rooms
    if (!this.roomsInUser.has(userId)) {
      this.roomsInUser.set(userId, new Set());
    }
    this.roomsInUser.get(userId)!.add(roomId);

    // Add user to room's members
    if (!this.usersInRoom.has(roomId)) {
      this.usersInRoom.set(roomId, new Set());
    }
    this.usersInRoom.get(roomId)!.add(userId);

    return true;
  }

  // Remove user from room in memory
  removeUserFromRoom(userId: string, roomId: string): boolean {
    // Remove room from user's rooms
    const roomsInUser = this.roomsInUser.get(userId);
    if (roomsInUser) {
      roomsInUser.delete(roomId);
      if (roomsInUser.size === 0) {
        this.roomsInUser.delete(userId);
      }
    }
    
    // Remove user from room's members
    const roomMembers = this.usersInRoom.get(roomId);
    if (roomMembers) {
      roomMembers.delete(userId);
      if (roomMembers.size === 0) {
        this.usersInRoom.delete(roomId);
      }
    }

    return true;
  }

  // Get users in the room (memory) - quicker to search in memory than in database
  getUsersInRoom(roomId: string): string[] {
    const roomMembers = this.usersInRoom.get(roomId);
    return roomMembers ? Array.from(roomMembers) : [];
  }

  // WebSocket용 - 메모리에서 빠르게 roomId의 userIds 반환
  getRoomMembersFromMemory(roomId: string): string[] {
    return this.getUsersInRoom(roomId);
  }

  // WebSocket용 - 메모리에서 사용자의 룸 목록 반환 (제거하지 않음)
  getUserRoomsFromMemory(userId: string): string[] {
    const userRooms = this.roomsInUser.get(userId);
    return userRooms ? Array.from(userRooms) : [];
  }

  // Check if user is in room (memory)
  isUserInRoomMemory(roomId: string, userId: string): boolean {
    const roomMembers = this.usersInRoom.get(roomId);
    return roomMembers ? roomMembers.has(userId) : false;
  }




} 
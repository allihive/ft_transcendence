import { EntityManager } from "@mikro-orm/core";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../user/entities/user.entity";
import { Friendship } from "./entities/friendship.entity";
import { FriendRequest } from "./entities/friendship.entity";
import { ConnectionService } from "./connection.service";
import { EventService } from "./event.service";
import { NotFoundException } from "../../common/exceptions/NotFoundException";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { FriendListResponseSchema, FriendPendingRequestPayloadSchema } from "./dto";

export class FriendshipService {
  constructor(
    private connectionService: ConnectionService,
    private eventService: EventService
  ) {}

  // Send friend request
  async sendFriendRequest(em: EntityManager, requesterId: string, addresseeEmail: string): Promise<void> {
    const requester = await em.findOne(User, { id: requesterId });
    const addressee = await em.findOne(User, { email: addresseeEmail });

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    if (!addressee) {
      throw new NotFoundException('User with this email not found');
    }

    if (requester.id === addressee.id) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if they are already friends
    const existingFriendship = await em.findOne(Friendship, {
      $or: [
        { user: requester, friend: addressee, status: 'active' },
        { user: addressee, friend: requester, status: 'active' }
      ]
    });

    if (existingFriendship) {
      throw new BadRequestException('You are already friends with this user');
    }

    // Check if friend request already exists
    const existingRequest = await em.findOne(FriendRequest, {
      $or: [
        { requester: requester, addressee: addressee, status: 'pending' },
        { requester: addressee, addressee: requester, status: 'pending' }
      ]
    });

    if (existingRequest) {
      throw new BadRequestException('Friend request already exists');
    }

    const friendRequest = em.create(FriendRequest, {
      id: uuidv4(),
      requester,
      addressee,
      status: 'pending',
      createdAt: new Date()
    });

    await em.persistAndFlush(friendRequest);

    this.eventService.emitFriendRequest({
      requesterId: requester.id,
      requesterName: requester.name,
      addresseeId: addressee.id,
      addresseeEmail: addressee.email,
      addresseeName: addressee.name,
      message: `${requester.name} sent you a friend request`,
      createdAt: Date.now()
    });
    console.log('Friend request sent successfully');
  }

//find friendship entity
async CreateFriendship(em: EntityManager, userId: string, friendId: string): Promise<Friendship> {
    if (userId === friendId) {
        throw new BadRequestException('Cannot create friendship with yourself');
    }

    const friendship = await em.findOne(Friendship, {
        user: {id: userId},
        friend: {id: friendId},
        status: 'active'
    });

    if (!friendship) {
        const user = await em.findOne(User, {id: userId});
        const friend = await em.findOne(User, {id: friendId});
        
        if (!user || !friend) {
            throw new NotFoundException('User or friend not found');
        }

        const newFriendship = em.create(Friendship, {
            id: uuidv4(),
            user: user,
            friend: friend,
            status: 'active',
            createdAt: new Date()
        });
        await em.persistAndFlush(newFriendship);
        return newFriendship;
    } 
    console.log('Friendship created successfully');
    return friendship;
}

  // Accept friend request
  async acceptFriendRequest(em: EntityManager, requestId: string, addresseeId: string): Promise<void> {
    const friendRequest = await em.findOne(FriendRequest, { 
      id: requestId,
      addressee: { id: addresseeId },
      status: 'pending'
    }, { populate: ['requester', 'addressee'] });
    
    if (!friendRequest) {
      throw new Error('Friend request not found or already processed');
    }

    // Update friend request status
    friendRequest.status = 'accepted';
    friendRequest.acceptedAt = new Date();

    // Create friendship relationship (bidirectional)
    // 이미 존재하는 친구 관계인지 확인
    const existingFriendship1 = await em.findOne(Friendship, {
      user: { id: friendRequest.requester.id },
      friend: { id: friendRequest.addressee.id },
      status: 'active'
    });

    const existingFriendship2 = await em.findOne(Friendship, {
      user: { id: friendRequest.addressee.id },
      friend: { id: friendRequest.requester.id },
      status: 'active'
    });

    if (existingFriendship1 || existingFriendship2) {
      throw new BadRequestException('Friendship already exists');
    }

    const friendship1 = await this.CreateFriendship(em, friendRequest.requester.id, friendRequest.addressee.id);
    const friendship2 = await this.CreateFriendship(em, friendRequest.addressee.id, friendRequest.requester.id);

    await em.persistAndFlush([friendRequest, friendship1, friendship2]);

    this.eventService.emitFriendRequestResponse({
        requestId: friendRequest.id,
        requesterId: friendRequest.requester.id,
        requesterName: friendRequest.requester.name,
        addresseeId: friendRequest.addressee.id,
        addresseeName: friendRequest.addressee.name,
        status: 'accepted',
        createdAt: friendRequest.createdAt.getTime()
    });

    // 친구 목록 업데이트 이벤트 발생
    this.eventService.emitUpdateFriendList({
      updateReason: 'friend_request_accepted',
      friends: [], // 실제 데이터는 각 사용자별로 새로 조회
      totalCount: 0,
      targetUserIds: [friendRequest.requester.id, friendRequest.addressee.id]
    });
    console.log('Friend request accepted successfully');
  }

  // Reject friend request
  async rejectFriendRequest(em: EntityManager, requestId: string, userId: string): Promise<void> {
    const friendRequest = await em.findOne(FriendRequest, { 
      id: requestId,
      addressee: { id: userId },
      status: 'pending'
    }, { populate: ['requester', 'addressee'] });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found or already processed');
    }

    friendRequest.status = 'rejected';
    friendRequest.acceptedAt = new Date();
    await em.persistAndFlush(friendRequest);

    this.eventService.emitFriendRequestResponse({
        requestId: friendRequest.id,
        requesterId: friendRequest.requester.id,
        requesterName: friendRequest.requester.name,
        addresseeId: friendRequest.addressee.id,
        addresseeName: friendRequest.addressee.name,
        status: 'rejected',
        createdAt: friendRequest.createdAt.getTime()
    });
    console.log('Friend request rejected successfully');
  }

  async blockFriend(em: EntityManager, userId: string, friendId: string): Promise<void> {
    const friendship1 = await em.findOne(Friendship, {
      user: { id: userId },
      friend: { id: friendId },
      status: 'active'
    });

    const friendship2 = await em.findOne(Friendship, {
      user: { id: friendId },
      friend: { id: userId },
      status: 'active'
    });

    if (!friendship1 || !friendship2) {
      throw new NotFoundException('Friendship not found');
    }

    friendship1.status = 'blocked';
    friendship2.status = 'blocked';

    await em.persistAndFlush([friendship1, friendship2]);

    // 🎯 친구 목록 업데이트 이벤트 발생 (영향받는 사용자들에게만)
    this.eventService.emitUpdateFriendList({
      updateReason: 'friend_blocked',
      friends: [], // 실제 데이터는 각 사용자별로 새로 조회
      totalCount: 0,
      targetUserIds: [userId, friendId] // 영향받는 사용자들만 지정
    });
    console.log('Friend blocked successfully');
  }

  async unblockFriend(em: EntityManager, userId: string, friendId: string): Promise<void> {
    const friendship1 = await em.findOne(Friendship, {
      user: { id: userId },
      friend: { id: friendId },
      status: 'blocked'
    });

    const friendship2 = await em.findOne(Friendship, {
      user: { id: friendId },
      friend: { id: userId },
      status: 'blocked'
    });

    if (!friendship1 || !friendship2) {
      throw new NotFoundException('Blocked friendship not found');
    }

    friendship1.status = 'active';
    friendship2.status = 'active';

    await em.persistAndFlush([friendship1, friendship2]);

    // 🎯 친구 목록 업데이트 이벤트 발생 (영향받는 사용자들에게만)
    this.eventService.emitUpdateFriendList({
      updateReason: 'friend_unblocked',
      friends: [], // 실제 데이터는 각 사용자별로 새로 조회
      totalCount: 0,
      targetUserIds: [userId, friendId] // 영향받는 사용자들만 지정
    });
    console.log('Friend unblocked successfully');
  }

  // Get pending friend requests for a user  
  async getPendingRequests(em: EntityManager, userId: string): Promise<FriendPendingRequestPayloadSchema[]> {
    const friendRequests = await em.find(FriendRequest, {
      addressee: { id: userId },
      status: 'pending'
    }, { populate: ['requester', 'addressee'] });

    // 단순한 친구 요청 배열 반환
    return friendRequests.map(request => ({
      id: request.id,
      requesterName: request.requester.name,
      requesterId: request.requester.id,
      requesterEmail: request.requester.email,
      status: request.status,
      createdAt: request.createdAt.getTime()
    }));
    console.log('Pending friend requests fetched successfully');
  }

  // Get user's friends list with online status (blocked 친구는 제외)
  async getFriendsList(em: EntityManager, userId: string, updateReason?: 'friend_request_accepted' | 'friend_blocked' | 'friend_unblocked' | 'friend_removed'): Promise<FriendListResponseSchema> {
    const friendships = await em.find(Friendship, {
      user: { id: userId },
      status: 'active'  // active인 친구만 조회
    }, { populate: ['friend'] });

          const friendslist = friendships.map(friendship => {
        const friend = friendship.friend;
        const isOnline = this.connectionService.isUserOnline(friend.id);
        const userConnection = this.connectionService.getConnectionByUserId(friend.id);
        
        return {
          id: friend.id,
          name: friend.name,
          email: friend.email,
          avatarUrl: friend.avatarUrl || '',
          isOnline,
          lastSeen: userConnection ? (typeof userConnection.connectedAt === 'number' ? userConnection.connectedAt : Date.now()) : Date.now()
        };
      });
      const friendsList: FriendListResponseSchema = {
        id: uuidv4(),
        timestamp: Date.now(),
        version: '1.0',
        type: 'friend_list',
        payload: {
          friends: friendslist,
          totalCount: friendslist.length,
          updateReason: updateReason
        }
      };
      console.log('Friends list fetched successfully');
    return friendsList;
  }

  // 🎯 블록된 친구 목록 조회
  async getBlockedFriendsList(em: EntityManager, userId: string, updateReason?: 'friend_request_accepted' | 'friend_blocked' | 'friend_unblocked' | 'friend_removed'): Promise<FriendListResponseSchema> {
    const blockedFriendships = await em.find(Friendship, {
      user: { id: userId },
      status: 'blocked'  // blocked인 친구만 조회
    }, { populate: ['friend'] });
    
    const blockedFriendslist = blockedFriendships.map(friendship => {
      const friend = friendship.friend;
      
      return {
        id: friend.id,
        name: friend.name,
        email: friend.email,
        avatarUrl: friend.avatarUrl || '',
        isOnline: false,  // 블록된 친구는 온라인 상태 표시 안함
        lastSeen: Date.now()  // 블록된 친구는 현재 시간으로 설정
      };
    });

          const blockedFriendsList: FriendListResponseSchema = {
        id: uuidv4(),
        timestamp: Date.now(),
        version: '1.0',
        type: 'friend_list',
        payload: {
          friends: blockedFriendslist,
          totalCount: blockedFriendslist.length,
          updateReason: updateReason
        }
      };
      console.log('Blocked friends list fetched successfully');
    return blockedFriendsList;
  }

  // Remove friend
  async removeFriend(em: EntityManager, userId: string, friendId: string): Promise<void> {
    const friendships = await em.find(Friendship, {
      $or: [
        { user: { id: userId }, friend: { id: friendId } },
        { user: { id: friendId }, friend: { id: userId } }
      ],
      status: 'active'
    });

    if (friendships.length === 0) {
      throw new Error('Friendship not found');
    }

    // Remove both friendship records
    await em.removeAndFlush(friendships);

    // Also remove any friend requests between these users
    const friendRequests = await em.find(FriendRequest, {
      $or: [
        { requester: { id: userId }, addressee: { id: friendId } },
        { requester: { id: friendId }, addressee: { id: userId } }
      ]
    });

    if (friendRequests.length > 0) {
      await em.removeAndFlush(friendRequests);
    }

    // 🎯 친구 목록 업데이트 이벤트 발생 (영향받는 사용자들에게만)
    this.eventService.emitUpdateFriendList({
      updateReason: 'friend_removed',
      friends: [], // 실제 데이터는 각 사용자별로 새로 조회
      totalCount: 0,
      targetUserIds: [userId, friendId] // 영향받는 사용자들만 지정
    });
    console.log('Friend removed successfully');
  }

  // Get friend request by email
  async getFriendRequestByEmail(em: EntityManager, requesterId: string, addresseeEmail: string): Promise<FriendRequest | null> {
    const addressee = await em.findOne(User, { email: addresseeEmail });
    if (!addressee) {
      return null;
    }

    const friendRequest = await em.findOne(FriendRequest, {
      requester: { id: requesterId },
      addressee: { id: addressee.id },
      status: 'pending'
    }, { populate: ['requester', 'addressee'] });

    if (!friendRequest) {
      return null;
    }

    return friendRequest;
  }}

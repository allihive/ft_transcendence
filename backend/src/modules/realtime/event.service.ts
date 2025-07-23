import { EventEmitter } from 'events';
import { 
  FriendRequestPayloadSchema, 
  FriendRequestResponsePayloadSchema,
  FriendListResponsePayloadSchema
} from './dto/friend.schema';
import { RoomInvitationPayload } from './dto/room.schema';
import { ChatMessage } from './dto/chat.schema';

export class EventService extends EventEmitter {
  constructor() {
    super();
    
    //프로세스 crash 방지용 (꼭 필요한 최소한의 처리) 지금은 사실 없음 거의 
    this.on('error', (error) => {
      console.error('EventService error:', error);
      // 로그만 찍고 끝 - 프로세스 crash 방지가 목적
    });

    // 현재 5개 리스너만 있으므로 기본값(10)으로도 충분
    // 필요시 주석 해제: this.setMaxListeners(20);
  }

//event emit
  emitUpdateFriendList(data: FriendListResponsePayloadSchema) {
    this.emit('friend: list update', data);
    console.log(`Event: Friend list updated for ${data.updateReason}`);
  }

  emitFriendRequest(data: FriendRequestPayloadSchema) {
    this.emit('friend:request', data);
    console.log(`Event: Friend request from ${data.requesterName} to ${data.addresseeName}`);
  }

  emitFriendRequestResponse(data: FriendRequestResponsePayloadSchema) {
    this.emit('friend:response', data);
    console.log(`Event: Friend request ${data.status} by ${data.addresseeName} to ${data.requesterName}`);
  }

  emitRoomInvitation(data: RoomInvitationPayload) {
    this.emit('room:invitation', data);
    console.log(`Event: Room invitation from ${data.inviterName} to ${data.inviteeName}`);
  }

  emitChatMessage(roomId: string, message: ChatMessage) {
    this.emit('chat:message', { roomId, message });
    console.log(`Event: Chat message in room ${roomId} from ${message.payload.name}`);
  }

  emitUnreadCountUpdate(data: { roomId: string; userId: string; unreadCount: number }) {
    this.emit('unread:count_update', data);
    console.log(`Event: Unread count updated for user ${data.userId} in room ${data.roomId}: ${data.unreadCount}`);
  }

  emitUserStatusUpdate(data: { userId: string; isOnline: boolean }) {
    this.emit('user:status', data);
    console.log(`Event: User status update for ${data.userId} → ${data.isOnline ? 'online' : 'offline'}`);
  }

// event listener

  onUpdateFriendList(callback: (data: FriendListResponsePayloadSchema) => void) {
    this.on('friend: list update', callback);
  }

  onFriendRequest(callback: (data: FriendRequestPayloadSchema) => void) {
    this.on('friend:request', callback);
  }

  onFriendRequestResponse(callback: (data: FriendRequestResponsePayloadSchema) => void) {
    this.on('friend:response', callback);
  }

  onRoomInvitation(callback: (data: RoomInvitationPayload) => void) {
    this.on('room:invitation', callback);
  }

  onChatMessage(callback: (data: { roomId: string; message: ChatMessage }) => void) {
    this.on('chat:message', callback);
  }

  onUnreadCountUpdate(callback: (data: { roomId: string; userId: string; unreadCount: number }) => void) {
    this.on('unread:count_update', callback);
  }

  onUserStatusUpdate(callback: (data: { userId: string; isOnline: boolean }) => void) {
    this.on('user:status', callback);
  }

} 
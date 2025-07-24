// Base message structure (백엔드에서 이미 제공)
export interface BaseMessage {
  id: string;
  timestamp: number;
  version: string;
}

// Chat message payload (백엔드 ChatMessagePayload와 동일)
export interface ChatMessagePayload {
  roomId?: string;
  userId: string;
  name: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
}

// Chat message (백엔드 ChatMessage와 동일)
export interface ChatMessage extends BaseMessage {
  type: 'chat';
  payload: ChatMessagePayload;
}


// Room member (백엔드 RoomMemberDto와 동일)
export interface RoomMember {
  userId: string;
  name: string;
  joinedAt: number;
  isOnline: boolean;
}

// Room (백엔드 RoomCreatedPayload와 동일)
export interface Room {
  id: string;
  name: string;
  masterId: string;
  description?: string;
  isPrivate: boolean;
  maxUsers: number;
  memberCount: number;
  createdAt: number;
  updatedAt: number;
}

// Room state message payload (백엔드 roomStatePayloadSchema와 동일)
export interface RoomStatePayload {
  room: Room;
  previousMessages: Array<{
    id: string;
    content: string;
    userId: string;
    userName: string;
    messageType: string;
    timestamp: number;
    isRead: boolean;
  }>;
  unreadMessages: Array<{
    id: string;
    content: string;
    userId: string;
    userName: string;
    messageType: string;
    timestamp: number;
    isRead: boolean;
  }>;
  members: RoomMember[];
  readState: {
    lastReadTimestamp: number;
    unreadCount: number;
    totalMessages: number;
  };
}

// Room state message (백엔드 roomStateMessageSchema와 동일)
export interface RoomStateMessage extends BaseMessage {
  type: 'room_state';
  payload: RoomStatePayload;
}

// Friend (백엔드 friendListResponsePayloadSchema의 friends 배열 요소와 동일)
export interface Friend {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isOnline: boolean;
  lastSeen: number;
}

// Friend request (백엔드 FriendPendingRequestPayloadSchema와 동일)
export interface FriendRequest {
  id: string;
  requesterName: string;
  requesterId: string;
  requesterEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

// Friend request payload (백엔드 FriendRequestPayloadSchema와 동일)
export interface FriendRequestPayload {
  requesterId: string;
  requesterName: string;
  addresseeId: string;
  addresseeEmail: string;
  addresseeName: string;
  message?: string;
  createdAt: number;
}

// Friend request message (백엔드 FriendRequestSchema와 동일)
export interface FriendRequestMessage extends BaseMessage {
  type: 'friend_request';
  payload: FriendRequestPayload;
}

// Friend request response payload (백엔드 FriendRequestResponsePayloadSchema와 동일)
export interface FriendRequestResponsePayload {
  requestId: string;
  requesterId: string;
  requesterName: string;
  addresseeId: string;
  addresseeName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  acceptedAt?: number;
}

// Friend request response message (백엔드 FriendRequestResponseSchema와 동일)
export interface FriendRequestResponseMessage extends BaseMessage {
  type: 'friend_request_response';
  payload: FriendRequestResponsePayload;
}

// Friend list response payload (백엔드 FriendListResponsePayloadSchema와 동일)
export interface FriendListResponsePayload {
  friends: Friend[];
  totalCount: number;
  updateReason?: 'friend_request_accepted' | 'friend_blocked' | 'friend_unblocked' | 'friend_removed';
  targetUserIds?: string[];
}

// Friend list response message (백엔드 FriendListResponseSchema와 동일)
export interface FriendListResponseMessage extends BaseMessage {
  type: 'friend_list';
  payload: FriendListResponsePayload;
}

// Error payload (백엔드 error.schema.ts와 동일)
export interface ErrorPayload {
  code: string;
  message: string;
  details?: any;
}

// Error message (백엔드 ErrorMessage와 동일)
export interface ErrorMessage extends BaseMessage {
  type: 'error';
  payload: ErrorPayload;
}

// Ping message (백엔드 PingMessage와 동일)
export interface PingMessage extends BaseMessage {
  type: 'ping';
}

// Pong payload (백엔드 PongPayload와 동일)
export interface PongPayload {
  latency?: number;
}

// Pong message (백엔드 PongMessage와 동일)
export interface PongMessage extends BaseMessage {
  type: 'pong';
  payload: PongPayload;
}

// Unread count payload (백엔드 UnreadCount와 동일)
export interface UnreadCountPayload {
  roomId: string;
  unreadCount: number;
}

// Unread count message (백엔드 UnreadCountMessage와 동일)
export interface UnreadCountMessage extends BaseMessage {
  type: 'unread_count';
  payload: UnreadCountPayload;
}

// Room joined payload (백엔드 RoomJoinedPayload와 동일)
export interface RoomJoinedPayload {
  roomId: string;
  roomName: string;
  inviterName: string;
  newMemberName: string;
}

// Room joined message (백엔드 RoomJoinedMessage와 동일)
export interface RoomJoinedMessage extends BaseMessage {
  type: 'room_joined';
  payload: RoomJoinedPayload;
}

// Leave room payload (백엔드 LeaveRoomPayload와 동일)
export interface LeaveRoomPayload {
  roomId: string;
  userId: string;
  name: string;
}

// Leave room message (백엔드 LeaveRoomMessage와 동일)
export interface LeaveRoomMessage extends BaseMessage {
  type: 'leave_room';
  payload: LeaveRoomPayload;
}

// User status (online/offline) message
export interface UserStatusPayload {
  userId: string;
  isOnline: boolean;
}
export interface UserStatusMessage extends BaseMessage {
  type: 'user_status';
  payload: UserStatusPayload;
}

// Mark read payload
export interface MarkReadPayload {
  roomId: string;
  lastReadTimestamp: number;
}

// Mark read message
export interface MarkReadMessage extends BaseMessage {
  type: 'mark_read';
  payload: MarkReadPayload;
}

// Connection status
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

// Room invitation message
export interface RoomInvitationMessage extends BaseMessage {
  type: 'room_invitation';
  payload: {
    roomId: string;
    roomName: string;
    inviterName: string;
    message: string;
  };
}

// WebSocket event handlers
export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onRoomJoined?: (message: RoomJoinedMessage) => void;
  onRoomInvitation?: (message: RoomInvitationMessage) => void;
  onLeaveRoom?: (message: LeaveRoomMessage) => void;
  onReconnect?: () => void;
  onUnreadCount?: (message: UnreadCountMessage) => void;
  onFriendRequest?: (message: FriendRequestMessage) => void;
  onFriendRequestResponse?: (message: FriendRequestResponseMessage) => void;
  onFriendList?: (message: FriendListResponseMessage) => void;
  onErrorMessage?: (message: ErrorMessage) => void;
  onUserStatus?: (message: UserStatusMessage) => void;
  onRoomState?: (message: RoomStateMessage) => void;
}

// Union type for all messages
export type AnyMessage = 
  | ChatMessage
  | RoomStateMessage
  | RoomJoinedMessage
  | LeaveRoomMessage
  | UnreadCountMessage
  | FriendRequestMessage
  | FriendRequestResponseMessage
  | FriendListResponseMessage
  | ErrorMessage
  | PingMessage
  | PongMessage
  | UserStatusMessage
  | MarkReadMessage; 

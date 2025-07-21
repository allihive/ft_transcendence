// Shared types between frontend and backend
// This ensures complete type consistency across the application

// WebSocket connection status
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

// Base message structure
export interface BaseMessage {
  id: string;
  timestamp: number;
  version: string;
}

// Message types for client -> server
export interface ChatMessage extends BaseMessage {
  type: 'chat';
  payload: {
    roomId: string;
    content: string;
    userId: string;
    name: string;
    messageType?: 'text' | 'image' | 'file';
  };
}

export interface SyncMessage extends BaseMessage {
  type: 'sync';
  payload: {
    roomId: string;
    users: any[];
    messages: any[];
  };
}

export interface PingMessage extends BaseMessage {
  type: 'ping';
}

export interface PongMessage extends BaseMessage {
  type: 'pong';
  payload: {
    latency?: number;
  };
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  payload: {
    code: number;
    message: string;
  };
}

// Notification types for server -> client
export interface FriendRequestNotification extends BaseMessage {
  type: 'friend_request';
  payload: {
    requestId: string;
    requesterName: string;
    requesterUsername: string;
    requesterAvatar?: string;
  };
}

export interface FriendRequestResponseNotification extends BaseMessage {
  type: 'friend_request_response';
  payload: {
    requestId: string;
    accepted: boolean;
    friendName: string;
    friendUsername: string;
    friendAvatar?: string;
  };
}

export interface FriendListNotification extends BaseMessage {
  type: 'friend_list';
  payload: {
    updateReason: 'friend_request_accepted' | 'friend_blocked' | 'friend_unblocked' | 'friend_removed';
    friends: Array<{
      userId: string;
      username: string;
      avatar?: string;
      status: 'active' | 'blocked';
      isOnline: boolean;
      connectedAt?: number;
    }>;
  };
}

export interface RoomJoinedNotification extends BaseMessage {
  type: 'room_joined';
  payload: {
    roomId: string;
    roomName: string;
    inviterName: string;
    newMemberName: string;
  };
}

export interface RoomInvitationNotification extends BaseMessage {
  type: 'room_invitation';
  payload: {
    roomId: string;
    roomName: string;
    inviterName: string;
    inviteeName: string;
  };
}

// Room state message
export interface RoomStateMessage extends BaseMessage {
  type: 'room_state';
  payload: {
    room: {
      id: string;
      name: string;
      masterId: string;
      description?: string;
      isPrivate: boolean;
      maxUsers: number;
      memberCount: number;
      createdAt: number;
      updatedAt: number;
    };
    previousMessages: Array<{
      id: string;
      content: string;
      userId: string;
      userName: string;
      messageType: string;
      timestamp: string;
      isRead: boolean;
    }>;
    unreadMessages: Array<{
      id: string;
      content: string;
      userId: string;
      userName: string;
      messageType: string;
      timestamp: string;
      isRead: boolean;
    }>;
    members: Array<{
      userId: string;
      name: string;
      joinedAt: string;
      isOnline: boolean;
    }>;
    readState: {
      lastReadTimestamp: string;
      unreadCount: number;
      totalMessages: number;
    };
  };
}

// Union types
export type AnyMessage = ChatMessage | SyncMessage | PingMessage | PongMessage | RoomStateMessage | ErrorMessage | FriendRequestNotification | FriendRequestResponseNotification | FriendListNotification | RoomJoinedNotification | RoomInvitationNotification;
export type NotificationMessage = FriendRequestNotification | FriendRequestResponseNotification | FriendListNotification | RoomJoinedNotification | RoomInvitationNotification;

// Entity types
export interface Room {
  id: string;
  name: string;
  description?: string;
  masterId: string;
  isPrivate: boolean;
  maxUsers: number;
  memberCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isOnline: boolean;
  lastSeen: number;
}

export interface FriendRequest {
  id: string;
  requesterName: string;
  requesterUsername: string;
  requesterAvatar?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// API Request/Response types
export interface RoomCreationRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxUsers?: number;
}

export interface RoomInvitationRequest {
  inviteeNames: string[];
}

// WebSocket event handlers
export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: AnyMessage) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onSync?: (data: SyncMessage) => void;
  onRoomState?: (data: RoomStateMessage) => void;
  onFriendRequest?: (data: FriendRequestNotification['payload']) => void;
  onFriendRequestResponse?: (data: FriendRequestResponseNotification['payload']) => void;
  onFriendList?: (data: FriendListNotification['payload']) => void;
  onRoomJoined?: (data: RoomJoinedNotification['payload']) => void;
  onRoomInvitation?: (data: RoomInvitationNotification['payload']) => void;
  onErrorMessage?: (data: any) => void;
  onReconnect?: () => void;
} 
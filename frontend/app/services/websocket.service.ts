import type { 
  AnyMessage, 
  ChatMessage, 
  PingMessage,
  ConnectionStatus,
  WebSocketEventHandlers,
  PongMessage,
  UnreadCountMessage,
  RoomJoinedMessage, 
  LeaveRoomMessage, 
  FriendRequestMessage, 
  FriendRequestResponseMessage, 
  FriendListResponseMessage, 
  UserStatusMessage, 
  RoomStateMessage 
} from '../types/realtime.types';
import { useAuth } from '../stores/useAuth';


const generateId = (): string => {
  return crypto.randomUUID();
};

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;
  private pingInterval: NodeJS.Timeout | null = null;
  private eventHandlers: WebSocketEventHandlers = {};
  private connectionStatus: ConnectionStatus = 'disconnected';

  async connect(handlers: WebSocketEventHandlers = {}): Promise<void> {
    console.log('🔄 Starting WebSocket connection... (attempt #' + (this.reconnectAttempts + 1) + ')');
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('🛑 WebSocket already connected, skipping connect');
        return;
      }

      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        console.log('🛑 WebSocket is connecting, waiting...');
        return;
      }
      
      // Try cookie-based connection first
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//localhost:3000/api/realtime/ws`;
      
      console.log('🔗 Attempting cookie-based WebSocket connection');
    
      this.ws = new WebSocket(wsUrl);
    this.connectionStatus = 'connecting';
      // console.log('🔍 WebSocket created, initial readyState:', this.ws.readyState);
      
      this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
        // console.log('🔍 WebSocket readyState after onopen:', this.ws?.readyState);
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
        this.eventHandlers.onOpen?.();
          this.startPingInterval();
      };
      
      this.ws.onclose = (event) => {
        console.log('🛑 WebSocket connection closed:', event.code, event.reason);
        // console.log('🔍 WebSocket readyState on close:', this.ws?.readyState);
        this.disconnect();
        this.eventHandlers.onClose?.();
        
        // Checking the authentication failure here is better now we don't use any api anymore
        if (event.code === 1008) { // Policy violation (i sent 1008from server when unauthorized)
          console.log('🔐 Authentication failed, logging out...');
          this.handleAuthFailure();
          return;
          }
          
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.attemptReconnect(), this.reconnectDelay);
          } else {
          console.log('❌ Max reconnection attempts reached');
          this.handleAuthFailure();
          }
        };

      this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
        console.log('🔍 WebSocket readyState on error:', this.ws?.readyState);
          this.connectionStatus = 'error';
          this.eventHandlers.onError?.(error);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // console.log(`📨 Received message:`, message);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  disconnect(): void {
    console.log('🛑 Disconnecting WebSocket...');
    this.stopPingInterval();
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close();
      this.ws = null;
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
    }

  send(message: AnyMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket is not connected', { readyState: this.ws?.readyState });
      return;
    }
    
    // console.log('📤 Sending message:', message.type, message);
    this.ws.send(JSON.stringify(message));
  }

  sendChatMessage(roomId: string, content: string): void {
    const user = useAuth.getState().user;
    if (!user) {
      console.error('❌ User not authenticated, cannot send message');
      return;
    }
    const message: ChatMessage = {
      id: generateId(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'chat',
      payload: {
        roomId,
        userId: user.id,
        name: user.name,
        content,
        messageType: 'text'
      }
    };
    
    // console.log(`📤 Sending chat message: ${content} to room ${roomId} (ID: ${message.id})`);
    this.send(message);
  }

  markMessageAsRead(roomId: string, messageTimestamp: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error(`❌ WebSocket not open, cannot send mark read request`);
      return;
    }
    
    const message = {
      id: generateId(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'mark_read' as const,
      payload: {
        roomId,
        lastReadTimestamp: messageTimestamp
      }
    };
    
    // console.log(`📖 Marking message as read in room ${roomId} up to timestamp: ${messageTimestamp}`);
    this.send(message);
  }

  requestRoomSync(roomId: string): void {    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error(`❌ WebSocket not open, cannot send room sync request for room: ${roomId}`);
      return;
    }
    
    const message = {
      id: generateId(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'room_state' as const,
      payload: {
        room: { 
          id: roomId,
          name: '',
          masterId: '',
          description: '',
          isPrivate: false,
          maxUsers: 50,
          memberCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        previousMessages: [],
        unreadMessages: [],
        members: [],
        readState: {
          lastReadTimestamp: 0,
          unreadCount: 0,
          totalMessages: 0
        }
      }
    };
    
    // console.log(`📤 Sending room sync message:`, message);
    this.send(message);
    // console.log(`✅ Room sync message sent for room: ${roomId}`);
  }

  sendPing(): void {
    const message: PingMessage = {
      id: generateId(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'ping'
    };
    
    this.send(message);
  }

  sendPong(): void {
    const message: PongMessage = {
      id: generateId(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'pong',
      payload: {}
    };
    this.send(message);
  }

  private handleMessage(message: AnyMessage): void {
    // console.log(`📨 Received ${message.type} message`, message);
    switch (message.type) {
      case 'chat':
        this.eventHandlers.onChatMessage?.(message as ChatMessage);
        break;
      case 'room_joined':
        this.eventHandlers.onRoomJoined?.(message as RoomJoinedMessage);
        break;
      case 'leave_room':
        this.eventHandlers.onLeaveRoom?.(message as LeaveRoomMessage);
        break;
      case 'unread_count':
        this.eventHandlers.onUnreadCount?.(message as UnreadCountMessage);
        break;
      case 'friend_request':
        this.eventHandlers.onFriendRequest?.(message as FriendRequestMessage);
        break;
      case 'friend_request_response':
        this.eventHandlers.onFriendRequestResponse?.(message as FriendRequestResponseMessage);
        break;
      case 'friend_list':
        this.eventHandlers.onFriendList?.(message as FriendListResponseMessage);
        break;
      case 'user_status':
        this.eventHandlers.onUserStatus?.(message as UserStatusMessage);
        break;
      case 'room_state':
        // console.log('🏠 Processing room_state message:', message);
        this.eventHandlers.onRoomState?.(message as RoomStateMessage);
        // console.log('🏠 onRoomState handler called');
        break;
      case 'ping':
        this.sendPong();
        // console.log('🏓 Ping received - connection is alive - send pong');
        break;
      case 'pong':
        // console.log('🏓 Pong receive/d - connection is alive');
        break;
      default:
        console.warn('Unknown message type:', (message as any).type);
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private async attemptReconnect(): Promise<void> {
    this.reconnectAttempts++;
    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    try {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.connect();
      } catch (error) {
      console.error('❌ Reconnection failed:', error);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.attemptReconnect(), this.reconnectDelay);
      } else {
        console.log('❌ Max reconnection attempts reached');
        this.connectionStatus = 'error';
      }
    }
  }

  addEventHandlers(handlers: Partial<WebSocketEventHandlers>): void {
    if (Object.keys(handlers).length === 0) {
      // console.log('🧹 Clearing all event handlers');
      this.eventHandlers = {};
    } else {
      // console.log('🔗 Adding/updating event handlers');
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }
  }

  public handleAuthFailure(): void {
    console.log('🔐 Handling authentication failure...');
    
    // Disconnect WebSocket first to prevent multiple 401 errors
    this.addEventHandlers({});
    this.disconnect();
    const user = useAuth.getState().user;
    console.log('🔐 User:', user);
    if (!user) {
      // console.log('🔐 User is not logged in, skipping auth failure dialog');
      return;
  }
    // Show service connection error notification
    alert('Service connection error, will be redirected to home page');
    
    // Redirect to home page
    window.location.href = '/';
  }
}

export const websocketService = new WebSocketService(); 
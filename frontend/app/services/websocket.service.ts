import type { 
  AnyMessage, 
  ChatMessage, 
  SyncMessage,
  PingMessage,
  RoomStateMessage,
  ConnectionStatus,
  WebSocketEventHandlers,
  PongMessage,
  UnreadCountMessage,
  RoomJoinedMessage,
  FriendRequestMessage,
  FriendRequestResponseMessage,
  FriendListResponseMessage,
  ErrorMessage,
  UserStatusMessage,

} from '../types/realtime.types';

// 스키마 맞추기 용 더미 ID (백엔드에서 사용하지 않음)
const generateId = (): string => {
  return crypto.randomUUID(); // 간단하게 UUID 사용
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // 5에서 3으로 감소
  private reconnectDelay = 2000; // 0.5초에서 2초로 증가
  private pingInterval: NodeJS.Timeout | null = null;
  private eventHandlers: WebSocketEventHandlers = {};
  private connectionStatus: ConnectionStatus = 'disconnected';
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getWebSocketUrl(): Promise<string | null> {
    // 캐시된 토큰이 있고 아직 만료되지 않았으면 사용
    // if (this.cachedToken && Date.now() < this.tokenExpiry) {
    //   console.log('🔐 Using cached WebSocket token');
    // } else {
    //   // 토큰이 없거나 만료되었으면 새로 요청
    //   this.cachedToken = await this.getWebSocketToken();
    //   if (this.cachedToken) {
    //     // 토큰 만료 시간 설정 (5분 - 30초 여유)
    //     this.tokenExpiry = Date.now() + (5 * 60 - 30) * 1000;
    //   }
    this.cachedToken = await this.getWebSocketToken();
    if (!this.cachedToken) {
        // alert('Session expired. Please login again.');
        // window.location.href = '/login';
        return null;
      }
    const token = this.cachedToken;
    
    // // 개발 환경에서는 직접 백엔드로 연결
    // if (import.meta.env.DEV) {
    //   if (token) {
    //     return `ws://localhost:3000/api/realtime/ws?token=${encodeURIComponent(token)}`;
    //   }
    //   return 'ws://localhost:3000/api/realtime/ws';
    // }
    
    // 프로덕션에서는 상대 경로 사용
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    console.log('🔍 WebSocket URL generation');
    
    return `${protocol}//${host}/api/realtime/ws?token=${encodeURIComponent(token)}`;
  }

  private async getWebSocketToken(): Promise<string | null> {
    try {
      const tokenUrl = `${API_BASE}/api/auth/ws-token`;
      console.log('🔐 Requesting WebSocket token from server...', {
        url: tokenUrl,
        apiBase: API_BASE,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
      
      const response = await fetch(tokenUrl, {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('❌ Failed to get WebSocket token:', response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      // data.expiresIn = 7;
      console.log('✅ WebSocket token received:', {
        token: data.wsToken ? data.wsToken.substring(0, 20) + '...' : 'null',
        expiresIn: data.expiresIn,
        timestamp: new Date().toISOString()
      });
      
      return data.wsToken;
    } catch (error) {
      console.error('❌ Error getting WebSocket token:', error);
      return null;
    }
  }

  async connect(handlers: WebSocketEventHandlers = {}): Promise<void> {
    console.log('🔄 Starting WebSocket connection...');
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    
    try {
      const wsUrl = await this.getWebSocketUrl();
      console.log('❌ wsUrl:', wsUrl);
      if (!wsUrl) {
        console.log('❌ wsUrl is null, aborting connect');
        return;
      }
      console.log('🔗 Connecting to WebSocket:', wsUrl);
      
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
        this.ws = new WebSocket(wsUrl);
      } else {
        console.log('🔄 WebSocket already connected, skipping connection');
      }
      this.connectionStatus = 'connecting';
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.eventHandlers.onOpen?.();
        this.startPingInterval();
      };
      
      this.ws.onclose = (event) => {
        console.log('🛑 WebSocket connection closed:', event.code, event.reason);
        // this.connectionStatus = 'disconnected';
        this.stopPingInterval();
        this.eventHandlers.onClose?.();
        if (event.code === 4001) {
          alert("Session expired. Please login again.");
          fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
          .then(() => {
            window.location.href = "/login";
          })
          .catch(() => {
              window.location.href = "/login";
          });
          return;
        }
        // try to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.attemptReconnect(), this.reconnectDelay);
        } else {
          console.log('❌ Max reconnection attempts reached');
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.connectionStatus = 'error';
        this.eventHandlers.onError?.(error);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`📨 Received message:`, message);
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  send(message: AnyMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket is not connected');
      return;
    }
    
    console.log('📤 Sending message:', message);
    this.ws.send(JSON.stringify(message));
  }

  sendChatMessage(roomId: string, content: string, userId: string, name: string): void {
    const message: ChatMessage = {
      id: generateId(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'chat',
      payload: {
        roomId,
        userId,
        name,
        content,
        messageType: 'text'
      }
    };
    
    this.send(message);
  }

  requestRoomSync(roomId: string): void {
    const message: SyncMessage = {
      id: generateId(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'sync',
      payload: {
        roomId,
        users: [],
        messages: [],
        syncType: 'rooms'
      }
    };
    
    this.send(message);
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
    console.log(`📨 Received ${message.type} message`);

    switch (message.type) {
      case 'chat':
        this.eventHandlers.onChatMessage?.(message as ChatMessage);
        break;
      case 'sync':
        this.eventHandlers.onSync?.(message as SyncMessage);
        break;
      case 'room_state':
        this.eventHandlers.onRoomState?.(message as RoomStateMessage);
        break;
      case 'room_joined':
        this.eventHandlers.onRoomJoined?.(message as RoomJoinedMessage);
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
      case 'error':
        this.eventHandlers.onErrorMessage?.(message as ErrorMessage);
        break;
      case 'ping':
        this.sendPong();
        console.log('🏓 Ping received - connection is alive - send pong');
        break;
      case 'pong':
        console.log('🏓 Pong received - connection is alive');
        break;
      default:
        console.warn('Unknown message type:', (message as any).type);
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000); // 30초마다 ping
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
      await this.connect();
    } catch (error) {
      console.error('❌ Reconnection failed:', error);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.attemptReconnect(), this.reconnectDelay);
      }
    }
  }

  addEventHandlers(handlers: Partial<WebSocketEventHandlers>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService(); 
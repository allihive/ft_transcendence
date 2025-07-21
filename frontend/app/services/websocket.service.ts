import type { 
  AnyMessage, 
  ChatMessage, 
  SyncMessage,
  PingMessage,
  RoomStateMessage,
  ConnectionStatus,
  WebSocketEventHandlers,
  PongMessage
} from '../types/realtime.types';

// 스키마 맞추기 용 더미 ID (백엔드에서 사용하지 않음)
const generateId = (): string => {
  return crypto.randomUUID(); // 간단하게 UUID 사용
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

  private async getWebSocketUrl(): Promise<string> {
    // 캐시된 토큰이 있고 아직 만료되지 않았으면 사용
    if (this.cachedToken && Date.now() < this.tokenExpiry) {
      console.log('🔐 Using cached WebSocket token');
    } else {
      // 토큰이 없거나 만료되었으면 새로 요청
      this.cachedToken = await this.getWebSocketToken();
      if (this.cachedToken) {
        // 토큰 만료 시간 설정 (3분 - 30초 여유)
        this.tokenExpiry = Date.now() + (3 * 60 - 30) * 1000;
      }
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
    
    if (token) {
      return `${protocol}//${host}/api/realtime/ws?token=${encodeURIComponent(token)}`;
    }
    
    return `${protocol}//${host}/api/realtime/ws`;
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
      console.log('✅ WebSocket token received:', {
        token: data.wsToken ? data.wsToken.substring(0, 20) + '...' : 'null',
        expiresIn: data.expiresIn,
        timestamp: new Date().toISOString()
      });
      
      return data.wsToken;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ WebSocket token request timeout');
      } else {
        console.error('❌ Error getting WebSocket token:', error);
      }
      return null;
    }
  }

  // Connect to WebSocket server
  async connect(handlers: WebSocketEventHandlers = {}): Promise<void> {
    console.log('🔄 connect() called, current state:', this.connectionStatus);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already open, returning');
      return;
    }

    // 기존 연결이 있다면 정리
    if (this.ws) {
      console.log('🧹 Cleaning up existing WebSocket connection');
      this.ws.close();
      this.ws = null;
    }

    // httpOnly 쿠키는 JavaScript에서 접근할 수 없으므로 백엔드에서 처리
    console.log('🔗 Attempting WebSocket connection with automatic cookie transmission');

    this.connectionStatus = 'connecting';
    this.eventHandlers = handlers;

    try {
      const baseUrl = await this.getWebSocketUrl();
      
      console.log('🔗 Attempting WebSocket connection to:', baseUrl);
      console.log('🔍 Connection details:', {
        protocol: window.location.protocol,
        host: window.location.host,
        fullUrl: baseUrl,
        timestamp: new Date().toISOString()
      });

      // 쿠키는 자동으로 전송되므로 별도 설정 불필요
      console.log('🔗 Creating WebSocket with URL:', baseUrl);
      this.ws = new WebSocket(baseUrl);

      return new Promise((resolve, reject) => {
        // Connection timeout (10 seconds - 더 늘림)
        const connectionTimeout = setTimeout(() => {
          console.error('❌ WebSocket connection timeout after 10 seconds');
          console.error('Timeout details:', {
            readyState: this.ws?.readyState,
            url: baseUrl,
            timestamp: new Date().toISOString()
          });
          this.connectionStatus = 'error';
          this.eventHandlers.onError?.(new Error('Connection timeout'));
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ WebSocket connected successfully');
          console.log('Connection established at:', new Date().toISOString());
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.eventHandlers.onOpen?.();
          
          // Trigger reconnection event for sync restoration
          this.eventHandlers.onReconnect?.();
          resolve();
        };

        this.ws!.onmessage = (event) => {
          try {
            const message: AnyMessage = JSON.parse(event.data);
            console.log('📨 Received WebSocket message:', message.type, message);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws!.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('🔚 WebSocket disconnected:', event.code, event.reason);
          console.log('Close event details:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            timestamp: new Date().toISOString()
          });
          
          // 인증 실패로 인한 연결 종료인 경우 토큰 초기화
          if (event.code === 1008) {
            console.log('🔐 Authentication failed - clearing cached token');
            this.cachedToken = null;
            this.tokenExpiry = 0;
            this.connectionStatus = 'disconnected';
            this.eventHandlers.onClose?.();
            return; // 인증 실패시 재연결 시도하지 않음
          }
          
          // 정상 종료가 아닌 경우에만 재연결 시도
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`🔄 Attempting reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            this.connectionStatus = 'connecting';
            this.attemptReconnect();
          } else {
            this.connectionStatus = 'disconnected';
            this.stopPingInterval();
            this.eventHandlers.onClose?.();
          }
        };

        this.ws!.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('❌ WebSocket error:', error);
          console.error('Error details:', {
            readyState: this.ws?.readyState,
            url: baseUrl,
            timestamp: new Date().toISOString()
          });
          this.connectionStatus = 'error';
          this.eventHandlers.onError?.(error);
          reject(error);
        };
      });
    } catch (error) {
      console.error('❌ Error in connect():', error);
      this.connectionStatus = 'error';
      this.eventHandlers.onError?.(error as Error);
      throw error;
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.stopPingInterval();
    this.connectionStatus = 'disconnected';
  }

  // Get connection status
  getConnectionStatus(): string {
    if (!this.ws) return 'not_initialized';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  // Send a message to the server
  send(message: AnyMessage): void {
    console.log('🔍 WebSocket send called:', {
      messageType: message.type,
      readyState: this.ws?.readyState,
      isConnected: this.ws?.readyState === WebSocket.OPEN
    });
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      const messageString = JSON.stringify(message);
      console.log('📤 Sending WebSocket message:', messageString);
      this.ws.send(messageString);
    } else {
      console.error('❌ WebSocket is not connected. Ready state:', this.ws?.readyState);
    }
  }

  // Send a chat message
  sendChatMessage(roomId: string, content: string, userId: string, name: string): void {
    console.log(`📤 Sending chat message to room ${roomId}`);
    console.log('🔍 sendChatMessage details:', { roomId, content, userId, name });
    console.log('🔍 WebSocket readyState:', this.ws?.readyState);
    console.log('🔍 Connection status:', this.connectionStatus);
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not open, cannot send chat message');
      return;
    }
    
    const message: ChatMessage = {
      id: generateId(),
      timestamp: Date.now(), // Use current timestamp
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
    
    console.log('🔍 Chat message object:', message);
    this.send(message);
  }

  // Request room sync
  requestRoomSync(roomId: string): void {
    const message: SyncMessage = {
      id: generateId(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'sync',
      payload: {
        roomId,
        users: [],
        messages: []
      }
    };
    this.send(message);
  }

  // Send ping message
  sendPing(): void {
    const currentTime = Date.now();
    console.log('🕐 Current timestamp:', currentTime, 'Date:', new Date(currentTime).toISOString());
    
    const message: PingMessage = {
      id: generateId(),
      timestamp: currentTime,
      version: '1.0',
      type: 'ping'
    };
    this.send(message);
  }

  // Handle incoming messages
  private handleMessage(message: AnyMessage): void {
    console.log(`📨 Received ${message.type} message`);
    
    this.eventHandlers.onMessage?.(message);

    switch ((message as any).type) {
      case 'chat':
        this.eventHandlers.onChatMessage?.(message as any);
        break;
      case 'sync':
        this.eventHandlers.onSync?.(message as any);
        break;
      case 'room_state':
        this.eventHandlers.onRoomState?.(message as any);
        break;
      case 'friend_request':
        this.eventHandlers.onFriendRequest?.(message as any);
        break;
      case 'friend_request_response':
        this.eventHandlers.onFriendRequestResponse?.(message as any);
        break;
      case 'friend_list':
        this.eventHandlers.onFriendList?.(message as any);
        break;
      case 'room_joined':
        this.eventHandlers.onRoomJoined?.(message as any);
        break;
      case 'room_invitation':
        this.eventHandlers.onRoomInvitation?.(message as any);
        break;
      case 'error':
        this.eventHandlers.onErrorMessage?.(message as any);
        console.error('❌ WebSocket error message received:', message);
        break;
      case 'ping':
        // Handle ping message from server and respond with pong
        console.log('🏓 Ping received from server, sending pong response');
        const pongMessage: PongMessage = {
          id: generateId(),
          timestamp: Date.now(),
          version: '1.0',
          type: 'pong',
          payload: {
            latency: 0 // Server will calculate actual latency
          }
        };
        this.send(pongMessage);
        break;
      case 'pong':
        // Handle pong response from server
        console.log('🏓 Pong received from server, latency:', (message as any).payload?.latency, 'ms');
        break;
      default:
        console.warn('Unknown message type:', (message as any).type);
    }
  }

  // Start ping interval for connection health check
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000); // Send ping every 30 seconds
  }

  // Stop ping interval
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Attempt to reconnect
  private async attemptReconnect(): Promise<void> {
    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.connect(this.eventHandlers);
        // 재연결 성공시 카운터 리셋
        this.reconnectAttempts = 0;
      } catch (error) {
        console.error('Reconnection failed:', error);
        // 재연결 실패시 상태를 disconnected로 설정
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.connectionStatus = 'disconnected';
          this.eventHandlers.onClose?.();
        }
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Add additional event handlers
  addEventHandlers(handlers: Partial<WebSocketEventHandlers>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService(); 
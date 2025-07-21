import { FastifyPluginAsync, FastifyInstance } from "fastify";
import { FastifyPluginOptions } from "fastify";
import { RoomService } from "./room.service";
import { ConnectionService } from "./connection.service";
import { MessageService } from "./message.service";
import { FriendshipService } from "./friendship.service";
import { UserService } from "../user/user.service";
import { EventService } from "./event.service";
import { EventListenerService } from "./event-listener.service";
import { WebSocketConnectionManager, WebSocketConnection } from './websocket-connection.manager';
import { WebSocketMessageHandler } from './websocket-message.handler';
import { WebSocketErrorHandler } from './websocket-error-handler';
import { SyncService } from './sync.service';
import { AnyMessage } from "./dto";

export class WebSocketService {
  private connectionManager: WebSocketConnectionManager;
  private messageHandler: WebSocketMessageHandler;

  constructor(
    private roomService: RoomService,
    private connectionService: ConnectionService,
    private messageService: MessageService,
    private friendshipService: FriendshipService,
    private userService: UserService,
    private eventService: EventService,
    private eventListenerService: EventListenerService,
    private syncService: SyncService,
    private orm: any // MikroORM instance
  ) {
    this.connectionManager = new WebSocketConnectionManager(
      connectionService,
      roomService,
      messageService,
      friendshipService,
      syncService
    );

    this.messageHandler = new WebSocketMessageHandler(
      messageService,
      syncService,
      roomService,
      this.connectionManager
    );
    
    // 🎯 이벤트 리스너 설정 (분리된 서비스 사용)
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // EventListenerService에 콜백 함수들을 전달하여 이벤트 리스너 설정
    this.eventListenerService.setupEventListeners(
      // sendToUser
      (userId: string, message: AnyMessage) => this.sendToUser(userId, message),
      // broadcastToRoom
      (roomId: string, message: AnyMessage) => this.broadcastToRoom(roomId, message)
    );
  }

  // Fastify plugin for WebSocket support
  plugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    await fastify.register(require('@fastify/websocket'));

    fastify.get('/ws', { websocket: true } as any, (connection: any, req: any) => {
      console.log('🔌 WebSocket connection received from Fastify');
      console.log('🔌 Connection object:', connection);
      console.log('🔌 Connection keys:', Object.keys(connection));
      console.log('🔌 Request object:', req);
      
      // WebSocket 객체 찾기
      let socket: any = null;
      
      // 1. connection.socket이 있는 경우
      if (connection.socket && connection.socket.readyState !== undefined) {
        socket = connection.socket;
        console.log('✅ Found socket in connection.socket');
      }
      // 2. connection 객체 자체가 socket인 경우
      else if (connection.readyState !== undefined) {
        socket = connection;
        console.log('✅ Connection object itself is the socket');
      }
      // 3. 다른 구조일 수 있음
      else {
        console.error('❌ No valid WebSocket found in connection object');
        console.log('🔍 Connection type:', typeof connection);
        console.log('🔍 Connection properties:', Object.getOwnPropertyNames(connection));
        return;
      }
      
      this.handleWebSocketConnection({ socket }, req);
    });
  };

  // Handle new WebSocket connection
  private async handleWebSocketConnection(connection: any, request: any) {
    try {
      // 사용자 인증
      const authResult = this.verifyUser(request);
      
      if (!authResult.success) {
        console.error('WebSocket authentication failed:', authResult.error);
        if (connection && connection.socket) {
          connection.socket.close(1008, authResult.error);
        }
        return;
      }
      
      const { user } = authResult;
      request.user = user;
      
      console.log('✅ WebSocket authentication successful for user:', user.name);
      
      // 연결 생성을 ConnectionManager에 위임
      const wsConnection = await this.connectionManager.createConnection(connection, request);
      
      if (!wsConnection) {
        console.error('Failed to create WebSocket connection');
        return;
      }

      console.log('✅ WebSocket connection created successfully:', wsConnection.socketId);

      // 메시지 수신 처리
      connection.socket.on('message', async (data: Buffer) => {
        await this.handleMessage(wsConnection, data);
      });

      // 연결 종료 처리
      connection.socket.on('close', async () => {
        await this.connectionManager.handleConnectionClose(wsConnection.socketId);
      });

      connection.socket.on('error', async (error: Error) => {
        console.error(`WebSocket error for ${wsConnection.socketId}:`, error);
        await this.connectionManager.handleConnectionClose(wsConnection.socketId);
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      if (connection && connection.socket) {
        try {
          connection.socket.close(1011, 'Internal server error');
        } catch (closeError) {
          console.error('Error closing socket:', closeError);
        }
      }
    }
  }

  /**
   * Verify user from cookie or URL parameter
   */
  private verifyUser(request: any): { 
    success: boolean; 
    user?: any; 
    authMethod?: string; 
    error?: string; 
  } {
    console.log('🔍 WebSocket authentication - Request headers:', request.headers);
    console.log('🔍 WebSocket authentication - Cookie header:', request.headers?.cookie);
    console.log('🔍 WebSocket authentication - Request URL:', request.url);
    console.log('🔍 WebSocket authentication - Request method:', request.method);
    
    let accessToken = '';
    let urlToken = '';
    
    // 1. URL 쿼리 파라미터에서 토큰 확인
    if (request.url) {
      const url = new URL(request.url, 'http://localhost');
      urlToken = url.searchParams.get('token') || '';
      if (urlToken) {
        console.log('🔍 Found token in URL query parameter');
        accessToken = urlToken;
      }
    }
    
    // 2. 쿠키에서 토큰 확인 (URL에 없으면)
    if (!accessToken) {
      const cookieHeader = request.headers?.cookie;
      if (!cookieHeader) {
        console.error('❌ No cookies found in WebSocket request');
        return {
          success: false,
          error: 'No cookies found'
        };
      }
    
      console.log('🔍 Full cookie header:', cookieHeader);
      
      // 서명된 쿠키를 올바르게 처리
      try {
        const allCookies = cookieHeader.split(';');
        console.log('🔍 All cookies:', allCookies);
        
        // accessToken 쿠키 찾기
        let accessTokenCookie = null;
        for (const cookie of allCookies) {
          const trimmed = cookie.trim();
          if (trimmed.startsWith('accessToken=')) {
            accessTokenCookie = trimmed;
            break;
          }
        }
        
        if (!accessTokenCookie) {
          console.error('❌ No accessToken cookie found in:', allCookies);
          return {
            success: false,
            error: 'No accessToken cookie found'
          };
        }
        
        const rawCookieValue = accessTokenCookie.substring('accessToken='.length);
        console.log('🔍 Raw cookie value:', rawCookieValue.substring(0, 100) + '...');
        
        // 서명된 쿠키를 올바르게 처리
        let processedCookieValue = rawCookieValue;
      
      // 쿠키 값이 따옴표로 감싸져 있을 수 있으므로 제거
      if (processedCookieValue.startsWith('"') && processedCookieValue.endsWith('"')) {
        processedCookieValue = processedCookieValue.slice(1, -1);
        console.log('🔍 Removed quotes from cookie value');
      }
      
            // URL 디코딩 (쿠키에 인코딩된 문자가 있을 수 있음)
      try {
        processedCookieValue = decodeURIComponent(processedCookieValue);
        console.log('🔍 URL decoded cookie value:', processedCookieValue.substring(0, 100) + '...');
      } catch (decodeError) {
        console.log('🔍 URL decode failed, using original value');
      }
      
      // 토큰 형식 검증
      console.log('🔍 Token format check:');
      console.log('  - Length:', processedCookieValue.length);
      console.log('  - Starts with s::', processedCookieValue.startsWith('s:'));
      console.log('  - Contains dots:', (processedCookieValue.match(/\./g) || []).length);
      console.log('  - First 50 chars:', processedCookieValue.substring(0, 50));
      console.log('  - Last 50 chars:', processedCookieValue.substring(processedCookieValue.length - 50));
      
      // 서명된 쿠키 처리 (프로덕션과 동일)
      if (processedCookieValue.startsWith('s:')) {
        console.log('🔍 Detected signed cookie, using Fastify unsignCookie');
        
        const cookieValue = request.server.unsignCookie(rawCookieValue);
        
        if (!cookieValue.valid) {
          console.error('❌ Invalid signed cookie:', cookieValue.reason);
          return {
            success: false,
            error: 'Invalid signed cookie'
          };
        }
        
        accessToken = cookieValue.value;
        console.log('🔍 Unsigned cookie value:', accessToken.substring(0, 100) + '...');
      } else {
        console.log('🔍 Unsigned cookie detected - using directly');
        accessToken = processedCookieValue;
      }
      
      } catch (error) {
        console.error('❌ Error processing cookie:', error);
        return {
          success: false,
          error: 'Error processing cookie'
        };
      }
    }
    
    // 토큰이 없으면 실패
    if (!accessToken) {
      return {
        success: false,
        error: 'No token found'
      };
    }
    
    console.log('🔍 Final accessToken:', accessToken.substring(0, 100) + '...');
    console.log('🔍 Token length:', accessToken.length);
    
    // JWT 검증
    try {
      const decoded = request.server.jwt.verify(accessToken);
      console.log('🔍 JWT decoded successfully:', decoded);
      
      // 사용자 정보 검증
      if (!decoded.id || !decoded.name) {
        console.error('❌ Invalid user data in token:', decoded);
        return {
          success: false,
          error: 'Invalid user data in token'
        };
      }
      
      console.log(`✅ WebSocket authentication successful for user: ${decoded.name} (${decoded.id})`);
      
      return {
        success: true,
        user: decoded,
        authMethod: accessToken === urlToken ? 'url' : 'cookie'
      };
    } catch (error) {
      console.error('❌ JWT verification failed:', error);
      console.error('❌ Error details:', {
        name: (error as any).name,
        message: (error as any).message,
        stack: (error as any).stack?.split('\n')[0]
      });
      return {
        success: false,
        error: 'Invalid JWT token'
      };
    }
  }
  
  // 메시지 처리
  private async handleMessage(wsConnection: WebSocketConnection, data: Buffer) {
    let message: any;
    
    try {
      const rawMessage = data.toString();
      console.log(`📨 Received WebSocket message from ${wsConnection.userId}:`, rawMessage);

      try {
        message = JSON.parse(rawMessage);
        console.log(`🔍 Parsed message type: ${message.type}`, message);
      } catch (parseError) {
        console.error('Invalid JSON received:', parseError);
        const errorMessage = WebSocketErrorHandler.createErrorMessage('INVALID_JSON', 'Invalid JSON format');
        this.sendMessage(wsConnection, errorMessage);
        return;
      }

      // 🎯 새로운 구조로 메시지 핸들링
      console.log(`🔄 Processing message type: ${message.type} for user: ${wsConnection.userId}`);
      await this.messageHandler.handleMessage(
        wsConnection.entityManager,
        message,
        wsConnection.userId,
        wsConnection.name,
        (msg: any) => {
          console.log(`📤 Sending response to ${wsConnection.userId}:`, msg.type);
          this.sendMessage(wsConnection, msg);
        },
        (roomId: string, msg: any) => {
          console.log(`📢 Broadcasting to room ${roomId}:`, msg.type);
          this.broadcastToRoom(roomId, msg);
        },
        wsConnection.socketId
      );

    } catch (error) {
      console.error('Error handling message:', error);
      
      // 메시지 처리 에러를 클라이언트에게 전송
      const errorMessage = WebSocketErrorHandler.createErrorMessage(
        'MESSAGE_PROCESSING_ERROR',
        'Failed to process message. Please try again.',
        {
          originalMessage: message?.id || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      
      this.sendMessage(wsConnection, errorMessage);
    }
  }

  // 메시지 전송 (개별 연결)
  private sendMessage(wsConnection: WebSocketConnection, message: AnyMessage) {
    this.connectionManager.sendMessage(wsConnection, message);
  }

  // 사용자 메시지 전송 (온라인 사용자에게 즉시 전송, 오프라인 사용자는 버퍼링)
  async sendToUser(userId: string, message: AnyMessage): Promise<void> {
    const connections = this.connectionService.getUserConnections(userId);
    
    if (connections.length === 0) {
      // 사용자 연결이 없으면 버퍼링 (나중에 접속 시 전송)
      this.connectionManager.bufferMessage(userId, message);
      console.log(`[${userId}] User offline, message buffered`);
      return;
    }
    
    // 온라인 사용자에게 즉시 전송
    for (const connection of connections) {
      const wsConnection = this.connectionManager.getConnection(connection.socketId);
      if (wsConnection) {
        this.connectionManager.sendMessage(wsConnection, message);
      }
    }
    console.log(`[${userId}] Message sent to ${connections.length} connection(s)`);
  }
  
  private async broadcastToRoom(roomId: string, message: AnyMessage): Promise<void> {
    console.log(`📢 Broadcasting message to room ${roomId}`);
    
    //메모리에서 빠르게 룸 멤버들 조회
    const userIds = this.roomService.getRoomMembersFromMemory(roomId);
    console.log(`👥 Room ${roomId} has ${userIds.length} members`);
    
    for (const userId of userIds) {
      await this.sendToUser(userId, message);
    }
  }

  broadcastToAll(message: AnyMessage) {
    const allConnections = this.connectionManager.getAllConnections();
    for (const wsConnection of allConnections) {
      this.sendMessage(wsConnection, message);
    }
  }
} 
import { FastifyPluginAsync, FastifyInstance } from "fastify";
import { FastifyPluginOptions } from "fastify";
import { RoomService } from "./room.service";
import { ConnectionService } from "./connection.service";
import { MessageService } from "./message.service";
import { EventService } from "./event.service";
import { SyncService } from "./sync.service";
import { EventListenerService } from "./event-listener.service";
import { WebSocketConnectionManager, WebSocketConnection } from './websocket-connection.manager';
import { WebSocketMessageHandler } from './websocket-message.handler';
import { WebSocketErrorHandler } from './websocket-error-handler';
import { AnyMessage } from "./dto";

export class WebSocketService {
  private connectionManager: WebSocketConnectionManager;
  private messageHandler: WebSocketMessageHandler;

  constructor(
    private roomService: RoomService,
    private connectionService: ConnectionService,
    private messageService: MessageService,
    private eventService: EventService,
    private syncService: SyncService,
    private eventListenerService: EventListenerService
  ) {
    this.connectionManager = new WebSocketConnectionManager(
      this.connectionService,
      this.roomService,
      this.messageService,
      this.eventService,
      this.syncService
    );

    this.messageHandler = new WebSocketMessageHandler(
      this.messageService,
      this.syncService,
      this.roomService,
      this.eventService,
      this.connectionService,
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

      let socket: any = null;
      
      // 1. connection.socket exists
      if (connection.socket && connection.socket.readyState !== undefined) {
        socket = connection.socket;
        console.log('✅ Found socket in connection.socket');
      }
      // 2. connection object itself is the socket
      else if (connection.readyState !== undefined) {
        socket = connection;
        console.log('✅ Connection object itself is the socket');
      }
      // 3. other structure
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
      
      const wsConnection = await this.connectionManager.createConnection(connection, request);
      
      if (!wsConnection) {
        console.error('Failed to create WebSocket connection');
        return;
      }

      console.log('✅ WebSocket connection created successfully:', wsConnection.socketId);

      //message handling
      connection.socket.on('message', async (data: Buffer) => {
        await this.handleMessage(wsConnection, data);
      });

      // connection close handling
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
    
    // // 1. check token in url query parameter
    // if (request.url) {
    //   const url = new URL(request.url, 'http://localhost');
    //   urlToken = url.searchParams.get('token') || '';
    //   if (urlToken) {
    //     console.log('🔍 Found token in URL query parameter');
    //     accessToken = urlToken;
    //   }
    // }
    
    // 2. check token in cookies
    if (!accessToken && request.headers?.cookie) {
      console.log('🔍 Checking cookies for accessToken');
      const cookies = request.headers.cookie;
      //extract the string until the first ; from cookies
      const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);
      if (accessTokenMatch) {
        console.log('🔍 Found token in cookies');
        accessToken = accessTokenMatch[1];
      }
    }
    
    // fail if no token
    if (!accessToken) {
      return {
        success: false,
        error: 'No token found in cookies'
      };
    }
    
    // console.log('🔍 Final accessToken:', accessToken.substring(0, 100) + '...');
    // console.log('🔍 Token length:', accessToken.length);
    // console.log('🔍 Final accessToken:', accessToken.substring(0, 100) + '...');
    // console.log('🔍 Token length:', accessToken.length);
    
    // JWT verification
    try {
      const decoded = request.server.jwt.verify(accessToken);
      console.log('🔍 JWT decoded successfully:', decoded);

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
  
  //message handling
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
      console.log(`🔄 Processing message type: ${message.type} for user: ${wsConnection.userId}`);
      await this.messageHandler.handleMessage(
        wsConnection.entityManager,
        message,
        wsConnection.userId,
        wsConnection.name,
        (msg: any) => {
          console.log(`📤 Sending response to ${wsConnection.userId}:`, msg.type);
          this.sendToUser(wsConnection.userId, msg);
        },
        (roomId: string, msg: any) => {
          console.log(`📢 Broadcasting to room ${roomId}:`, msg.type);
          this.broadcastToRoom(roomId, msg);
        },
        wsConnection.socketId
      );

    } catch (error) {
      console.error('Error handling message:', error);
      
      // send message processing error to client
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

  // send message (individual connection)
  private sendMessage(wsConnection: WebSocketConnection, message: AnyMessage) {
    this.connectionManager.sendMessage(wsConnection, message);
  }

  // send message to user (send to online users immediately, buffer for offline users)
  async sendToUser(userId: string, message: AnyMessage): Promise<void> {
    const connections = this.connectionService.getUserConnections(userId);
    
    if (connections.length === 0) {
      // if user has no connection, buffer the message (send later when user reconnects)
      this.connectionManager.bufferMessage(userId, message);
      console.log(`[${userId}] User offline, message buffered`);
      return;
    }
    
    // send to online users immediately
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
    
    // get room members from memory quickly
    const userIds = this.roomService.getRoomMembersFromMemory(roomId);
    console.log(`👥 Room ${roomId} has ${userIds.length} members`);
    
    for (const userId of userIds) {
      const connections = this.connectionService.getUserConnections(userId);
      console.log(`🔍 User ${userId} has ${connections.length} connections:`, connections.map(c => c.socketId));
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
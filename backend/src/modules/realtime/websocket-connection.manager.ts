import { FastifyRequest } from "fastify";
import { EntityManager } from "@mikro-orm/core";
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { ConnectionService } from "./connection.service";
import { RoomService } from "./room.service";
import { MessageService } from "./message.service";
import { FriendshipService } from "./friendship.service";
import { SyncService } from "./sync.service";

export interface WebSocketConnection {
  socketId: string;
  userId: string;
  name: string;
  connectionId: string;
  socket: any; // WebSocket instance
  entityManager: EntityManager; // Connection-specific EntityManager for each connection
}

export class WebSocketConnectionManager {
  private connections = new Map<string, WebSocketConnection>(); // socketId -> WebSocketConnection
  private pingIntervals = new Map<string, NodeJS.Timeout>(); // socketId -> pingInterval
  private pendingPings = new Map<string, { timestamp: number; missedPongs: number }>(); // socketId -> ping info
  private messageBuffer = new Map<string, any[]>(); // userId -> buffered messages
  
  constructor(
    private connectionService: ConnectionService,
    private roomService: RoomService,
    private messageService: MessageService,
    private friendshipService: FriendshipService,
    private syncService: SyncService
  ) {}

  async createConnection(connection: any, request: FastifyRequest): Promise<WebSocketConnection | null> {
    if (!connection.socket) {
      console.error('No WebSocket socket provided by Fastify');
      return null;
    }

    const socketId = connection.socket.id || `socket_${Date.now()}`;

    // Get user info from JWT token
    const user = request.user as any;
    if (!user || !user.id) {
      console.error('No user info found in JWT token');
      this.closeConnection(connection.socket, 'No user info available');
      return null;
    }

    const { id: userId, name, email } = user;
    const connectionId = uuidv4();

    const wsConnection: WebSocketConnection = {
      socketId,
      userId,
      name,
      connectionId,
      socket: connection.socket,
      entityManager: request.entityManager
    };

    // Store connection
    this.connections.set(socketId, wsConnection);

    // Register with connection service
    this.connectionService.createConnection(connectionId, socketId, email, userId, name);

    // Initialize connection
    await this.initializeConnection(wsConnection);

    console.log(`WebSocket connection established: ${socketId} for user: ${userId}`);
    return wsConnection;
  }

  private async initializeConnection(wsConnection: WebSocketConnection) {
    if (wsConnection.entityManager) {
      // 🔄 사용자 재연결 시 버퍼된 메시지 플러시 (세션 복원 전에 실행)
      await this.flushBufferedMessages(wsConnection.userId);
      await this.restoreUserSession(wsConnection);
    } else {
      await this.recreateEntityManager(wsConnection);
    }

    this.setupPingInterval(wsConnection);
  }

  private async restoreUserSession(wsConnection: WebSocketConnection) {
    try {
      // 🎯 SyncService로 세션 복원 위임
      await this.syncService.restoreUserSession(
        wsConnection.entityManager!,
        wsConnection.userId,
        (message) => this.sendMessage(wsConnection, message)
      );
    } catch (error) {
      console.error('Error restoring user session:', error);
    }
  }

  // EntityManager 재생성 시도
  private async recreateEntityManager(wsConnection: WebSocketConnection) {
    console.error('EntityManager is not available, attempting to recreate...');

    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 1000;

    const attemptRecreation = async () => {
      // EntityManager는 request에서 이미 fork된 상태이므로 재생성 불필요
      if (wsConnection.entityManager) {
        await this.restoreUserSession(wsConnection); // 재생성 후에도 세션 복원
        console.log(`EntityManager already available, session restored`);
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`EntityManager recreation attempt ${retryCount}/${maxRetries}, retrying in ${retryInterval}ms...`);
          setTimeout(attemptRecreation, retryInterval);
        } else {
          console.error(`Failed to recreate EntityManager after ${maxRetries} attempts, closing connection`);
          this.handleConnectionClose(wsConnection.socketId);
        }
      }
    };

    attemptRecreation();
  }

  // Ping interval 설정
  private setupPingInterval(wsConnection: WebSocketConnection) {
    const pingInterval = setInterval(() => {
      if (wsConnection.socket.readyState === WebSocket.OPEN) {
        this.sendPingAndTrack(wsConnection);
      } else {
        // Socket이 이미 닫혔으면 정리
        this.handleConnectionClose(wsConnection.socketId);
      }
    }, 30000); // 30 seconds

    this.pingIntervals.set(wsConnection.socketId, pingInterval);
  }

  // Ping 전송 및 추적
  private sendPingAndTrack(wsConnection: WebSocketConnection) {
    const socketId = wsConnection.socketId;
    const pendingPing = this.pendingPings.get(socketId);
    
    // 이전 ping에 대한 pong이 아직 오지 않았다면
    if (pendingPing) {
      const timeSinceLastPing = Date.now() - pendingPing.timestamp;
      
      // 60초 이상 pong이 오지 않았다면 missed ping으로 처리
      if (timeSinceLastPing > 60000) {
        pendingPing.missedPongs++;
        console.warn(`Missed pong from ${wsConnection.userId} (${pendingPing.missedPongs}/3)`);
        
        // 3번 연속 pong이 오지 않으면 연결 종료
        if (pendingPing.missedPongs >= 3) {
          console.error(`Connection ${socketId} unresponsive after 3 missed pongs, closing connection`);
          this.handleConnectionClose(socketId);
          return;
        }
      }
    }

    // 새로운 ping 전송
    const pingMessage = this.messageService.createPingMessage();
    this.sendMessage(wsConnection, pingMessage);
    
    // ping 추적 시작/업데이트
    this.pendingPings.set(socketId, {
      timestamp: Date.now(),
      missedPongs: pendingPing?.missedPongs || 0
    });
    
    // console.log(`Ping sent to ${wsConnection.userId}`);
  }

  // Pong 응답 처리 (WebSocketMessageHandler에서 호출됨)
  handlePongReceived(socketId: string) {
    const pendingPing = this.pendingPings.get(socketId);
    if (pendingPing) {
      const latency = Date.now() - pendingPing.timestamp;
      // console.log(`Pong received from ${socketId}, latency: ${latency}ms`);
      
      // pong 받았으므로 pending ping 제거
      this.pendingPings.delete(socketId);
    }
  }

  // 연결 종료 처리
  async handleConnectionClose(socketId: string) {
    const wsConnection = this.connections.get(socketId);
    if (!wsConnection) return;

    console.log(`WebSocket connection closed: ${socketId} for user: ${wsConnection.userId}`);

    // Clear ping interval
    const pingInterval = this.pingIntervals.get(socketId);
    if (pingInterval) {
      clearInterval(pingInterval);
      this.pingIntervals.delete(socketId);
    }

    // Clear pending ping tracking
    this.pendingPings.delete(socketId);

    // 🎯 연결 종료 시 세션 상태만 저장 (룸에서 제거하지 않음)
    const userRooms = this.roomService.getUserRoomsFromMemory(wsConnection.userId);

    // Save session state before cleanup
    await this.saveSessionState(wsConnection, userRooms);

    // Remove from connection service
    this.connectionService.removeConnection(wsConnection.connectionId);

    // Remove from connections map
    this.connections.delete(socketId);

    // Clean up EntityManager
    if (wsConnection.entityManager) {
      try {
        wsConnection.entityManager.clear();
      } catch (error) {
        console.error('Error clearing EntityManager:', error);
      }
    }
  }

  // 세션 상태 저장 (연결 종료 시)
  private async saveSessionState(wsConnection: WebSocketConnection, userRooms: string[]) {
    if (!wsConnection.entityManager) return;

    try {
      const currentTime = Date.now();
      
      // 각 룸별로 읽기 상태 업데이트
      for (const roomId of userRooms) {
        try {
          await this.syncService.markMessagesAsRead(
            wsConnection.entityManager,
            wsConnection.userId,
            roomId,
            currentTime
          );
          console.log(`Saved read state for user ${wsConnection.userId} in room ${roomId}`);
        } catch (error) {
          console.error(`Error saving read state for room ${roomId}:`, error);
        }
      }

      console.log(`Session state saved for user ${wsConnection.userId}`);
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  }

  

  sendMessage(wsConnection: WebSocketConnection, message: any) {
    try {
      if (wsConnection.socket.readyState === 1) { // WebSocket.OPEN
        wsConnection.socket.send(JSON.stringify(message));
      } else {
        console.warn('Socket is not open, buffering message');
        this.bufferMessage(wsConnection.userId, message);
        this.handleConnectionClose(wsConnection.socketId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.bufferMessage(wsConnection.userId, message);
      this.handleConnectionClose(wsConnection.socketId);
    }
  }

  // Add message to buffer (public for external access)
  bufferMessage(userId: string, message: any) {
    if (!this.messageBuffer.has(userId)) {
      this.messageBuffer.set(userId, []);
    }
    const buffer = this.messageBuffer.get(userId)!;
    buffer.push(message);
    
    // 버퍼 크기 제한 (최대 1000개)
    if (buffer.length > 1000) {
      buffer.shift();
    }
  }

  //when reconnected 
  async flushBufferedMessages(userId: string): Promise<void> {
    const buffer = this.messageBuffer.get(userId);
    if (!buffer || buffer.length === 0) return;

    console.log(`📮 Flushing ${buffer.length} buffered messages for user ${userId}`);
    
    const connections = this.getUserConnections(userId);
    for (const connection of connections) {
      for (const message of buffer) {
        try {
          if (connection.socket.readyState === WebSocket.OPEN) {
            connection.socket.send(JSON.stringify(message));
          }
        } catch (error) {
          console.warn('Failed to send buffered message:', error);
        }
      }
    }
    this.messageBuffer.delete(userId);
  }

  // Helper methods
  private closeConnection(socket: any, reason: string) {
    try {
      socket.close(1008, reason);
    } catch (error) {
      console.error('Failed to close WebSocket connection:', error);
    }
  }

  // Getters
  // 🔍 연결 조회 메서드
  getConnection(socketId: string): WebSocketConnection | undefined {
    return this.connections.get(socketId);
  }

  // 📋 모든 연결 조회
  getAllConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  // 👤 특정 사용자의 모든 연결 조회
  getUserConnections(userId: string): WebSocketConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.userId === userId);
  }

  getConnections(): Map<string, WebSocketConnection> {
    return this.connections;
  }
} 
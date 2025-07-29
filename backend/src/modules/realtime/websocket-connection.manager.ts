import { FastifyRequest } from "fastify";
import { EntityManager } from "@mikro-orm/core";
import { randomUUID } from 'crypto';
import { WebSocket } from 'ws';
import { ConnectionService } from "./connection.service";
import { RoomService } from "./room.service";
import { MessageService } from "./message.service";
import { EventService } from "./event.service";
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
    private eventService: EventService,
    private syncService: SyncService
  ) {}

  async createConnection(connection: any, request: FastifyRequest): Promise<WebSocketConnection | null> {
    if (!connection.socket) {
      console.error('No WebSocket socket provided by Fastify');
      return null;
    }

    const socketId = `socket_${Date.now()}_${randomUUID()}`;

    // Get user info from JWT token
    const user = request.user as any;
    if (!user || !user.id) {
      console.error('No user info found in JWT token');
      this.closeConnection(connection.socket, 'No user info available');
      return null;
    }

    const { id: userId, name, email } = user;
    const connectionId = randomUUID();
  

    const wsConnection: WebSocketConnection = {
      socketId,
      userId,
      name,
      connectionId,
      socket: connection.socket,
      entityManager: request.entityManager
    };

    //check if user has existing connections
    const existingConnections = this.getUserConnections(userId);
    if (existingConnections.length > 0) {
      console.log(`🔍 User ${userId} has ${existingConnections.length} existing connections (multi-device support enabled)`);
    }

    // Store connection
    this.connections.set(socketId, wsConnection);

    // Register with connection service
    this.connectionService.createConnection(connectionId, socketId, email, userId, name);

    //log user status update
    this.eventService.emitUserStatusUpdate({ userId, isOnline: true });

    // Initialize connection
    await this.initializeConnection(wsConnection);

    console.log(`WebSocket connection established: ${socketId} for user: ${userId}`);
    return wsConnection;
  }

  private async initializeConnection(wsConnection: WebSocketConnection) {
    if (wsConnection.entityManager) {
      // flush buffered messages when user reconnects (before session restoration)
      await this.flushBufferedMessages(wsConnection.userId);
      await this.restoreUserSession(wsConnection);
    } else {
      await this.waitForEntityManager(wsConnection);
    }

    this.setupPingInterval(wsConnection);
  }

  private async restoreUserSession(wsConnection: WebSocketConnection) {
    try {
      // delegate session restoration to SyncService
      await this.syncService.restoreUserSession(
        wsConnection.entityManager!,
        wsConnection.userId,
        (message) => this.sendMessage(wsConnection, message)
      );
    } catch (error) {
      console.error('Error restoring user session:', error);
    }
  }

  // wait for EntityManager to become available
  private async waitForEntityManager(wsConnection: WebSocketConnection) {
    console.error('EntityManager is not available, waiting for it to become available...');

    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 1000;

    const attemptCheck = async () => {
      // EntityManager is already forked in request, no need to recreate
      if (wsConnection.entityManager) {
        await this.restoreUserSession(wsConnection); // restore session after EntityManager becomes available
        console.log(`EntityManager now available, session restored`);
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`EntityManager availability check attempt ${retryCount}/${maxRetries}, retrying in ${retryInterval}ms...`);
          setTimeout(attemptCheck, retryInterval);
        } else {
          console.error(`EntityManager not available after ${maxRetries} attempts, closing connection`);
          this.handleConnectionClose(wsConnection.socketId);
        }
      }
    };

    attemptCheck();
  }
  // setup ping interval
  private setupPingInterval(wsConnection: WebSocketConnection) {
    const pingInterval = setInterval(() => {
      if (wsConnection.socket.readyState === WebSocket.OPEN) {
        // simply send ping and check connection status
        this.sendPingAndTrack(wsConnection);
      } else {
        // if socket is already closed, clean up
        this.handleConnectionClose(wsConnection.socketId);
      }
    }, 30000); // 30 seconds

    this.pingIntervals.set(wsConnection.socketId, pingInterval);
  }

  // send ping and track connection status
  private sendPingAndTrack(wsConnection: WebSocketConnection) {
    const socketId = wsConnection.socketId;
    const pendingPing = this.pendingPings.get(socketId);
    
    // if previous ping has not received pong yet
    if (pendingPing) {
      const timeSinceLastPing = new Date().getTime() - pendingPing.timestamp;
      
      // if 60 seconds have passed since last ping, consider it missed
      if (timeSinceLastPing > 60000) {
        pendingPing.missedPongs++;
        console.warn(`Missed pong from ${wsConnection.userId} (${pendingPing.missedPongs}/3)`);
        
        // if 3 consecutive pongs are not received, close connection
        if (pendingPing.missedPongs >= 3) {
          console.error(`Connection ${socketId} unresponsive after 3 missed pongs, closing connection`);
          this.handleConnectionClose(socketId);
          return;
        }
      }
    }

    // send new ping
    const pingMessage = this.messageService.createPingMessage();
    this.sendMessage(wsConnection, pingMessage);
    
    // start/update ping tracking
    this.pendingPings.set(socketId, {
      timestamp: new Date().getTime(),
      missedPongs: pendingPing?.missedPongs || 0
    });
    
    // console.log(`Ping sent to ${wsConnection.userId}`);
  }

  // handle pong response (called by WebSocketMessageHandler)
  handlePongReceived(socketId: string) {
    const pendingPing = this.pendingPings.get(socketId);
    if (pendingPing) {
      const latency = new Date().getTime() - pendingPing.timestamp;
      // console.log(`Pong received from ${socketId}, latency: ${latency}ms`);
      
      // if pong is received, remove pending ping
      this.pendingPings.delete(socketId);
    }
  }

  // handle connection close
  async handleConnectionClose(socketId: string) {
    const wsConnection = this.connections.get(socketId);
    if (!wsConnection) return;

    console.log(`WebSocket connection closed: ${socketId} for user: ${wsConnection.userId}`);
    await this.eventService.emitUserStatusUpdate({ userId: wsConnection.userId, isOnline: false });
    // Clear ping interval
    const pingInterval = this.pingIntervals.get(socketId);
    if (pingInterval) {
      clearInterval(pingInterval);
      this.pingIntervals.delete(socketId);
    }

    // Clear pending ping tracking
    this.pendingPings.delete(socketId);

    // save session state only (do not remove from room)
    const userRooms = this.roomService.getUserRoomsFromMemory(wsConnection.userId);

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
    
    // limit buffer size (maximum 1000 messages)
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
  // get connection
  getConnection(socketId: string): WebSocketConnection | undefined {
    return this.connections.get(socketId);
  }

  // get all connections
  getAllConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  // get all connections for a user
  getUserConnections(userId: string): WebSocketConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.userId === userId);
  }
} 

export interface UserConnection {
  connectionId: string;
  socketId: string;
  email: string;
  userId: string;
  name: string;
  connectedAt: string;
}

export class ConnectionService {
  private connections = new Map<string, UserConnection>(); // connectionId -> UserConnection
  private userConnections = new Map<string, Set<string>>(); // userId -> Set<connectionId>

  constructor() {}

  createConnection(connectionId: string, socketId: string, email: string, userId: string, name: string): UserConnection {
    const wasUserOffline = !this.isUserOnline(userId);

    const connection: UserConnection = {
      connectionId,
      socketId,
      email,
      userId,
      name,
      connectedAt: new Date().toISOString()
    };

    this.connections.set(connectionId, connection);

    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);

    if (wasUserOffline) {
      console.log(`📢 User ${name} (${userId}) went ONLINE`);
    }

    console.log(`Connection created: ${connectionId} for user ${userId}`);
    return connection;
  }


  getConnectionByUserId(userId: string): UserConnection | undefined {
    return this.connections.get(userId);
  }

// Get all connections for a user
  getUserConnections(userId: string): UserConnection[] {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) return []; //just check if (connections.lengh === 0); 

    return Array.from(connectionIds)
      .map(id => this.connections.get(id)) //bring all userconnections
      .filter((conn): conn is UserConnection => conn !== undefined);
  }

  // getEmailByUserId(userId : string) : string {
  //   const connections = this.getUserConnections(userId);
  //   if (connections.length === 0) {
  //     return "";
  //   }
  //   return connections[0].email;
  // }

  removeConnection(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      console.warn(`Connection ${connectionId} not found for removal`);
      return false;
    }

    const userId = connection.userId;
    const userName = connection.name;

    this.connections.delete(connectionId);

    const userConnections = this.userConnections.get(userId);
    if (userConnections) {
      userConnections.delete(connectionId);

      if (userConnections.size === 0) {
        this.userConnections.delete(userId);
        
        console.log(`📢 User ${userName} (${userId}) went OFFLINE`);
        
      }
    }

    console.log(`Connection removed: ${connectionId} for user ${userId}`);
    return true;
  }

  // Get all connections
  getAllConnections(): UserConnection[] {
    return Array.from(this.connections.values());
  }

  // Get all online users (online users only)
  getOnlineUsers(): UserConnection[] {
    const onlineUsers = new Map<string, UserConnection>();
    
    for (const connection of this.connections.values()) {
      if (!onlineUsers.has(connection.userId)) {
        onlineUsers.set(connection.userId, connection);
      }
    }
    return Array.from(onlineUsers.values());
  }
  // Check if user is online
  isUserOnline(userId: string): boolean {
    const userConnections = this.userConnections.get(userId);
    return userConnections ? userConnections.size > 0 : false;
  }
} 
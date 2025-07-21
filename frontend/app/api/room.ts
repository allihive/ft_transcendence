import type { Room } from '../types/realtime.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface RoomMember {
  userId: string;
  name: string;
  joinedAt: string;
  isOnline: boolean;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  isPrivate: boolean;
  maxUsers: number;
}

export interface InviteUsersRequest {
  inviteeNames: string[];
}

export interface InviteUsersResponse {
  success: string[];
  failed: Array<{
    name: string;
    reason: string;
  }>;
  message: string;
}

class RoomAPI {
  // Create a new room
  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    const response = await fetch(`${API_BASE}/api/realtime/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(roomData)
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create room: ${response.status}`);
      } catch (parseError) {
        // If error response is not JSON, use generic error
        throw new Error(`Failed to create room: ${response.status}`);
      }
    }
    
    return response.json();
  }

  // Get room by ID
  async getRoom(roomId: string): Promise<Room> {
    const response = await fetch(`${API_BASE}/api/realtime/rooms/${roomId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch room: ${response.status}`);
      } catch (parseError) {
        throw new Error(`Failed to fetch room: ${response.status}`);
      }
    }
    
    return response.json();
  }

  // Get room members
  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    const response = await fetch(`${API_BASE}/api/realtime/rooms/${roomId}/members`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch room members: ${response.status}`);
      } catch (parseError) {
        throw new Error(`Failed to fetch room members: ${response.status}`);
      }
    }
    
    return response.json();
  }

  // Invite users to room
  async inviteUsersToRoom(roomId: string, inviteeNames: string[]): Promise<InviteUsersResponse> {
    const response = await fetch(`${API_BASE}/api/realtime/rooms/${roomId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ inviteeNames })
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to invite users: ${response.status}`);
      } catch (parseError) {
        throw new Error(`Failed to invite users: ${response.status}`);
      }
    }
    
    return response.json();
  }

  // Leave room
  async leaveRoom(roomId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/realtime/rooms/${roomId}/leave`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to leave room: ${response.status}`);
      } catch (parseError) {
        throw new Error(`Failed to leave room: ${response.status}`);
      }
    }
    
    return response.json();
  }

  // Get user's room list
  async getUserRooms(userId: string): Promise<{
    roomList: Room[];
    onlineMembers: number;
  }> {
    const response = await fetch(`${API_BASE}/api/realtime/rooms/${userId}/roomlist`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch user rooms: ${response.status}`);
      } catch (parseError) {
        throw new Error(`Failed to fetch user rooms: ${response.status}`);
      }
    }
    
    return response.json();
  }
}

export const roomAPI = new RoomAPI(); 
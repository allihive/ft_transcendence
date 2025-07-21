import type { Friend, FriendRequest } from '../types/realtime.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface FriendsListResponse {
  id: string;
  timestamp: number;
  version: string;
  type: 'friend_list';
  payload: {
    friends: Friend[];
    totalCount: number;
    updateReason?: string;
  };
}

export interface OnlineFriendsResponse {
  success: boolean;
  friends: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    isOnline: boolean;
    connectedAt?: number;
  }>;
}

class FriendshipAPI {
  // Get friends list
  async getFriends(): Promise<FriendsListResponse> {
    const response = await fetch(`${API_BASE}/api/realtime/friends`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch friends: ${response.status}`);
    }
    
    return response.json();
  }

  // Get pending friend requests
  async getPendingRequests(): Promise<FriendRequest[]> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/requests`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pending requests: ${response.status}`);
    }
    
    return response.json();
  }

  // Send friend request
  async sendFriendRequest(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/requests/${encodeURIComponent(email)}`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to send friend request: ${response.status}`);
    }
    
    return response.json();
  }

  // Accept friend request
  async acceptFriendRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/requests/${requestId}/accept`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to accept friend request: ${response.status}`);
    }
    
    return response.json();
  }

  // Reject friend request
  async rejectFriendRequest(requestId: string): Promise<{ message: string; requestId: string }> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/requests/${requestId}/reject`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to reject friend request: ${response.status}`);
    }
    
    return response.json();
  }

  // Remove friend
  async removeFriend(friendId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/${friendId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to remove friend: ${response.status}`);
    }
    
    return response.json();
  }

  // Block friend
  async blockFriend(friendId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/${friendId}/block`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to block friend: ${response.status}`);
    }
    
    return response.json();
  }

  // Unblock friend
  async unblockFriend(friendId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/${friendId}/unblock`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to unblock friend: ${response.status}`);
    }
    
    return response.json();
  }

  // Get blocked friends
  async getBlockedFriends(): Promise<FriendsListResponse> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/blocked`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blocked friends: ${response.status}`);
    }
    
    return response.json();
  }

  // Get online friends
  async getOnlineFriends(): Promise<OnlineFriendsResponse> {
    const response = await fetch(`${API_BASE}/api/realtime/friends/online`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch online friends: ${response.status}`);
    }
    
    return response.json();
  }
}

export const friendshipAPI = new FriendshipAPI(); 
import type { Friend, FriendRequest } from '../types/realtime.types';
import { fetchJson } from './client';

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
    const response = await fetchJson<FriendsListResponse>(`${API_BASE}/api/realtime/friends`);
    
    if (!response) {
      throw new Error('Failed to fetch friends');
    }
    
    return response;
  }

  // Get pending friend requests
  async getPendingRequests(): Promise<FriendRequest[]> {
    const response = await fetchJson<FriendRequest[]>(`${API_BASE}/api/realtime/friends/requests`);
    
    if (!response) {
      throw new Error('Failed to fetch pending requests');
    }
    
    return response;
  }

  // Send friend request
  async sendFriendRequest(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/realtime/friends/requests/${encodeURIComponent(email)}`, {
      method: 'POST'
    });
    
    if (!response) {
      throw new Error('Failed to send friend request');
    }
    
    return response;
  }

  // Accept friend request
  async acceptFriendRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/realtime/friends/requests/${requestId}/accept`, {
      method: 'POST'
    });
    
    if (!response) {
      throw new Error('Failed to accept friend request');
    }
    
    return response;
  }

  // Reject friend request
  async rejectFriendRequest(requestId: string): Promise<{ message: string; requestId: string }> {
    const response = await fetchJson<{ message: string; requestId: string }>(`${API_BASE}/api/realtime/friends/requests/${requestId}/reject`, {
      method: 'POST'
    });
    
    if (!response) {
      throw new Error('Failed to reject friend request');
    }
    
    return response;
  }

  // Remove friend
  async removeFriend(friendId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/realtime/friends/${friendId}`, {
      method: 'DELETE'
    });
    
    if (!response) {
      throw new Error('Failed to remove friend');
    }
    
    return response;
  }

  // Block friend
  async blockFriend(friendId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/realtime/friends/${friendId}/block`, {
      method: 'POST'
    });
    
    if (!response) {
      throw new Error('Failed to block friend');
    }
    
    return response;
  }

  // Unblock friend
  async unblockFriend(friendId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/realtime/friends/${friendId}/unblock`, {
      method: 'POST'
    });
    
    if (!response) {
      throw new Error('Failed to unblock friend');
    }
    
    return response;
  }

  // Get blocked friends
  async getBlockedFriends(): Promise<FriendsListResponse> {
    const response = await fetchJson<FriendsListResponse>(`${API_BASE}/api/realtime/friends/blocked`);
    
    if (!response) {
      throw new Error('Failed to fetch blocked friends');
    }
    
    return response;
  }

  // Get online friends
  async getOnlineFriends(): Promise<OnlineFriendsResponse> {
    const response = await fetchJson<OnlineFriendsResponse>(`${API_BASE}/api/realtime/friends/online`);
    
    if (!response) {
      throw new Error('Failed to fetch online friends');
    }
    
    return response;
  }
}

export const friendshipAPI = new FriendshipAPI(); 
# ft_transcendence API Documentation

## Base URL
```
http://localhost:3000/api/realtime
```

## Authentication
All endpoints require authentication. Include authentication cookies in your requests.

---

## Room API

### 1. Create Room
**POST** `/rooms`

Create a new chat room.

**Request Body:**
```json
{
  "name": "Room Name",
  "description": "Room description (optional)",
  "isPrivate": false,
  "maxUsers": 50
}
```

**Response (201):**
```json
{
  "id": "room-uuid",
  "name": "Room Name",
  "masterId": "user-uuid",
  "description": "Room description",
  "isPrivate": false,
  "maxUsers": 50,
  "memberCount": 1,
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

### 2. Get Room Details
**GET** `/rooms/:roomId`

Get details of a specific room.

**Response (200):**
```json
{
  "id": "room-uuid",
  "name": "Room Name",
  "masterId": "user-uuid",
  "description": "Room description",
  "isPrivate": false,
  "maxUsers": 50,
  "memberCount": 5,
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

### 3. Get User's Room List
**GET** `/rooms/:userId/roomlist`

Get all rooms that a user has joined.

**Response (200):**
```json
{
  "roomList": [
    {
      "id": "room-uuid",
      "name": "Room Name",
      "masterId": "user-uuid",
      "description": "Room description",
      "isPrivate": false,
      "maxUsers": 50,
      "memberCount": 5,
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ],
  "onlineMembers": 3
}
```

### 4. Invite Friends to Room
**POST** `/rooms/:roomId/invite`

Invite multiple friends to a room by their usernames.

**Request Body:**
```json
{
  "inviteeNames": ["username1", "username2", "username3"]
}
```

**Response (200):**
```json
{
  "success": ["username1", "username2"],
  "failed": [
    {
      "name": "username3",
      "reason": "User already in room"
    }
  ],
  "message": "Invited 2 users successfully, 1 failed"
}
```

### 5. Leave Room
**POST** `/rooms/:roomId/leave`

Leave a room.

**Response (200):**
```json
{
  "success": true,
  "message": "John successfully left the room"
}
```

### 6. Get Room Members
**GET** `/rooms/:roomId/members`

Get all members of a room.

**Response (200):**
```json
[
  {
    "userId": "user-uuid",
    "name": "John Doe",
    "joinedAt": "2023-01-01T00:00:00.000Z",
    "isOnline": true
  }
]
```

---

## Friendship API

### 1. Send Friend Request
**POST** `/friends/requests/:addresseeEmail`

Send a friend request to a user by email.

**Response (200):**
```json
{
  "success": true,
  "message": "Friend request sent to user@example.com successfully"
}
```

### 2. Accept Friend Request
**POST** `/friends/requests/:requestId/accept`

Accept a friend request.

**Response (200):**
```json
{
  "success": true,
  "message": "Friend request accepted successfully"
}
```

### 3. Reject Friend Request
**POST** `/friends/requests/:requestId/reject`

Reject a friend request.

**Response (200):**
```json
{
  "message": "Friend request rejected",
  "requestId": "request-uuid"
}
```

### 4. Get Pending Friend Requests
**GET** `/friends/requests`

Get all pending friend requests for the current user.

**Response (200):**
```json
[
  {
    "id": "request-uuid",
    "requesterId": "user-uuid",
    "requesterName": "John Doe",
    "requesterEmail": "john@example.com",
    "addresseeId": "user-uuid",
    "addresseeName": "Jane Doe",
    "status": "pending",
    "createdAt": 1234567890
  }
]
```

### 5. Get Friends List
**GET** `/friends`

Get all friends of the current user.

**Response (200):**
```json
{
  "id": "response-uuid",
  "timestamp": 1234567890,
  "version": "1.0",
  "type": "friend_list",
  "payload": {
    "friends": [
      {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "avatarUrl": "/files/avatar.png",
        "isOnline": true,
        "lastSeen": 1234567890
      }
    ],
    "totalCount": 1
  }
}
```

### 6. Get Blocked Friends
**GET** `/friends/blocked`

Get all blocked friends.

**Response (200):** Same structure as friends list.

### 7. Block Friend
**POST** `/friends/:friendId/block`

Block a friend.

**Response (200):**
```json
{
  "success": true,
  "message": "Friend blocked successfully"
}
```

### 8. Unblock Friend
**POST** `/friends/:friendId/unblock`

Unblock a friend.

**Response (200):**
```json
{
  "success": true,
  "message": "Friend unblocked successfully"
}
```

### 9. Remove Friend
**DELETE** `/friends/:friendId`

Remove a friend.

**Response (200):**
```json
{
  "success": true,
  "message": "Friend removed successfully"
}
```

### 10. Get Online Friends
**GET** `/friends/online`

Get all friends with their online status.

**Response (200):**
```json
{
  "success": true,
  "friends": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "isOnline": true,
      "connectedAt": 1234567890
    }
  ],
  "totalFriends": 5,
  "onlineFriends": 2
}
```

### 11. Get Online Users
**GET** `/users/online`

Get all online users in the system.

**Response (200):**
```json
{
  "success": true,
  "onlineUsers": [
    {
      "userId": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "connectedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Common Error Codes:
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Access denied
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server error

---

## Usage Examples

### JavaScript/TypeScript
```javascript
// Send friend request
const response = await fetch('/api/realtime/friends/requests/user@example.com', {
  method: 'POST',
  credentials: 'include'
});

// Create room
const room = await fetch('/api/realtime/rooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Room',
    description: 'A cool room',
    isPrivate: false,
    maxUsers: 20
  }),
  credentials: 'include'
});
```

### cURL
```bash
# Get friends list
curl -X GET http://localhost:3000/api/realtime/friends \
  -H "Cookie: session=your-session-cookie"

# Invite friends to room
curl -X POST http://localhost:3000/api/realtime/rooms/room-uuid/invite \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-cookie" \
  -d '{"inviteeNames": ["user1", "user2"]}'
```

---

## Notes

- All timestamps are in milliseconds (Unix timestamp)
- Room master is the user who created the room
- Friend requests are bidirectional - both users become friends when accepted
- Blocked friends cannot send messages or see each other online
- Room invitations are sent via WebSocket events to online users
- User authentication is handled via session cookies 
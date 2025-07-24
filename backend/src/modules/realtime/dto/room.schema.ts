import { Type, Static } from '@sinclair/typebox';
import { baseMessageSchema } from './base.schema';

export const roomInvitationRequestSchema = Type.Object({
  inviteeNames: Type.Array(Type.String({ minLength: 1, maxLength: 50 }))
});

// Room creation request schema (for POST /rooms)
export const roomCreationRequestSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  description: Type.Optional(Type.String({ maxLength: 500 })),
  isPrivate: Type.Optional(Type.Boolean({ default: false })),
  maxUsers: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 50 }))
});

export const roomMemberDtoSchema = Type.Object({
  userId: Type.String(),
  name: Type.String(),
  joinedAt: Type.Number(),
  isOnline: Type.Boolean()
});

export const roomInvitationPayloadSchema = Type.Object({
  roomId: Type.String(),
  roomName: Type.String(),
  inviteeName: Type.String(),
  inviterName: Type.String()
});

export const roomInvitationMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('room_invitation'),
    payload: roomInvitationPayloadSchema
  })
]);

export const leaveRoomPayloadSchema = Type.Object({
  roomId: Type.String(),
  userId: Type.String(),
  name: Type.String()
});

export const leaveRoomMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('leave_room'),
    payload: leaveRoomPayloadSchema,
  })
]);

export const roomJoinedPayloadSchema = Type.Object({
  roomId: Type.String(),
  roomName: Type.String(),
  inviterName: Type.String(),
  newMemberName: Type.String()
});

export const roomJoinedMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('room_joined'),
    payload: roomJoinedPayloadSchema
  })
]);

export const roomCreatedPayloadSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    masterId: Type.String(),
    description: Type.Optional(Type.String()),
    isPrivate: Type.Boolean(),
    maxUsers: Type.Number(),
    memberCount: Type.Number(),
    createdAt: Type.Number(),
    updatedAt: Type.Number()
  });

// 간소화된 룸 상태 - 기본 정보만 포함
export const roomStatePayloadSchema = Type.Object({
  room: roomCreatedPayloadSchema,
  previousMessages: Type.Array(Type.Object({
    id: Type.String(),
    content: Type.String(),
    userId: Type.String(),
    userName: Type.String(),
    messageType: Type.String(),
    timestamp: Type.Number(),
    isRead: Type.Boolean()
  })),
  unreadMessages: Type.Array(Type.Object({
    id: Type.String(),
    content: Type.String(),
    userId: Type.String(),
    userName: Type.String(),
    messageType: Type.String(),
    timestamp: Type.Number(),
    isRead: Type.Boolean()
  })),
  members: Type.Array(roomMemberDtoSchema),
  readState: Type.Object({
    lastReadTimestamp: Type.Number(),
    unreadCount: Type.Number(),
    totalMessages: Type.Number()
  })
});

export const roomStateMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('room_state'),
    payload: roomStatePayloadSchema
  })
]);


export type RoomInvitationRequest = Static<typeof roomInvitationRequestSchema>;

export type RoomCreationRequest = Static<typeof roomCreationRequestSchema>;

export type RoomMemberDto = Static<typeof roomMemberDtoSchema>;
export type RoomCreatedPayload = Static<typeof roomCreatedPayloadSchema>;
export type RoomInvitationPayload = Static<typeof roomInvitationPayloadSchema>;
export type LeaveRoomPayload = Static<typeof leaveRoomPayloadSchema>;
export type LeaveRoomMessage = Static<typeof leaveRoomMessageSchema>;
export type RoomJoinedMessage = Static<typeof roomJoinedMessageSchema>;
export type RoomStateMessage = Static<typeof roomStateMessageSchema>;

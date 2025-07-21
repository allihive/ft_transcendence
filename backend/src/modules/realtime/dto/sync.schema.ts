import { Type, Static } from '@sinclair/typebox';
import { baseMessageSchema } from './base.schema';
import { chatMessagePayloadSchema } from './chat.schema';

// Sync user info schema
export const syncUserInfoSchema = Type.Object({
  userId: Type.String(),
  name: Type.String(),
  status: Type.Union([
    Type.Literal('online'),
    Type.Literal('offline'),
    Type.Literal('away'),
    Type.Literal('busy')
  ]),
});

// Sync payload for room state
export const syncPayloadSchema = Type.Object({
  roomId: Type.String(),
  users: Type.Array(syncUserInfoSchema),
  messages: Type.Array(chatMessagePayloadSchema),
  lastReadTimestamp: Type.Optional(Type.Number()),
  syncType: Type.Optional(Type.Union([
    Type.Literal('friends'),
    Type.Literal('rooms'),
    Type.Literal('full')
  ]))
});

// Sync message schema
export const syncMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('sync'),
    payload: syncPayloadSchema,
  })
]);

// Unread count update schema
export const unreadCountSchema = Type.Object({
  roomId: Type.String(),
  unreadCount: Type.Number()
});

// Unread count message schema
export const unreadCountMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('unread_count'),
    payload: unreadCountSchema,
  })
]);

export type SyncUserInfo = Static<typeof syncUserInfoSchema>;
export type SyncMessage = Static<typeof syncMessageSchema>;
export type SyncPayload = Static<typeof syncPayloadSchema>;
export type UnreadCount = Static<typeof unreadCountSchema>;
export type UnreadCountMessage = Static<typeof unreadCountMessageSchema>; 
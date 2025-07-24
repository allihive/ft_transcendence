import { Type, Static } from '@sinclair/typebox';
import { baseMessageSchema } from './base.schema';

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

export type UnreadCount = Static<typeof unreadCountSchema>;
export type UnreadCountMessage = Static<typeof unreadCountMessageSchema>; 
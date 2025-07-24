import { Type, Static } from '@sinclair/typebox';
import { baseMessageSchema } from './base.schema';

// Mark read payload schema
export const markReadPayloadSchema = Type.Object({
  roomId: Type.String(),
  lastReadTimestamp: Type.Number()
});

// Mark read message schema
export const markReadMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('mark_read'),
    payload: markReadPayloadSchema
  })
]);

export type MarkReadPayload = Static<typeof markReadPayloadSchema>;
export type MarkReadMessage = Static<typeof markReadMessageSchema>; 
import { Type, Static } from '@sinclair/typebox';
import { baseMessageSchema } from './base.schema';

// WebSocket Chat message payload
export const chatMessagePayloadSchema = Type.Object({
  roomId: Type.Optional(Type.String()), 
  // recipientId: Type.Optional(Type.String()),
  userId: Type.String(),
  name: Type.String(),
  content: Type.String({ minLength: 1, maxLength: 1000 }),
  messageType: Type.Optional(Type.Union([
    Type.Literal('text'),
    Type.Literal('image'),
    Type.Literal('file')
  ], { default: 'text' })),
  // File metadata (optional, only for image/file messages)
  originalFilename: Type.Optional(Type.String()),
  mimeType: Type.Optional(Type.String()),
  fileSize: Type.Optional(Type.Number()),
});

// WebSocket Chat message schema
export const chatMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('chat'),
    payload: chatMessagePayloadSchema,
  })
]);


// Type exports
export type ChatMessage = Static<typeof chatMessageSchema>;
export type ChatMessagePayload = Static<typeof chatMessagePayloadSchema>;

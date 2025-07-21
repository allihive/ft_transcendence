import { Type, Static } from '@sinclair/typebox';
import { baseMessageSchema } from './base.schema';

// Ping message schema (no payload needed - base timestamp is sufficient)
export const pingMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('ping'),
  })
]);

// Pong payload (only latency info)
export const pongPayloadSchema = Type.Object({
  latency: Type.Optional(Type.Number()), // 계산된 레이턴시
});

// Pong message schema
export const pongMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('pong'),
    payload: pongPayloadSchema,
  })
]);

export type PingMessage = Static<typeof pingMessageSchema>;
export type PongMessage = Static<typeof pongMessageSchema>;
export type PongPayload = Static<typeof pongPayloadSchema>; 
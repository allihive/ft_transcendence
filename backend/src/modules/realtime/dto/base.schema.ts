import { Type, Static } from '@sinclair/typebox';

// Base message schema with common fields (without payload and type)
export const baseMessageSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  timestamp: Type.Number(),
  version: Type.String({ default: '1.0' }),
});

export type BaseMessage = Static<typeof baseMessageSchema>; 
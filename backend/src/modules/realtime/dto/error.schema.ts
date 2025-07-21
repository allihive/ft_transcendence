import { Type, Static } from '@sinclair/typebox';
import { baseMessageSchema } from './base.schema';

// Error payload
export const errorPayloadSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  details: Type.Optional(Type.Unknown()),
});

// Error message schema
export const errorMessageSchema = Type.Intersect([
  baseMessageSchema,
  Type.Object({
    type: Type.Literal('error'),
    payload: errorPayloadSchema,
  })
]);

export type ErrorMessage = Static<typeof errorMessageSchema>;
export type ErrorPayload = Static<typeof errorPayloadSchema>; 
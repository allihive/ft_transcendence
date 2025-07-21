import { ErrorPayload, ErrorMessage } from './dto/error.schema';
import { v4 as uuidv4 } from 'uuid';

export class WebSocketErrorHandler {
  static createErrorMessage(code: string, message: string, details?: unknown): ErrorMessage {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'error',
      payload: {
        code,
        message,
        details
      }
    };
  }

  static handleError(
    socket: any,
    error: Error | unknown,
    sendError?: (error: any) => void
  ) {
    const errorMessage: ErrorMessage = {
      id: uuidv4(),
      timestamp: Date.now(),
      version: '1.0',
      type: 'error',
      payload: {
        code: this.getErrorCode(error),
        message: this.getErrorMessage(error),
        details: this.getErrorDetails(error)
      }
    };

    try {
      if (socket.readyState === WebSocket.OPEN) {
        console.log(errorMessage);
        socket.send(JSON.stringify(errorMessage));
      }
    } catch (error) {
      console.error('Failed to send error message:', error);
      if (sendError){
        sendError(error);
      }
    }
  }

  private static getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.name) return error.name.toUpperCase();
    return 'UNKNOWN_ERROR';
  }

  private static getErrorMessage(error: any): string {
    if (error?.message) return error.message;
    return 'An error occurred';
  }

  private static getErrorDetails(error: any): unknown {
    return error?.details || error?.stack || undefined;
  }
} 
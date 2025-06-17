// src/modules.ts
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { gameHistoryRoutes } from './gameHistory.routes';

/**
 * Create and configure the Fastify application
 */
export async function createApp(): Promise<FastifyInstance> {
  // Create Fastify instance with logging
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register CORS if needed
  await fastify.register(cors, {
    origin: true, // Allow all origins in development
    credentials: true,
  });

  // Register JSON body parser (usually included by default)
  await fastify.register(formbody);

  // Register game history routes
  await fastify.register(gameHistoryRoutes);

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    
    if (error.validation) {
      reply.status(400).send({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    } else {
      reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: 'Something went wrong'
      });
    }
  });

  // Health check route
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  return fastify;
}

// Start the server if this file is run directly
if (require.main === module) {
  const start = async () => {
    try {
      const app = await createApp();
      
      const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
      const host = process.env.HOST || '0.0.0.0';
      
      await app.listen({ port, host });
      console.log(`🚀 Game History API server running at http://${host}:${port}`);
      console.log(`📊 Available endpoints:`);
      console.log(`  GET  /api/game-history/:playerId`);
      console.log(`  POST /api/game-history/record`);
      console.log(`  GET  /api/game-history/:playerId/stats`);
      console.log(`  GET  /api/game-history/health`);
      console.log(`  GET  /health`);
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('Received SIGINT, shutting down gracefully...');
        await app.close();
        process.exit(0);
      });
      
    } catch (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
  };

  start();
}
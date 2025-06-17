//src/server.ts
import fastify from 'fastify'
import { gameHistoryRoutes } from './modules/game-history/gameHistory.routes'

async function startServer() {
  const server = fastify()

  // Register CORS
  await server.register(require('@fastify/cors'), {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })

  // Register your game history routes
  await server.register(gameHistoryRoutes)

  server.get('/', async (request, reply) => {
    return 'Hello Hello?\n'
  })

  server.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}

// Start the server
startServer().catch(console.error)
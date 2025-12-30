import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import type { ArbiterService } from '../services/arbiter-service';

/**
 * Creates Express server with Socket.io integration
 * Provides REST API and WebSocket endpoints for dashboard
 */
export function createAPIServer(arbiterService: ArbiterService) {
  const app = express();
  const httpServer = createServer(app);
  
  // Socket.io setup with CORS
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Express middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Setup REST routes
  setupRoutes(app, arbiterService);

  // Setup WebSocket handlers
  setupWebSocket(io, arbiterService);

  return { app, httpServer, io };
}

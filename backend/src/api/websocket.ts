import type { Server, Socket } from 'socket.io';
import type { ArbiterService } from '../services/arbiter-service';

/**
 * WebSocket event handlers for real-time communication
 * Broadcasts system updates to all connected clients
 */
export function setupWebSocket(io: Server, arbiter: ArbiterService) {
  
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Send initial state
    socket.emit('system:status', arbiter.getStatus());
    socket.emit('positions:list', arbiter.getPositions());

    // Handle control commands
    socket.on('control:start', async () => {
      try {
        await arbiter.start();
        io.emit('system:status', arbiter.getStatus());
      } catch (error) {
        socket.emit('error', { message: 'Failed to start agent' });
      }
    });

    socket.on('control:pause', async () => {
      try {
        await arbiter.pause();
        io.emit('system:status', arbiter.getStatus());
      } catch (error) {
        socket.emit('error', { message: 'Failed to pause agent' });
      }
    });

    socket.on('control:stop', async () => {
      try {
        await arbiter.stop();
        io.emit('system:status', arbiter.getStatus());
      } catch (error) {
        socket.emit('error', { message: 'Failed to stop agent' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Subscribe arbiter events to broadcast to all clients
  arbiter.on('status:update', (status) => {
    io.emit('system:status', status);
  });

  arbiter.on('position:update', (position) => {
    io.emit('position:update', position);
  });

  arbiter.on('trade:executed', (trade) => {
    io.emit('trade:executed', trade);
  });

  arbiter.on('market:data', (data) => {
    io.emit('market:data', data);
  });
}

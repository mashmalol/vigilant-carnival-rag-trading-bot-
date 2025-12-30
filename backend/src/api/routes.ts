import type { Express } from 'express';
import type { ArbiterService } from '../services/arbiter-service';

/**
 * REST API routes for controlling and querying The Arbiter
 * All endpoints return JSON responses
 */
export function setupRoutes(app: Express, arbiter: ArbiterService) {
  
  // Get system status
  app.get('/api/status', (req, res) => {
    try {
      const status = arbiter.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  // Get active positions
  app.get('/api/positions', (req, res) => {
    try {
      const positions = arbiter.getPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get positions' });
    }
  });

  // Get trade history
  app.get('/api/trades', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const trades = arbiter.getTradeHistory(limit);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get trades' });
    }
  });

  // Start agent
  app.post('/api/control/start', async (req, res) => {
    try {
      await arbiter.start();
      res.json({ message: 'Agent started', state: 'OPERATIONAL' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start agent' });
    }
  });

  // Pause agent
  app.post('/api/control/pause', async (req, res) => {
    try {
      await arbiter.pause();
      res.json({ message: 'Agent paused', state: 'PAUSED' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to pause agent' });
    }
  });

  // Stop agent
  app.post('/api/control/stop', async (req, res) => {
    try {
      await arbiter.stop();
      res.json({ message: 'Agent terminated', state: 'TERMINATED' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop agent' });
    }
  });
}

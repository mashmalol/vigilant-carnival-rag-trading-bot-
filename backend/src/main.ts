import dotenv from 'dotenv';
import { createAPIServer } from './api/server';
import { ArbiterService } from './services/arbiter-service';

dotenv.config();

/**
 * Main entry point for The Arbiter backend
 * Initializes services and starts HTTP/WebSocket server
 */
async function main() {
  console.log('Starting Arbiter Trading System...');

  // Initialize service
  const arbiter = new ArbiterService();
  await arbiter.initialize();

  // Create API server
  const { httpServer } = createAPIServer(arbiter);

  // Start server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`✓ API Server running on http://localhost:${PORT}`);
    console.log(`✓ WebSocket server ready`);
    console.log(`✓ Arbiter agent initialized (PAUSED)`);
    console.log('\nReady for connections from frontend');
    console.log('Dashboard: http://localhost:3000\n');
  });

  // Demo mode: Simulate trades every 5 seconds if enabled
  if (process.env.DEMO_MODE === 'true') {
    console.log('Demo mode enabled - simulating trades...\n');
    setInterval(() => {
      if (arbiter.getStatus().state === 'OPERATIONAL') {
        arbiter.simulateTrade();
        arbiter.simulateMarketData();
      }
    }, 5000);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await arbiter.stop();
    httpServer.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

import EventEmitter from 'events';
import type { SystemStatus, Position, TradeHistory, MarketData } from '../../../shared/types';

/**
 * ArbiterService - Orchestrates The Arbiter trading agent
 * Integrates all components and emits events for WebSocket broadcasting
 * 
 * Why EventEmitter: Decouples agent logic from WebSocket broadcasting
 * Allows multiple listeners (dashboard, logging, analytics) without tight coupling
 */
export class ArbiterService extends EventEmitter {
  private state: 'OPERATIONAL' | 'PAUSED' | 'TERMINATED' = 'PAUSED';
  private positions: Map<string, Position> = new Map();
  private trades: TradeHistory[] = [];
  private startTime: number = 0;
  private totalPnL: number = 0;
  private killThreshold: number = -0.15;

  constructor() {
    super();
    console.log('ArbiterService initialized');
  }

  async initialize() {
    // TODO: Initialize Pinecone, Binance WebSocket, and agent components
    // This will integrate with existing arbiter-agent.ts when ready
    console.log('Arbiter service ready');
  }

  async start() {
    if (this.state === 'TERMINATED') {
      throw new Error('Cannot restart terminated agent');
    }

    this.state = 'OPERATIONAL';
    this.startTime = Date.now();
    
    this.emitStatus();
    console.log('Arbiter agent started');
  }

  async pause() {
    this.state = 'PAUSED';
    this.emitStatus();
    console.log('Arbiter agent paused');
  }

  async stop() {
    this.state = 'TERMINATED';
    
    // Close all positions
    this.positions.clear();
    
    this.emitStatus();
    console.log('Arbiter agent terminated');
  }

  getStatus(): SystemStatus {
    const uptime = this.startTime > 0 ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    
    return {
      state: this.state,
      totalPnL: this.totalPnL,
      positionsCount: this.positions.size,
      killThreshold: this.killThreshold,
      distanceToKill: this.killThreshold - this.totalPnL,
      uptime
    };
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getTradeHistory(limit: number = 50): TradeHistory[] {
    return this.trades.slice(0, limit);
  }

  private emitStatus() {
    this.emit('status:update', this.getStatus());
  }

  // Mock method for testing - simulates a trade execution
  simulateTrade(symbol: string = 'BTCUSDT') {
    const trade: TradeHistory = {
      id: `trade-${Date.now()}`,
      symbol,
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      price: 45000 + Math.random() * 1000,
      quantity: 0.001 + Math.random() * 0.01,
      pnl: (Math.random() - 0.5) * 100,
      timestamp: Date.now(),
      algoType: Math.random() > 0.5 ? 'TWAP' : 'VP'
    };

    this.trades.unshift(trade);
    this.emit('trade:executed', trade);
    
    // Update position
    const position: Position = {
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      entryPrice: trade.price,
      currentPrice: trade.price + (Math.random() - 0.5) * 50,
      quantity: trade.quantity,
      pnl: trade.pnl,
      pnlPercent: (trade.pnl / (trade.price * trade.quantity)) * 100,
      timestamp: Date.now()
    };

    this.positions.set(trade.symbol, position);
    this.emit('position:update', position);
    
    // Update total P&L
    this.totalPnL += trade.pnl / 10000; // Normalize
    this.emitStatus();
  }

  // Mock method for testing - simulates market data
  simulateMarketData(symbol: string = 'BTCUSDT') {
    const data: MarketData = {
      symbol,
      price: 45000 + Math.random() * 1000,
      volume: 1000 + Math.random() * 500,
      change24h: (Math.random() - 0.5) * 10,
      timestamp: Date.now()
    };

    this.emit('market:data', data);
  }
}

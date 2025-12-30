/**
 * Shared type definitions for The Arbiter
 * Used across frontend, backend, and agent services
 */

export interface TradeSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  quantity: number;
  price: number;
  confidence: number;
  reasoning: string;
  algoOrderType?: 'TWAP' | 'VP';
  timestamp: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

export interface SystemStatus {
  state: 'OPERATIONAL' | 'PAUSED' | 'TERMINATED';
  totalPnL: number;
  positionsCount: number;
  killThreshold: number;
  distanceToKill: number;
  uptime: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change24h?: number;
  timestamp: number;
}

export interface TradeHistory {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  pnl: number;
  timestamp: number;
  algoType?: string;
}

/**
 * Type definitions for The Arbiter Trading Dashboard
 * Shared between frontend and backend for type safety
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

export interface PerformanceMetrics {
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  avgWin: number;
  avgLoss: number;
  avgWinPercent: number;
  avgLossPercent: number;
  largestWin: number;
  largestLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  recoveryFactor: number;
  expectancy: number;
}

export interface RiskMetrics {
  portfolioHeat: number;
  maxDrawdown: number;
  currentDrawdown: number;
  kellyFraction: number;
  valueAtRisk: number;
  expectedShortfall: number;
}

export interface SimilarTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  profit: number;
  similarity: number;
  timestamp: number;
  reasoning: string;
}

// Chat Interface Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  sources?: TradeSource[];
}

export interface TradeSource {
  id: string;
  symbol: string;
  profit: number;
  similarity: number;
  timestamp: number;
  reasoning: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  includeHistory: boolean;
}

export interface ChatResponse {
  message: string;
  sources: TradeSource[];
  conversationId: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

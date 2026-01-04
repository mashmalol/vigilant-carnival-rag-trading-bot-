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

// Feature 2: Crypto Embeddings
export interface EmbeddingTrainingPair {
  anchor: string;
  positive: string;
  negative: string;
}

export interface CryptoEmbeddingConfig {
  modelPath: string;
  dimension: number;
  useLocal: boolean;
}

// Feature 3: Regime Classifier
export type MarketRegime = 'bull' | 'bear' | 'sideways' | 'high-volatility';

export interface RegimeClassification {
  regime: MarketRegime;
  confidence: number;
  features: RegimeFeatures;
  reasoning: string;
}

export interface RegimeFeatures {
  trend30d: number;
  volatility30d: number;
  rsi: number;
  volumeTrend: 'increasing' | 'decreasing' | 'stable';
  pricePosition: number;
  macdSignal: 'bullish' | 'bearish' | 'neutral';
}

export interface TradingStrategy {
  positionSize: number;
  confidenceThreshold: number;
  algoType: 'TWAP' | 'VP' | 'MARKET';
  reasoning: string;
}

export interface PriceCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

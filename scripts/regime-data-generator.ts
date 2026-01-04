import * as fs from 'fs';
import * as path from 'path';
import type { MarketRegime, RegimeFeatures, PriceCandle } from '../shared/types';

interface RegimeTrainingExample {
  input: string;
  output: MarketRegime;
  features: RegimeFeatures;
}

/**
 * Generate training data for market regime classification
 * Labels historical price data with bull/bear/sideways/volatile regimes
 */
export class RegimeDataGenerator {
  private outputDir = './training-data/regime';

  constructor() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate regime labels from historical price data
   */
  async generateFromPriceData(candles: PriceCandle[]): Promise<RegimeTrainingExample[]> {
    const examples: RegimeTrainingExample[] = [];
    const windowSize = 30; // 30-day window

    for (let i = windowSize; i < candles.length; i++) {
      const window = candles.slice(i - windowSize, i);
      const features = this.calculateFeatures(window);
      const regime = this.labelRegime(features);

      const input = this.formatInput(window[window.length - 1], features);

      examples.push({ input, output: regime, features });
    }

    console.log(`Generated ${examples.length} regime training examples`);
    return examples;
  }

  /**
   * Calculate technical features for regime classification
   */
  private calculateFeatures(candles: PriceCandle[]): RegimeFeatures {
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);

    // 30-day trend
    const firstPrice = closes[0];
    const lastPrice = closes[closes.length - 1];
    const trend30d = ((lastPrice - firstPrice) / firstPrice) * 100;

    // Volatility (standard deviation of returns)
    const returns = closes.slice(1).map((price, i) => 
      (price - closes[i]) / closes[i]
    );
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility30d = Math.sqrt(variance);

    // RSI (Relative Strength Index)
    const rsi = this.calculateRSI(closes, 14);

    // Volume trend
    const volumeTrend = this.calculateVolumeTrend(volumes);

    // Price position in range
    const highest = Math.max(...closes);
    const lowest = Math.min(...closes);
    const pricePosition = ((lastPrice - lowest) / (highest - lowest)) * 100;

    // MACD signal
    const macdSignal = this.calculateMACDSignal(closes);

    return {
      trend30d,
      volatility30d,
      rsi,
      volumeTrend,
      pricePosition,
      macdSignal
    };
  }

  /**
   * Label regime based on calculated features
   */
  private labelRegime(features: RegimeFeatures): MarketRegime {
    // High volatility overrides other signals
    if (features.volatility30d > 0.05) {
      return 'high-volatility'; // >5% daily volatility
    }

    // Strong uptrend
    if (features.trend30d > 10 && features.rsi > 50) {
      return 'bull';
    }

    // Strong downtrend
    if (features.trend30d < -10 && features.rsi < 50) {
      return 'bear';
    }

    // Sideways market (low trend, moderate RSI)
    return 'sideways';
  }

  /**
   * Format input text for model training
   */
  private formatInput(candle: PriceCandle, features: RegimeFeatures): string {
    return `Price: $${candle.close.toFixed(2)}
30-day change: ${features.trend30d.toFixed(2)}%
Volatility (30d): ${(features.volatility30d * 100).toFixed(2)}%
RSI: ${features.rsi.toFixed(1)}
Volume trend: ${features.volumeTrend}
Price position: ${features.pricePosition.toFixed(1)}% of 30-day range
MACD signal: ${features.macdSignal}`;
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Neutral

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(-period).reduce((sum, g) => sum + g, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, l) => sum + l, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate volume trend
   */
  private calculateVolumeTrend(volumes: number[]): 'increasing' | 'decreasing' | 'stable' {
    const half = Math.floor(volumes.length / 2);
    const firstHalf = volumes.slice(0, half);
    const secondHalf = volumes.slice(half);

    const avgFirst = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    const change = ((avgSecond - avgFirst) / avgFirst) * 100;

    if (change > 20) return 'increasing';
    if (change < -20) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate MACD signal
   */
  private calculateMACDSignal(prices: number[]): 'bullish' | 'bearish' | 'neutral' {
    if (prices.length < 26) return 'neutral';

    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);

    const macd = ema12 - ema26;

    if (macd > 0) return 'bullish';
    if (macd < 0) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate Exponential Moving Average
   */
  private calculateEMA(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * Save training data in JSONL format
   */
  async saveTrainingData(examples: RegimeTrainingExample[], filename: string = 'regime_training.jsonl') {
    const filepath = path.join(this.outputDir, filename);
    
    // Format for instruction-following
    const formatted = examples.map(ex => ({
      instruction: "Analyze market conditions and classify regime:",
      input: ex.input,
      output: ex.output,
      features: ex.features
    }));

    const jsonl = formatted.map(item => JSON.stringify(item)).join('\n');
    fs.writeFileSync(filepath, jsonl);

    console.log(`Saved ${examples.length} training examples to ${filepath}`);
  }

  /**
   * Generate mock historical data for testing
   */
  generateMockCandles(days: number = 365): PriceCandle[] {
    const candles: PriceCandle[] = [];
    let price = 40000; // Starting BTC price

    for (let i = 0; i < days; i++) {
      // Random walk with drift
      const change = (Math.random() - 0.48) * 1000; // Slight upward bias
      price = Math.max(price + change, 10000); // Don't go below 10k

      const open = price;
      const high = price + Math.random() * 500;
      const low = price - Math.random() * 500;
      const close = low + Math.random() * (high - low);
      const volume = 1000000 + Math.random() * 5000000;

      candles.push({
        timestamp: Date.now() - (days - i) * 24 * 60 * 60 * 1000,
        open,
        high,
        low,
        close,
        volume
      });
    }

    return candles;
  }
}

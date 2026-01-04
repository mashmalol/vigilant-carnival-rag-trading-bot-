import * as fs from 'fs';
import * as path from 'path';
import type { EmbeddingTrainingPair } from '../shared/types';

interface TradeData {
  id: string;
  symbol: string;
  description: string;
  profit: number;
  rsi?: number;
  volume?: string;
  pattern?: string;
  timestamp: number;
}

/**
 * Generates contrastive training pairs for fine-tuning crypto embeddings
 * Uses historical trade data to create anchor-positive-negative triplets
 */
export class EmbeddingDataGenerator {
  private outputDir = './training-data/embeddings';

  constructor() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate training pairs from historical trades
   */
  async generateFromTrades(trades: TradeData[]): Promise<EmbeddingTrainingPair[]> {
    const pairs: EmbeddingTrainingPair[] = [];

    // Add base crypto terminology pairs
    pairs.push(...this.getCryptoTerminologyPairs());

    // Generate pairs from actual trades
    for (let i = 0; i < trades.length; i++) {
      for (let j = i + 1; j < trades.length; j++) {
        const trade1 = trades[i];
        const trade2 = trades[j];

        // Similar context = positive pair
        if (this.areSimilarTrades(trade1, trade2)) {
          const negativeTrade = this.getRandomTrade(trades, [trade1.id, trade2.id]);
          
          pairs.push({
            anchor: this.buildTradeDescription(trade1),
            positive: this.buildTradeDescription(trade2),
            negative: this.buildTradeDescription(negativeTrade)
          });
        }
      }
    }

    return pairs;
  }

  /**
   * Save training pairs in JSON format
   */
  async savePairs(pairs: EmbeddingTrainingPair[], filename: string = 'crypto_pairs.json') {
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(pairs, null, 2));
    console.log(`Saved ${pairs.length} training pairs to ${filepath}`);
  }

  /**
   * Export pairs in JSONL format for various training frameworks
   */
  async exportJSONL(pairs: EmbeddingTrainingPair[], filename: string = 'crypto_pairs.jsonl') {
    const filepath = path.join(this.outputDir, filename);
    const jsonl = pairs.map(pair => JSON.stringify(pair)).join('\n');
    fs.writeFileSync(filepath, jsonl);
    console.log(`Exported ${pairs.length} pairs to ${filepath}`);
  }

  private areSimilarTrades(trade1: TradeData, trade2: TradeData): boolean {
    // Both profitable in similar RSI conditions
    if (trade1.profit > 0 && trade2.profit > 0) {
      if (trade1.rsi && trade2.rsi && Math.abs(trade1.rsi - trade2.rsi) < 10) {
        return true;
      }
    }

    // Same pattern detected
    if (trade1.pattern && trade1.pattern === trade2.pattern) {
      return true;
    }

    // Similar volume conditions
    if (trade1.volume === trade2.volume && trade1.volume !== 'Normal') {
      return true;
    }

    return false;
  }

  private getRandomTrade(trades: TradeData[], excludeIds: string[]): TradeData {
    const filtered = trades.filter(t => !excludeIds.includes(t.id));
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  private buildTradeDescription(trade: TradeData): string {
    const parts = [
      `${trade.symbol}`,
      trade.description,
      trade.rsi ? `RSI: ${trade.rsi}` : '',
      trade.volume ? `Volume: ${trade.volume}` : '',
      trade.pattern ? `Pattern: ${trade.pattern}` : ''
    ];

    return parts.filter(Boolean).join(', ');
  }

  /**
   * Base crypto-specific terminology pairs
   */
  private getCryptoTerminologyPairs(): EmbeddingTrainingPair[] {
    return [
      {
        anchor: "BTCUSDT breaking resistance at 45k with high volume",
        positive: "Bitcoin USD pair crossed 45,000 barrier on strong buying pressure",
        negative: "ETHUSDT consolidating near support at 2.5k"
      },
      {
        anchor: "RSI showing bullish divergence on 4h chart",
        positive: "4-hour RSI making higher lows while price makes lower lows",
        negative: "MACD bearish crossover on daily timeframe"
      },
      {
        anchor: "TWAP order execution spreading buys over 30 minutes",
        positive: "Time-weighted average price algo distributing entry across half hour",
        negative: "Market order filled immediately at current best price"
      },
      {
        anchor: "Volume profile shows accumulation zone at 44k",
        positive: "Heavy buying activity concentrated around 44,000 price level",
        negative: "Volume declining as price approaches resistance"
      },
      {
        anchor: "Bull flag pattern forming on daily chart",
        positive: "Consolidation after strong upward move creating bullish continuation setup",
        negative: "Head and shoulders pattern suggesting trend reversal"
      },
      {
        anchor: "Funding rate positive indicating long bias",
        positive: "Perpetual futures funding showing traders paying to hold long positions",
        negative: "Negative funding rate as shorts dominate perpetual markets"
      },
      {
        anchor: "Orderbook showing large bid wall at 43.5k",
        positive: "Significant buy orders stacked at 43,500 support level",
        negative: "Heavy sell pressure visible in ask side of orderbook"
      },
      {
        anchor: "Ascending triangle pattern near completion",
        positive: "Higher lows converging with resistance creating bullish breakout setup",
        negative: "Descending triangle showing lower highs approaching support"
      },
      {
        anchor: "Ichimoku cloud providing support below current price",
        positive: "Price trading above kumo cloud indicating bullish momentum",
        negative: "Price rejected at cloud resistance showing bearish control"
      },
      {
        anchor: "VP algo matching volume participation percentage",
        positive: "Volume participation order matching market volume to minimize impact",
        negative: "Aggressive market order causing slippage on entry"
      }
    ];
  }

  /**
   * Generate mock historical trades for testing
   */
  generateMockTrades(count: number = 100): TradeData[] {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
    const patterns = ['bull flag', 'ascending triangle', 'double bottom', 'breakout', 'consolidation'];
    const volumes = ['High', 'Low', 'Normal'];

    const trades: TradeData[] = [];

    for (let i = 0; i < count; i++) {
      const profit = (Math.random() - 0.4) * 200; // Bias toward profitable
      const rsi = 30 + Math.random() * 40; // 30-70 range

      trades.push({
        id: `trade_${i}`,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        description: `Trade at ${(40000 + Math.random() * 10000).toFixed(2)}`,
        profit,
        rsi,
        volume: volumes[Math.floor(Math.random() * volumes.length)],
        pattern: Math.random() > 0.3 ? patterns[Math.floor(Math.random() * patterns.length)] : undefined,
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      });
    }

    return trades;
  }
}

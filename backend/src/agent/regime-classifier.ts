import type { MarketRegime, RegimeClassification, RegimeFeatures, TradingStrategy } from '../../../shared/types';

/**
 * Market regime classifier using fine-tuned model
 * Predicts bull/bear/sideways/volatile market conditions
 */
export class RegimeClassifier {
  private model: any = null;
  private modelPath: string;
  private strategies: Record<MarketRegime, TradingStrategy>;
  private useRuleBased: boolean = false;

  constructor(modelPath: string = './models/regime-classifier-v1') {
    this.modelPath = modelPath;
    this.strategies = this.defineStrategies();
  }

  /**
   * Initialize the classifier model
   */
  async initialize(): Promise<void> {
    try {
      const { pipeline } = await import('@xenova/transformers');
      
      this.model = await pipeline('text-generation', this.modelPath, {
        quantized: true
      });

      console.log('✓ Regime classifier loaded');
    } catch (error) {
      console.error('Failed to load regime classifier:', error);
      console.warn('⚠ Using rule-based regime classification');
      this.useRuleBased = true;
    }
  }

  /**
   * Classify market regime from features
   */
  async classify(features: RegimeFeatures): Promise<RegimeClassification> {
    const input = this.formatInput(features);

    if (this.model && !this.useRuleBased) {
      return await this.classifyWithModel(input, features);
    } else {
      return this.classifyWithRules(features);
    }
  }

  /**
   * Model-based classification
   */
  private async classifyWithModel(input: string, features: RegimeFeatures): Promise<RegimeClassification> {
    const prompt = `Analyze market conditions and classify regime:

${input}

Classify the market regime as one of: bull, bear, sideways, or high-volatility`;

    const result = await this.model(prompt, {
      max_new_tokens: 20,
      temperature: 0.1,
      do_sample: true
    });

    const output = result[0].generated_text;
    const regime = this.parseRegime(output);
    const confidence = this.estimateConfidence(features, regime);

    return {
      regime,
      confidence,
      features,
      reasoning: this.generateReasoning(regime, features)
    };
  }

  /**
   * Rule-based classification (fallback)
   */
  private classifyWithRules(features: RegimeFeatures): RegimeClassification {
    let regime: MarketRegime;

    // High volatility check
    if (features.volatility30d > 0.05) {
      regime = 'high-volatility';
    }
    // Bull market
    else if (features.trend30d > 10 && features.rsi > 50 && features.macdSignal === 'bullish') {
      regime = 'bull';
    }
    // Bear market
    else if (features.trend30d < -10 && features.rsi < 50 && features.macdSignal === 'bearish') {
      regime = 'bear';
    }
    // Sideways
    else {
      regime = 'sideways';
    }

    const confidence = this.estimateConfidence(features, regime);

    return {
      regime,
      confidence,
      features,
      reasoning: this.generateReasoning(regime, features)
    };
  }

  /**
   * Get trading strategy for regime
   */
  getStrategy(regime: MarketRegime): TradingStrategy {
    return this.strategies[regime];
  }

  /**
   * Format features as input text
   */
  private formatInput(features: RegimeFeatures): string {
    return `30-day change: ${features.trend30d.toFixed(2)}%
Volatility (30d): ${(features.volatility30d * 100).toFixed(2)}%
RSI: ${features.rsi.toFixed(1)}
Volume trend: ${features.volumeTrend}
Price position: ${features.pricePosition.toFixed(1)}% of 30-day range
MACD signal: ${features.macdSignal}`;
  }

  /**
   * Parse regime from model output
   */
  private parseRegime(output: string): MarketRegime {
    const lower = output.toLowerCase();
    
    if (lower.includes('bull')) return 'bull';
    if (lower.includes('bear')) return 'bear';
    if (lower.includes('high-volatility') || lower.includes('volatile')) return 'high-volatility';
    return 'sideways';
  }

  /**
   * Estimate confidence based on feature strength
   */
  private estimateConfidence(features: RegimeFeatures, regime: MarketRegime): number {
    let confidence = 0.5;

    // Strong signals increase confidence
    if (regime === 'bull') {
      if (features.trend30d > 15) confidence += 0.2;
      if (features.rsi > 60) confidence += 0.1;
      if (features.macdSignal === 'bullish') confidence += 0.1;
      if (features.volumeTrend === 'increasing') confidence += 0.1;
    }
    else if (regime === 'bear') {
      if (features.trend30d < -15) confidence += 0.2;
      if (features.rsi < 40) confidence += 0.1;
      if (features.macdSignal === 'bearish') confidence += 0.1;
      if (features.volumeTrend === 'decreasing') confidence += 0.1;
    }
    else if (regime === 'high-volatility') {
      if (features.volatility30d > 0.07) confidence += 0.3;
    }
    else {
      // Sideways: moderate everything
      if (Math.abs(features.trend30d) < 5) confidence += 0.2;
      if (features.rsi > 40 && features.rsi < 60) confidence += 0.1;
    }

    return Math.min(confidence, 0.95);
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(regime: MarketRegime, features: RegimeFeatures): string {
    const reasons: string[] = [];

    switch (regime) {
      case 'bull':
        if (features.trend30d > 10) reasons.push(`Strong uptrend (+${features.trend30d.toFixed(1)}%)`);
        if (features.rsi > 60) reasons.push('RSI showing strength');
        if (features.macdSignal === 'bullish') reasons.push('MACD bullish');
        if (features.volumeTrend === 'increasing') reasons.push('Volume increasing');
        break;

      case 'bear':
        if (features.trend30d < -10) reasons.push(`Strong downtrend (${features.trend30d.toFixed(1)}%)`);
        if (features.rsi < 40) reasons.push('RSI showing weakness');
        if (features.macdSignal === 'bearish') reasons.push('MACD bearish');
        if (features.volumeTrend === 'decreasing') reasons.push('Volume declining');
        break;

      case 'high-volatility':
        reasons.push(`High volatility (${(features.volatility30d * 100).toFixed(2)}%)`);
        reasons.push('Increased risk of sudden moves');
        break;

      case 'sideways':
        reasons.push('Low trend strength');
        reasons.push('Range-bound price action');
        if (features.volumeTrend === 'stable') reasons.push('Stable volume');
        break;
    }

    return reasons.join('. ') + '.';
  }

  /**
   * Define trading strategies per regime
   */
  private defineStrategies(): Record<MarketRegime, TradingStrategy> {
    return {
      'bull': {
        positionSize: 0.02,
        confidenceThreshold: 0.60,
        algoType: 'VP',
        reasoning: 'Momentum strategy: ride the trend with volume participation'
      },
      'bear': {
        positionSize: 0.01,
        confidenceThreshold: 0.70,
        algoType: 'TWAP',
        reasoning: 'Defensive positioning: smaller size, higher confidence required'
      },
      'sideways': {
        positionSize: 0.015,
        confidenceThreshold: 0.65,
        algoType: 'TWAP',
        reasoning: 'Mean reversion: trade the range with time-weighted execution'
      },
      'high-volatility': {
        positionSize: 0.005,
        confidenceThreshold: 0.80,
        algoType: 'TWAP',
        reasoning: 'Risk reduction: minimal exposure, very high confidence required'
      }
    };
  }

  /**
   * Calculate regime features from market data
   * In production, this would fetch historical data
   */
  calculateFeatures(marketData: {
    price: number;
    change24h?: number;
    volume: number;
  }): RegimeFeatures {
    // Mock calculations - in production, use real historical data
    return {
      trend30d: (marketData.change24h || 0) * 1.5, // Mock 30d from 24h
      volatility30d: 0.03, // Mock 3% volatility
      rsi: 50 + (marketData.change24h || 0) * 2, // Mock RSI from price change
      volumeTrend: marketData.volume > 1000000 ? 'increasing' : 'stable',
      pricePosition: 50, // Mock middle of range
      macdSignal: (marketData.change24h || 0) > 0 ? 'bullish' : 'bearish'
    };
  }
}

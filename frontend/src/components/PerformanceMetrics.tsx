import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle } from 'lucide-react';
import type { TradeHistory, PerformanceMetrics } from '../types';

interface Props {
  trades: TradeHistory[];
  totalPnL: number;
}

/**
 * PerformanceMetrics Component
 * Calculates and displays comprehensive trading performance statistics
 * Including win rate, profit factor, Sharpe ratio, and more
 */
export const PerformanceMetrics: React.FC<Props> = ({ trades, totalPnL }) => {
  const metrics = useMemo(() => calculatePerformanceMetrics(trades, totalPnL), [trades, totalPnL]);

  return (
    <div className="bg-surface rounded-lg p-6 border border-neutral-800">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-neutral-50">Performance Analytics</h2>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-success" />
            <p className="text-sm text-neutral-400">Win Rate</p>
          </div>
          <p className="text-2xl font-bold text-neutral-50">
            {(metrics.winRate * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {metrics.winningTrades}/{metrics.totalTrades} trades
          </p>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm text-neutral-400">Profit Factor</p>
          </div>
          <p className={`text-2xl font-bold ${metrics.profitFactor >= 1.5 ? 'text-success' : metrics.profitFactor >= 1 ? 'text-warning' : 'text-danger'}`}>
            {metrics.profitFactor.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {metrics.profitFactor >= 1.5 ? 'Excellent' : metrics.profitFactor >= 1 ? 'Good' : 'Poor'}
          </p>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-primary" />
            <p className="text-sm text-neutral-400">Sharpe Ratio</p>
          </div>
          <p className="text-2xl font-bold text-neutral-50">
            {metrics.sharpeRatio.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Risk-adjusted return
          </p>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-success" />
            <p className="text-sm text-neutral-400">Expectancy</p>
          </div>
          <p className={`text-2xl font-bold ${metrics.expectancy > 0 ? 'text-success' : 'text-danger'}`}>
            ${metrics.expectancy.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Per trade expected
          </p>
        </div>
      </div>

      {/* Win/Loss Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Winning Trades
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-400">Average Win</span>
              <span className="text-sm font-medium text-success">
                +${metrics.avgWin.toFixed(2)} ({metrics.avgWinPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-400">Largest Win</span>
              <span className="text-sm font-medium text-success">
                +${metrics.largestWin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-400">Max Streak</span>
              <span className="text-sm font-medium text-neutral-50">
                {metrics.maxConsecutiveWins} trades
              </span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Losing Trades
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-400">Average Loss</span>
              <span className="text-sm font-medium text-danger">
                -${Math.abs(metrics.avgLoss).toFixed(2)} ({metrics.avgLossPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-400">Largest Loss</span>
              <span className="text-sm font-medium text-danger">
                -${Math.abs(metrics.largestLoss).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-400">Max Streak</span>
              <span className="text-sm font-medium text-neutral-50">
                {metrics.maxConsecutiveLosses} trades
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="bg-neutral-900/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-neutral-50 mb-3">Advanced Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Sortino Ratio</p>
            <p className="text-lg font-medium text-neutral-50">{metrics.sortinoRatio.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Recovery Factor</p>
            <p className="text-lg font-medium text-neutral-50">{metrics.recoveryFactor.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Current Streak</p>
            <p className={`text-lg font-medium ${
              metrics.consecutiveWins > 0 ? 'text-success' : 
              metrics.consecutiveLosses > 0 ? 'text-danger' : 'text-neutral-50'
            }`}>
              {metrics.consecutiveWins > 0 ? `+${metrics.consecutiveWins}` : 
               metrics.consecutiveLosses > 0 ? `-${metrics.consecutiveLosses}` : '0'}
            </p>
          </div>
        </div>
      </div>

      {(metrics.winRate < 0.4 || metrics.profitFactor < 1) && (
        <div className="mt-4 bg-danger/10 border border-danger/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
            <div>
              <p className="text-sm font-medium text-danger">Performance Warning</p>
              <p className="text-xs text-neutral-400 mt-1">
                {metrics.winRate < 0.4 && 'Win rate below 40%. '}
                {metrics.profitFactor < 1 && 'Profit factor below 1.0 (losing more than gaining). '}
                Consider reviewing strategy parameters.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function calculatePerformanceMetrics(trades: TradeHistory[], totalPnL: number): PerformanceMetrics {
  if (trades.length === 0) {
    return {
      winRate: 0, profitFactor: 0, sharpeRatio: 0, sortinoRatio: 0,
      avgWin: 0, avgLoss: 0, avgWinPercent: 0, avgLossPercent: 0,
      largestWin: 0, largestLoss: 0, totalTrades: 0, winningTrades: 0,
      losingTrades: 0, consecutiveWins: 0, consecutiveLosses: 0,
      maxConsecutiveWins: 0, maxConsecutiveLosses: 0, recoveryFactor: 0, expectancy: 0
    };
  }

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);

  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

  const winRate = winningTrades.length / trades.length;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins;

  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

  const avgWinPercent = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + (t.pnl / (t.price * t.quantity)) * 100, 0) / winningTrades.length
    : 0;
  const avgLossPercent = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + Math.abs((t.pnl / (t.price * t.quantity)) * 100), 0) / losingTrades.length
    : 0;

  const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0;
  const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0;

  const returns = trades.map(t => (t.pnl / (t.price * t.quantity)));
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  const negativeReturns = returns.filter(r => r < 0);
  const downsideDeviation = negativeReturns.length > 0
    ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length)
    : stdDev;
  const sortinoRatio = downsideDeviation > 0 ? (avgReturn / downsideDeviation) * Math.sqrt(252) : 0;

  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  for (const trade of trades) {
    if (trade.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
    } else if (trade.pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
    }
  }

  const maxDrawdown = Math.abs(Math.min(...trades.map(t => t.pnl), 0));
  const recoveryFactor = maxDrawdown > 0 ? totalPnL / maxDrawdown : 0;
  const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);

  return {
    winRate,
    profitFactor,
    sharpeRatio,
    sortinoRatio,
    avgWin,
    avgLoss,
    avgWinPercent,
    avgLossPercent,
    largestWin,
    largestLoss,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    consecutiveWins: currentWinStreak,
    consecutiveLosses: currentLossStreak,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    recoveryFactor,
    expectancy
  };
}

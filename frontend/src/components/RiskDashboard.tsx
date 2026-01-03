import React, { useMemo } from 'react';
import { AlertTriangle, Shield, TrendingDown, Target } from 'lucide-react';
import type { Position, SystemStatus } from '../types';

interface Props {
  positions: Position[];
  systemStatus: SystemStatus;
}

interface RiskMetrics {
  portfolioHeat: number;
  maxDrawdown: number;
  currentDrawdown: number;
  kellyFraction: number;
  valueAtRisk: number;
  expectedShortfall: number;
}

interface PositionRisk {
  symbol: string;
  exposure: number;
  riskScore: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
}

/**
 * RiskDashboard Component
 * Displays portfolio risk metrics and position-level risk analysis
 * Implements visual warnings for high-risk situations
 */
export const RiskDashboard: React.FC<Props> = ({ positions, systemStatus }) => {
  const riskMetrics = useMemo(() => calculateRiskMetrics(positions, systemStatus), [positions, systemStatus]);

  const drawdownPercent = (Math.abs(systemStatus.totalPnL) / Math.abs(systemStatus.killThreshold)) * 100;
  const isHighRisk = drawdownPercent > 66;

  return (
    <div className="bg-surface rounded-lg p-6 border border-neutral-800">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-neutral-50">Risk Management</h2>
      </div>

      {/* Risk Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Portfolio Heat */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-400">Portfolio Heat</p>
            <Target className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-neutral-50">
            {(riskMetrics.portfolioHeat * 100).toFixed(1)}%
          </p>
          <div className="mt-2 w-full bg-neutral-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                riskMetrics.portfolioHeat > 0.7 ? 'bg-danger' : 
                riskMetrics.portfolioHeat > 0.4 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${riskMetrics.portfolioHeat * 100}%` }}
            />
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-400">Max Drawdown</p>
            <TrendingDown className="w-4 h-4 text-danger" />
          </div>
          <p className="text-2xl font-bold text-danger">
            {(riskMetrics.maxDrawdown * 100).toFixed(2)}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Kill at {(systemStatus.killThreshold * 100).toFixed(0)}%
          </p>
        </div>

        {/* Kelly Fraction */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-400">Kelly Fraction</p>
            <Shield className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-neutral-50">
            {(riskMetrics.kellyFraction * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Optimal position size
          </p>
        </div>

        {/* Value at Risk */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-400">VaR (95%)</p>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-neutral-50">
            ${riskMetrics.valueAtRisk.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Expected max loss
          </p>
        </div>
      </div>

      {/* Drawdown Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-neutral-400">Drawdown to Kill Threshold</p>
          <p className={`text-sm font-medium ${isHighRisk ? 'text-danger' : 'text-neutral-50'}`}>
            {drawdownPercent.toFixed(1)}%
          </p>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isHighRisk ? 'bg-danger animate-pulse' : 'bg-warning'
            }`}
            style={{ width: `${Math.min(drawdownPercent, 100)}%` }}
          />
        </div>
        {isHighRisk && (
          <p className="text-xs text-danger mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            High risk: Approaching kill threshold
          </p>
        )}
      </div>

      {/* Position Risk Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-50 mb-3">Position Risk Analysis</h3>
        <div className="space-y-2">
          {positions.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">No active positions</p>
          ) : (
            positions.map((position) => {
              const positionRisk = calculatePositionRisk(position, riskMetrics);
              return (
                <div key={position.id} className="bg-neutral-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-neutral-50">{position.symbol}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        position.side === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {position.side}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-50">
                        {positionRisk.exposure.toFixed(1)}% exposure
                      </p>
                      <p className="text-xs text-neutral-400">
                        R/R: {positionRisk.riskRewardRatio.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-neutral-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          positionRisk.riskScore > 70 ? 'bg-danger' :
                          positionRisk.riskScore > 40 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${positionRisk.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

function calculateRiskMetrics(positions: Position[], systemStatus: SystemStatus): RiskMetrics {
  const totalValue = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);

  const portfolioHeat = positions.length > 0 ? Math.min(totalValue / 10000, 1) : 0;
  const maxDrawdown = Math.min(systemStatus.totalPnL, 0);

  const winRate = 0.6;
  const avgWin = 0.02;
  const avgLoss = 0.01;
  const kellyFraction = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;

  const dailyVolatility = 0.03;
  const valueAtRisk = totalValue * dailyVolatility * 1.65;

  return {
    portfolioHeat,
    maxDrawdown,
    currentDrawdown: systemStatus.totalPnL,
    kellyFraction: Math.max(0, Math.min(kellyFraction, 0.25)),
    valueAtRisk,
    expectedShortfall: valueAtRisk * 1.3
  };
}

function calculatePositionRisk(position: Position, riskMetrics: RiskMetrics): PositionRisk {
  const positionValue = position.currentPrice * position.quantity;
  const portfolioValue = 10000;
  
  const exposure = (positionValue / portfolioValue) * 100;
  const riskScore = Math.min((exposure * 2) + Math.abs(position.pnlPercent), 100);

  const stopLoss = position.entryPrice * (position.side === 'BUY' ? 0.98 : 1.02);
  const takeProfit = position.entryPrice * (position.side === 'BUY' ? 1.04 : 0.96);
  const riskRewardRatio = Math.abs(takeProfit - position.entryPrice) / Math.abs(position.entryPrice - stopLoss);

  return {
    symbol: position.symbol,
    exposure,
    riskScore,
    stopLoss,
    takeProfit,
    riskRewardRatio
  };
}

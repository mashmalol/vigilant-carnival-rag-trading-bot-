import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Position } from '../types';

interface Props {
  position: Position;
}

/**
 * TradeCard Component
 * Displays individual position with P&L visualization
 * Applies Fitts's Law: Card sized for easy interaction
 * Visual Hierarchy: Price is most prominent
 */
export const TradeCard: React.FC<Props> = ({ position }) => {
  const isProfitable = position.pnl >= 0;
  const borderColor = position.side === 'BUY' ? 'border-success' : 'border-danger';
  
  return (
    <div className={`bg-surface rounded-lg p-4 border-2 ${borderColor} hover:shadow-lg transition-shadow`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-neutral-50">{position.symbol}</h3>
          <span className={`text-xs px-2 py-1 rounded ${
            position.side === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
          }`}>
            {position.side}
          </span>
        </div>
        
        {/* P&L Indicator */}
        <div className="text-right">
          {isProfitable ? (
            <TrendingUp className="w-5 h-5 text-success inline-block" />
          ) : position.pnl < 0 ? (
            <TrendingDown className="w-5 h-5 text-danger inline-block" />
          ) : (
            <Minus className="w-5 h-5 text-neutral-400 inline-block" />
          )}
        </div>
      </div>

      {/* Current Price - Visual Hierarchy: Largest element */}
      <div className="mb-3">
        <p className="text-sm text-neutral-400">Current Price</p>
        <p className="text-3xl font-bold text-primary">
          ${position.currentPrice.toFixed(2)}
        </p>
      </div>

      {/* Metrics Grid - Alignment: Consistent structure */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-neutral-400">Entry</p>
          <p className="font-medium text-neutral-50">${position.entryPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-neutral-400">Quantity</p>
          <p className="font-medium text-neutral-50">{position.quantity.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-neutral-400">P&L</p>
          <p className={`font-bold ${isProfitable ? 'text-success' : 'text-danger'}`}>
            {isProfitable ? '+' : ''}${position.pnl.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-neutral-400">P&L %</p>
          <p className={`font-bold ${isProfitable ? 'text-success' : 'text-danger'}`}>
            {isProfitable ? '+' : ''}{position.pnlPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-3 pt-3 border-t border-neutral-800">
        <p className="text-xs text-neutral-400">
          {new Date(position.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

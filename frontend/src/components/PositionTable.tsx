import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { TradeHistory } from '../types';

interface Props {
  trades: TradeHistory[];
}

/**
 * PositionTable Component
 * Displays trade history in tabular format
 * Applies Miller's Law: Limited to 50 recent trades
 * Alignment: Consistent column structure
 */
export const PositionTable: React.FC<Props> = ({ trades }) => {
  return (
    <div className="bg-surface rounded-lg border border-neutral-800 overflow-hidden">
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-50">Trade History</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  No trades executed yet
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-neutral-400">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-neutral-50">
                    {trade.symbol}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      trade.side === 'BUY' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-danger/20 text-danger'
                    }`}>
                      {trade.side === 'BUY' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-neutral-50">
                    ${trade.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-neutral-50">
                    {trade.quantity.toFixed(4)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-bold ${
                    trade.pnl >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-400">
                    {trade.algoType || 'MARKET'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

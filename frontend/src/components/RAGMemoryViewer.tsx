import React, { useState } from 'react';
import { Brain, Database, TrendingUp, Search, Filter } from 'lucide-react';
import type { SimilarTrade } from '../types';

interface Props {
  currentSymbol: string;
  onQueryMemory: (symbol: string, context: string) => Promise<SimilarTrade[]>;
}

/**
 * RAGMemoryViewer Component
 * Queries Pinecone vector database for similar historical trades
 * Visualizes pattern recognition and decision similarity
 */
export const RAGMemoryViewer: React.FC<Props> = ({ currentSymbol, onQueryMemory }) => {
  const [similarTrades, setSimilarTrades] = useState<SimilarTrade[]>([]);
  const [queryContext, setQueryContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterProfitable, setFilterProfitable] = useState(false);

  const handleQuery = async () => {
    setIsLoading(true);
    try {
      const results = await onQueryMemory(currentSymbol, queryContext);
      setSimilarTrades(results);
    } catch (error) {
      console.error('Failed to query memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrades = filterProfitable
    ? similarTrades.filter(t => t.profit > 0)
    : similarTrades;

  const avgSimilarity = similarTrades.length > 0
    ? similarTrades.reduce((sum, t) => sum + t.similarity, 0) / similarTrades.length
    : 0;

  const profitableTrades = similarTrades.filter(t => t.profit > 0).length;
  const winRate = similarTrades.length > 0 ? profitableTrades / similarTrades.length : 0;

  return (
    <div className="bg-surface rounded-lg p-6 border border-neutral-800">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-neutral-50">RAG Memory Analysis</h2>
      </div>

      {/* Query Interface */}
      <div className="bg-neutral-900/50 rounded-lg p-4 mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-neutral-400 mb-1">Market Context</label>
            <input
              type="text"
              value={queryContext}
              onChange={(e) => setQueryContext(e.target.value)}
              placeholder="e.g., high volatility, uptrend, support level"
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-50 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleQuery}
            disabled={isLoading}
            className="mt-5 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Query Memory'}
          </button>
        </div>

        <p className="text-xs text-neutral-400">
          Search Pinecone vector database for similar historical market conditions
        </p>
      </div>

      {/* Memory Statistics */}
      {similarTrades.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-primary" />
              <p className="text-sm text-neutral-400">Matches Found</p>
            </div>
            <p className="text-2xl font-bold text-neutral-50">{similarTrades.length}</p>
          </div>

          <div className="bg-neutral-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-sm text-neutral-400">Win Rate</p>
            </div>
            <p className="text-2xl font-bold text-neutral-50">{(winRate * 100).toFixed(1)}%</p>
          </div>

          <div className="bg-neutral-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <p className="text-sm text-neutral-400">Avg Similarity</p>
            </div>
            <p className="text-2xl font-bold text-neutral-50">{(avgSimilarity * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      {similarTrades.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-neutral-400" />
          <button
            onClick={() => setFilterProfitable(!filterProfitable)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filterProfitable
                ? 'bg-success text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Show Profitable Only
          </button>
          <span className="text-sm text-neutral-400">
            {filteredTrades.length} / {similarTrades.length} trades
          </span>
        </div>
      )}

      {/* Similar Trades List */}
      <div className="space-y-3">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">
              {similarTrades.length > 0 && filterProfitable
                ? 'No profitable trades found in this context'
                : 'Query memory to see similar historical trades'}
            </p>
          </div>
        ) : (
          filteredTrades.map((trade) => (
            <div
              key={trade.id}
              className="bg-neutral-900/50 rounded-lg p-4 border-l-4"
              style={{
                borderLeftColor: trade.profit > 0 ? '#10B981' : '#EF4444'
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-50">{trade.symbol}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      trade.side === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}>
                      {trade.side}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                      {(trade.similarity * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    ${trade.price.toFixed(2)} • {new Date(trade.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${trade.profit > 0 ? 'text-success' : 'text-danger'}`}>
                    {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <div className="w-full bg-neutral-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${trade.similarity * 100}%` }}
                  />
                </div>
              </div>

              {trade.reasoning && (
                <p className="text-xs text-neutral-400 bg-neutral-800/50 rounded p-2 mt-2">
                  "{trade.reasoning}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pattern Insights */}
      {similarTrades.length > 0 && (
        <div className="mt-6 bg-primary/10 border border-primary/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-primary mb-2">Pattern Insight</h3>
          <p className="text-xs text-neutral-300">
            Based on {similarTrades.length} similar historical situations, 
            The Arbiter identifies a {(winRate * 100).toFixed(0)}% success rate. 
            Average similarity score: {(avgSimilarity * 100).toFixed(0)}%.
            {winRate > 0.6 && ' Strong positive pattern detected.'}
            {winRate < 0.4 && ' Caution: Historical pattern shows low success rate.'}
          </p>
        </div>
      )}
    </div>
  );
};

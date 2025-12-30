import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  symbol: string;
  data: Array<{ time: string; price: number }>;
}

/**
 * PriceChart Component
 * Real-time price visualization using Recharts
 * Clean, minimal design for data clarity
 */
export const PriceChart: React.FC<Props> = ({ symbol, data }) => {
  return (
    <div className="bg-surface rounded-lg p-6 border border-neutral-800">
      <h2 className="text-lg font-semibold text-neutral-50 mb-4">
        {symbol} Price Chart
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1F3A',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

import { useState } from 'react';
import type { SimilarTrade } from '../types';

/**
 * Hook for querying RAG memory via backend API
 * Fetches similar historical trades from Pinecone
 */
export const useRAGMemory = () => {
  const [isQuerying, setIsQuerying] = useState(false);

  const queryMemory = async (symbol: string, context: string): Promise<SimilarTrade[]> => {
    setIsQuerying(true);
    
    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, context })
      });

      if (!response.ok) {
        throw new Error('Failed to query memory');
      }

      const data = await response.json();
      return data.similarTrades;
    } catch (error) {
      console.error('RAG query error:', error);
      return [];
    } finally {
      setIsQuerying(false);
    }
  };

  return { queryMemory, isQuerying };
};

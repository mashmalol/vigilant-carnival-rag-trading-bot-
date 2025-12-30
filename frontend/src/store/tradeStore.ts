import { create } from 'zustand';
import type { SystemStatus, Position, TradeHistory, MarketData } from '../types';

interface TradeStore {
  // State
  systemStatus: SystemStatus;
  positions: Position[];
  tradeHistory: TradeHistory[];
  marketData: Record<string, MarketData>;
  isConnected: boolean;
  
  // Actions
  setSystemStatus: (status: SystemStatus) => void;
  updatePosition: (position: Position) => void;
  addTrade: (trade: TradeHistory) => void;
  updateMarketData: (data: MarketData) => void;
  setConnected: (connected: boolean) => void;
  clearPositions: () => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
  systemStatus: {
    state: 'PAUSED',
    totalPnL: 0,
    positionsCount: 0,
    killThreshold: -0.15,
    distanceToKill: 0.15,
    uptime: 0
  },
  positions: [],
  tradeHistory: [],
  marketData: {},
  isConnected: false,

  setSystemStatus: (status) => set({ systemStatus: status }),
  
  updatePosition: (position) => set((state) => {
    const existing = state.positions.findIndex(p => p.id === position.id);
    if (existing >= 0) {
      const updated = [...state.positions];
      updated[existing] = position;
      return { positions: updated };
    }
    return { positions: [...state.positions, position] };
  }),

  addTrade: (trade) => set((state) => ({
    tradeHistory: [trade, ...state.tradeHistory].slice(0, 50) // Keep last 50
  })),

  updateMarketData: (data) => set((state) => ({
    marketData: { ...state.marketData, [data.symbol]: data }
  })),

  setConnected: (connected) => set({ isConnected: connected }),
  
  clearPositions: () => set({ positions: [] })
}));

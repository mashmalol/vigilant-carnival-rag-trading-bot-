import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTradeStore } from '../store/tradeStore';
import type { SystemStatus, Position, TradeHistory, MarketData } from '../types';

/**
 * WebSocket hook for real-time communication with backend
 * Automatically connects, reconnects, and handles all trading events
 */
export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const {
    setSystemStatus,
    updatePosition,
    addTrade,
    updateMarketData,
    setConnected
  } = useTradeStore();

  useEffect(() => {
    // Connect to Socket.io server
    const socket = io('http://localhost:4000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    // System status updates
    socket.on('system:status', (status: SystemStatus) => {
      setSystemStatus(status);
    });

    // Position updates
    socket.on('position:update', (position: Position) => {
      updatePosition(position);
    });

    // New trade executed
    socket.on('trade:executed', (trade: TradeHistory) => {
      addTrade(trade);
    });

    // Market data stream
    socket.on('market:data', (data: MarketData) => {
      updateMarketData(data);
    });

    // Error handling
    socket.on('error', (error: { message: string }) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [setSystemStatus, updatePosition, addTrade, updateMarketData, setConnected]);

  return socketRef.current;
};

import React from 'react';
import { useTradeStore } from '../store/tradeStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useRAGMemory } from '../hooks/useRAGMemory';
import { useChat } from '../hooks/useChat';
import { StatusIndicator } from './StatusIndicator';
import { TradeCard } from './TradeCard';
import { ControlPanel } from './ControlPanel';
import { PositionTable } from './PositionTable';
import { PriceChart } from './PriceChart';
import { RiskDashboard } from './RiskDashboard';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RAGMemoryViewer } from './RAGMemoryViewer';
import { ChatInterface } from './ChatInterface';
import { WifiOff, MessageSquare } from 'lucide-react';

/**
 * Dashboard Component
 * Main orchestration component for The Arbiter trading interface
 * Integrates all sub-components with real-time WebSocket data
 */
export const Dashboard: React.FC = () => {
  const socket = useWebSocket();
  const { queryMemory } = useRAGMemory();
  const chat = useChat();
  const { systemStatus, positions, tradeHistory, isConnected } = useTradeStore();
  const [showChat, setShowChat] = React.useState(false);

  const handleStart = () => {
    socket?.emit('control:start');
  };

  const handlePause = () => {
    socket?.emit('control:pause');
  };

  const handleStop = () => {
    socket?.emit('control:stop');
  };

  // Mock chart data - in production, this comes from WebSocket
  const chartData = Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
    price: 45000 + Math.random() * 1000
  }));

  return (
    <div className="min-h-screen bg-background text-neutral-50">
      {/* Header */}
      <header className="bg-surface border-b border-neutral-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">The Arbiter</h1>
            <p className="text-sm text-neutral-400">Autonomous Trading Agent</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Chat Toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showChat 
                  ? 'bg-primary text-white' 
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">
                {showChat ? 'Hide Chat' : 'Chat with AI'}
              </span>
            </button>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm text-success">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-danger" />
                  <span className="text-sm text-danger">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Chat Interface (conditionally shown) */}
        {showChat && (
          <div className="animate-fade-in">
            <ChatInterface
              messages={chat.messages}
              isLoading={chat.isLoading}
              onSendMessage={chat.sendMessage}
            />
          </div>
        )}

        {/* Top Row: Status + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StatusIndicator status={systemStatus} />
          </div>
          <div>
            <ControlPanel
              systemState={systemStatus.state}
              onStart={handleStart}
              onPause={handlePause}
              onStop={handleStop}
            />
          </div>
        </div>

        {/* Risk Dashboard */}
        <RiskDashboard positions={positions} systemStatus={systemStatus} />

        {/* Performance Metrics */}
        <PerformanceMetrics trades={tradeHistory} totalPnL={systemStatus.totalPnL} />

        {/* Price Chart */}
        <PriceChart symbol="BTCUSDT" data={chartData} />

        {/* Active Positions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Positions</h2>
          {positions.length === 0 ? (
            <div className="bg-surface rounded-lg p-8 text-center border border-neutral-800">
              <p className="text-neutral-400">No active positions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((position) => (
                <TradeCard key={position.id} position={position} />
              ))}
            </div>
          )}
        </div>

        {/* RAG Memory Viewer */}
        <RAGMemoryViewer
          currentSymbol="BTCUSDT"
          onQueryMemory={queryMemory}
        />

        {/* Trade History Table */}
        <PositionTable trades={tradeHistory} />
      </main>
    </div>
  );
};

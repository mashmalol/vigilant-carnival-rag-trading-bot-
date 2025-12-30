import React, { useState } from 'react';
import { Play, Pause, Square, Settings } from 'lucide-react';

interface Props {
  systemState: 'OPERATIONAL' | 'PAUSED' | 'TERMINATED';
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

/**
 * ControlPanel Component
 * Provides start/pause/stop controls for the trading agent
 * Implements error prevention: Double-click confirmation for stop
 * Applies Fitts's Law: Large buttons for critical actions
 */
export const ControlPanel: React.FC<Props> = ({ systemState, onStart, onPause, onStop }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStop = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
      return;
    }
    onStop();
    setShowConfirm(false);
  };

  return (
    <div className="bg-surface rounded-lg p-6 border border-neutral-800">
      <h2 className="text-lg font-semibold text-neutral-50 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Control Panel
      </h2>

      <div className="flex gap-3">
        {/* Start Button */}
        <button
          onClick={onStart}
          disabled={systemState === 'OPERATIONAL'}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            systemState === 'OPERATIONAL'
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-success hover:bg-success/80 text-white'
          }`}
        >
          <Play className="w-5 h-5" />
          Start
        </button>

        {/* Pause Button */}
        <button
          onClick={onPause}
          disabled={systemState !== 'OPERATIONAL'}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            systemState !== 'OPERATIONAL'
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-warning hover:bg-warning/80 text-white'
          }`}
        >
          <Pause className="w-5 h-5" />
          Pause
        </button>

        {/* Stop Button (Double-click confirm) */}
        <button
          onClick={handleStop}
          disabled={systemState === 'TERMINATED'}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            systemState === 'TERMINATED'
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : showConfirm
              ? 'bg-danger animate-pulse text-white'
              : 'bg-danger/50 hover:bg-danger/70 text-white'
          }`}
        >
          <Square className="w-5 h-5" />
          {showConfirm ? 'Click Again to Confirm' : 'Stop'}
        </button>
      </div>

      {showConfirm && (
        <p className="text-xs text-danger mt-2 text-center">
          ⚠️ Warning: This will terminate the agent and close all positions
        </p>
      )}
    </div>
  );
};

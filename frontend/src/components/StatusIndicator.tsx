import React from 'react';
import { Activity, AlertCircle, PauseCircle } from 'lucide-react';
import type { SystemStatus } from '../types';

interface Props {
  status: SystemStatus;
}

/**
 * StatusIndicator Component
 * Displays system state, P&L, and kill threshold proximity
 * Applies CRAP principles: Contrast for states, Proximity for related metrics
 */
export const StatusIndicator: React.FC<Props> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status.state) {
      case 'OPERATIONAL':
        return {
          icon: Activity,
          color: 'text-success',
          bgColor: 'bg-success/10',
          label: 'OPERATIONAL',
          pulse: true
        };
      case 'PAUSED':
        return {
          icon: PauseCircle,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: 'PAUSED',
          pulse: false
        };
      case 'TERMINATED':
        return {
          icon: AlertCircle,
          color: 'text-danger',
          bgColor: 'bg-danger/10',
          label: 'TERMINATED',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Calculate kill threshold proximity (visual warning)
  const killProximity = (status.distanceToKill / Math.abs(status.killThreshold)) * 100;
  const isNearKill = killProximity < 33; // Within 33% of kill threshold

  return (
    <div className="bg-surface rounded-lg p-6 border border-neutral-800">
      {/* System State Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <p className="text-sm text-neutral-400">System State</p>
          <p className={`text-lg font-semibold ${config.color}`}>{config.label}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total P&L */}
        <div>
          <p className="text-sm text-neutral-400 mb-1">Total P&L</p>
          <p className={`text-2xl font-bold ${status.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
            {status.totalPnL >= 0 ? '+' : ''}{(status.totalPnL * 100).toFixed(2)}%
          </p>
        </div>

        {/* Active Positions */}
        <div>
          <p className="text-sm text-neutral-400 mb-1">Positions</p>
          <p className="text-2xl font-bold text-neutral-50">
            {status.positionsCount}
          </p>
        </div>

        {/* Kill Threshold Distance */}
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Kill Threshold Distance</p>
            <p className={`text-sm font-medium ${isNearKill ? 'text-danger' : 'text-neutral-50'}`}>
              {(status.distanceToKill * 100).toFixed(2)}%
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isNearKill ? 'bg-danger' : 'bg-success'
              }`}
              style={{ width: `${Math.min(killProximity, 100)}%` }}
            />
          </div>
          
          {isNearKill && (
            <p className="text-xs text-danger mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Warning: Approaching kill threshold
            </p>
          )}
        </div>

        {/* Uptime */}
        <div className="col-span-2">
          <p className="text-sm text-neutral-400 mb-1">Uptime</p>
          <p className="text-lg font-mono text-neutral-50">
            {formatUptime(status.uptime)}
          </p>
        </div>
      </div>
    </div>
  );
};

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

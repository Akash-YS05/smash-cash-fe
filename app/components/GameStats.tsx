// components/GameStats.tsx
'use client';

import React from 'react';
import { Users, Target, Zap, Clock } from 'lucide-react';
import { GameState, Player } from '../types/game';

interface GameStatsProps {
  gameState: GameState | null;
  playerStats: Player | null;
  isLoading?: boolean;
}

export const GameStats: React.FC<GameStatsProps> = ({ 
  gameState, 
  playerStats, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <div className="animate-pulse">
              <div className="w-6 h-6 bg-purple-400/30 rounded mb-2"></div>
              <div className="h-4 bg-purple-400/20 rounded mb-1 w-3/4"></div>
              <div className="h-6 bg-purple-400/30 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: Target,
      label: 'High Score',
      value: playerStats?.highScore ?? 0,
      color: 'text-green-400'
    },
    {
      icon: Zap,
      label: 'Total Games',
      value: playerStats?.totalGames ?? 0,
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      label: 'All Players',
      value: gameState?.totalPlayers ?? '-',
      color: 'text-blue-400'
    },
    {
      icon: Clock,
      label: 'Last Played',
      value: playerStats?.lastPlayed
        ? new Date(playerStats.lastPlayed * 1000).toLocaleDateString()
        : 'Never',
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
          >
            <div className="flex items-center space-x-2 mb-2">
              <IconComponent className={`w-5 h-5 ${stat.color}`} />
              <span className="text-gray-300 text-sm font-medium">
                {stat.label}
              </span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

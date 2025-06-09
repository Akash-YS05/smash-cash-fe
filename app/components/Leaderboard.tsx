'use client';

import React from 'react';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayer?: string;
  isLoading?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  entries, 
  currentPlayer,
  isLoading = false 
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-purple-300 font-bold text-sm">#{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'from-amber-500/20 to-amber-600/20 border-amber-500/30';
      default:
        return 'from-purple-500/10 to-pink-500/10 border-purple-500/20';
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'Unknown';
    if (address.length <= 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Leaderboard</h2>
          </div>
          
          {/* Loading skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 mb-2 bg-gray-500/20 rounded-lg animate-pulse">
              <div className="w-6 h-6 bg-gray-500/40 rounded" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-500/40 rounded mb-1" />
                <div className="w-16 h-3 bg-gray-500/40 rounded" />
              </div>
              <div className="w-12 h-4 bg-gray-500/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        </div>
        
        <div className="space-y-2">
          {entries.map((entry) => {
            const isCurrentPlayer = entry.player === currentPlayer;
            
            return (
              <div
                key={entry.rank}
                className={`
                  flex items-center gap-4 p-3 rounded-lg border transition-all duration-200
                  bg-gradient-to-r ${getRankColor(entry.rank)}
                  ${isCurrentPlayer ? 'ring-2 ring-purple-400 bg-purple-500/20' : ''}
                  hover:bg-white/5
                `}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>
                
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isCurrentPlayer ? 'text-purple-200' : 'text-white'}`}>
                    {isCurrentPlayer ? 'You' : truncateAddress(entry.player)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {entry.games} games played
                  </div>
                </div>
                
                {/* Score */}
                <div className="text-right">
                  <div className="font-bold text-white text-lg">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    high score
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No players yet!</p>
            <p className="text-sm">Be the first to set a score</p>
          </div>
        )}
      </div>
    </div>
  );
};
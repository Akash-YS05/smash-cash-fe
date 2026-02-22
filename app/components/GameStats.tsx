"use client"
import { Trophy, Target, Star, TrendingUp } from "lucide-react"
import type { Player } from "../types/game"

interface GameStatsProps {
  gameState: any
  playerStats: Player | null
  isLoading: boolean
}

export function GameStats({ gameState, playerStats, isLoading }: GameStatsProps) {
  if (isLoading) {
    return (
      <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/60 p-8 w-full max-w-sm">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-700 rounded"></div>
          <div className="space-y-4">
            <div className="h-20 bg-neutral-700 rounded"></div>
            <div className="h-20 bg-neutral-700 rounded"></div>
            <div className="h-20 bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/60 p-10 w-full max-w-sm">
      <div className="text-center mb-10">
        <h2 className="text-xl font-light text-white tracking-tight">Your Stats</h2>
        <div className="w-12 h-px bg-neutral-700 mt-3 mx-auto"></div>
      </div>

      <div className="space-y-4">
        {/* High Score */}
        <div className="bg-neutral-800/30 border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-xs font-light uppercase tracking-wide">High Score</span>
            <Trophy className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-4xl font-light text-white font-mono">{playerStats?.highScore || 0}</div>
        </div>

        {/* Total Games */}
        <div className="bg-neutral-800/30 border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-xs font-light uppercase tracking-wide">Total Games</span>
            <Target className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-4xl font-light text-white font-mono">{playerStats?.totalGames || 0}</div>
        </div>

        {/* Last Played */}
        <div className="bg-neutral-800/30 border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-xs font-light uppercase tracking-wide">Last Played</span>
            <TrendingUp className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-lg font-light text-neutral-300">{playerStats?.lastPlayed || "—"}</div>
        </div>

        {/* Wallet */}
        <div className="bg-neutral-800/30 border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-xs font-light uppercase tracking-wide">Wallet</span>
            <Star className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-xs font-mono text-neutral-400 break-all">
            {playerStats?.wallet
              ? `${playerStats.wallet.slice(0, 8)}...${playerStats.wallet.slice(-6)}`
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  )
}

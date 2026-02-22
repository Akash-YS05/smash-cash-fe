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
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 shadow-2xl w-full max-w-sm">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-20 bg-slate-700 rounded-lg"></div>
            <div className="h-20 bg-slate-700 rounded-lg"></div>
            <div className="h-20 bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 shadow-2xl w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Star className="w-6 h-6 text-amber-400 mr-2 fill-amber-400" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Your Stats</h2>
          <Star className="w-6 h-6 text-amber-400 ml-2 fill-amber-400" />
        </div>
      </div>

      <div className="space-y-5">
        {/* High Score */}
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-950/30 rounded-lg p-6 border border-amber-600/40 hover:border-amber-500/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Trophy className="w-5 h-5 text-amber-400 mr-2" />
              <span className="text-amber-100 font-semibold text-sm uppercase tracking-wide">High Score</span>
            </div>
          </div>
          <div className="text-4xl font-black text-amber-200 font-mono">{playerStats?.highScore || 0}</div>
        </div>

        {/* Total Games */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 rounded-lg p-6 border border-emerald-600/40 hover:border-emerald-500/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-emerald-400 mr-2" />
              <span className="text-emerald-100 font-semibold text-sm uppercase tracking-wide">Total Games</span>
            </div>
          </div>
          <div className="text-4xl font-black text-emerald-200 font-mono">{playerStats?.totalGames || 0}</div>
        </div>

        {/* Last Played */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-lg p-6 border border-blue-600/40 hover:border-blue-500/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-blue-100 font-semibold text-sm uppercase tracking-wide">Last Played</span>
            </div>
          </div>
          <div className="text-2xl font-black text-blue-200">{playerStats?.lastPlayed || "—"}</div>
        </div>

        {/* Wallet */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 rounded-lg p-6 border border-purple-600/40 hover:border-purple-500/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-100 font-semibold text-sm uppercase tracking-wide">Wallet</span>
            </div>
          </div>
          <div className="text-sm font-mono text-purple-200 break-all">
            {playerStats?.wallet
              ? `${playerStats.wallet.slice(0, 8)}...${playerStats.wallet.slice(-6)}`
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  )
}

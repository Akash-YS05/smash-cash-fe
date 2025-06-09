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
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 shadow-2xl w-full max-w-sm">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-600 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-600 rounded-xl"></div>
            <div className="h-16 bg-gray-600 rounded-xl"></div>
            <div className="h-16 bg-gray-600 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 shadow-2xl w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-yellow-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Your Stats</h2>
          <Star className="w-8 h-8 text-yellow-400 ml-2" />
        </div>
      </div>

      <div className="space-y-6">
        {/* High Score */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-yellow-200 font-semibold">High Score</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white">{playerStats?.highScore || 0}</div>
        </div>

        {/* Current Rank */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-400/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Target className="w-6 h-6 text-emerald-400 mr-2" />
              <span className="text-emerald-200 font-semibold">Total Games</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white">#{playerStats?.totalGames || "total games here"}</div>
        </div>

        {/* Games Played */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-400/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-cyan-400 mr-2" />
              <span className="text-cyan-200 font-semibold">Last Played</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white">{playerStats?.lastPlayed || "last played here"}</div>
        </div>

        {/* Level */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Star className="w-6 h-6 text-purple-400 mr-2" />
              <span className="text-purple-200 font-semibold">Wallet</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white">
  {playerStats?.wallet
    ? `${playerStats.wallet.slice(0, 3)}...${playerStats.wallet.slice(-3)}`
    : "N/A"}
</div>
        </div>
      </div>
    </div>
  )
}

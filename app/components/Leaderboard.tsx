"use client"
import { Crown, Trophy, Medal, Star } from "lucide-react"
import type { LeaderboardEntry } from "../types/game"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentPlayer?: string
  isLoading: boolean
}

export function Leaderboard({ entries, currentPlayer, isLoading }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Trophy className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number, isCurrentPlayer: boolean) => {
    const baseStyle = "flex items-center justify-between p-4 rounded-xl transition-all duration-300 "

    if (isCurrentPlayer) {
      return baseStyle + "bg-emerald-500/30 border-2 border-emerald-400/50 shadow-lg transform scale-105"
    }

    switch (rank) {
      case 1:
        return baseStyle + "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
      case 2:
        return baseStyle + "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30"
      case 3:
        return baseStyle + "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30"
      default:
        return baseStyle + "bg-black/30 border border-gray-600/30 hover:bg-black/40"
    }
  }

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 shadow-2xl w-full max-w-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-600 rounded-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-600 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 shadow-2xl w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-yellow-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          <Trophy className="w-8 h-8 text-yellow-400 ml-2" />
        </div>
        <p className="text-gray-400">Top Smashers</p>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No players yet!</p>
            <p className="text-gray-500 text-sm">Be the first to smash!</p>
          </div>
        ) : (
          entries.map((entry) => {
            const isCurrentPlayer = entry.player === currentPlayer

            return (
              <div key={entry.player} className={getRankStyle(entry.rank, isCurrentPlayer)}>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{getRankIcon(entry.rank)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`font-semibold truncate ${isCurrentPlayer ? "text-emerald-200" : "text-white"}`}>
                        {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                      </p>
                      {isCurrentPlayer && (
                        <span className="text-xs bg-emerald-400 text-emerald-900 px-2 py-1 rounded-full font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{entry.games} games played</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${isCurrentPlayer ? "text-emerald-200" : "text-white"}`}>
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {entries.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-600/30">
          <p className="text-center text-gray-400 text-sm">Keep smashing to climb higher! 🚀</p>
        </div>
      )}
    </div>
  )
}

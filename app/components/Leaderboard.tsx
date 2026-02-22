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
    const baseStyle = "flex items-center justify-between p-4 rounded-lg transition-all duration-300 "

    if (isCurrentPlayer) {
      return baseStyle + "bg-purple-700/40 border-2 border-purple-400/60 shadow-lg shadow-purple-500/20 transform scale-105"
    }

    switch (rank) {
      case 1:
        return baseStyle + "bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border border-amber-600/40 hover:border-amber-500/60"
      case 2:
        return baseStyle + "bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600/40 hover:border-slate-500/60"
      case 3:
        return baseStyle + "bg-gradient-to-r from-orange-900/40 to-amber-900/40 border border-orange-600/40 hover:border-orange-500/60"
      default:
        return baseStyle + "bg-slate-800/30 border border-slate-700/40 hover:bg-slate-800/50 hover:border-slate-600/60"
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 shadow-2xl w-full max-w-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 shadow-2xl w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-6 h-6 text-amber-400 mr-2" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h2>
          <Trophy className="w-6 h-6 text-amber-400 ml-2" />
        </div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Top Smashers</p>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-slate-600 mx-auto mb-4 fill-slate-600" />
            <p className="text-slate-400 font-medium">No players yet</p>
            <p className="text-slate-500 text-sm">Be the first to smash!</p>
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
                      <p className={`font-semibold truncate text-sm ${isCurrentPlayer ? "text-purple-200" : "text-slate-100"}`}>
                        {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                      </p>
                      {isCurrentPlayer && (
                        <span className="text-xs bg-purple-500 text-slate-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{entry.games} games</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black font-mono ${isCurrentPlayer ? "text-purple-200" : "text-slate-100"}`}>
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {entries.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700/40">
          <p className="text-center text-slate-400 text-sm font-medium">Keep smashing to climb higher! 🚀</p>
        </div>
      )}
    </div>
  )
}

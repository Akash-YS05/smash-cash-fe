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
    const baseStyle = "flex items-center justify-between p-4 transition-all duration-300 "

    if (isCurrentPlayer) {
      return baseStyle + "bg-neutral-700/30 border border-neutral-600/60 transform scale-105"
    }

    switch (rank) {
      case 1:
        return baseStyle + "bg-neutral-800/40 border border-neutral-700/40 hover:border-neutral-600/60"
      case 2:
        return baseStyle + "bg-neutral-800/30 border border-neutral-700/40 hover:border-neutral-600/60"
      case 3:
        return baseStyle + "bg-neutral-800/30 border border-neutral-700/40 hover:border-neutral-600/60"
      default:
        return baseStyle + "bg-neutral-800/20 border border-neutral-700/30 hover:bg-neutral-800/30 hover:border-neutral-600/50"
    }
  }

  if (isLoading) {
    return (
      <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/60 p-8 w-full max-w-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-700 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/60 p-10 w-full max-w-sm">
      <div className="text-center mb-10">
        <h2 className="text-xl font-light text-white tracking-tight">Leaderboard</h2>
        <div className="w-12 h-px bg-neutral-700 mt-3 mx-auto"></div>
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-400 font-light">No players yet</p>
            <p className="text-neutral-500 text-xs font-light">Be the first to smash!</p>
          </div>
        ) : (
          entries.map((entry) => {
            const isCurrentPlayer = entry.player === currentPlayer

            return (
              <div key={entry.player} className={getRankStyle(entry.rank, isCurrentPlayer)}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">{getRankIcon(entry.rank)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`font-light truncate text-sm ${isCurrentPlayer ? "text-neutral-200" : "text-neutral-300"}`}>
                        {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                      </p>
                      {isCurrentPlayer && (
                        <span className="text-xs bg-neutral-700 text-neutral-100 px-2 py-0.5 font-light uppercase tracking-widest">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-500 text-xs mt-1 font-light">{entry.games}g</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-light font-mono ${isCurrentPlayer ? "text-neutral-200" : "text-neutral-300"}`}>
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {entries.length > 0 && (
        <div className="mt-8 pt-6 border-t border-neutral-700/40">
          <p className="text-center text-neutral-500 text-xs font-light">Keep climbing the ranks</p>
        </div>
      )}
    </div>
  )
}

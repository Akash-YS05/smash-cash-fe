"use client"

import { useState, useEffect, useCallback } from "react"
import { Wallet, User, AlertCircle, CheckCircle, Loader, Play, Pause, RotateCcw, Zap, Star, Crown } from "lucide-react"
import { useGameContract } from "./hooks/useGameContract"
import { GameStats } from "./components/GameStats"
import { Leaderboard } from "./components/Leaderboard"
import { TapButton } from "./components/TapButton"
import type { Player, LeaderboardEntry, GameSessionState } from "./types/game"
import { usePrivy } from "@privy-io/react-auth"
import { anchorService } from "./lib/anchor"


export default function HomePage() {
  const { user, authenticated, ready, login, logout } = usePrivy()
  const {
    gameState,
    playerData,
    loading,
    error,
    isConnected,
    createPlayer,
    submitScore,
    fetchGameState,
    fetchPlayerData,
    setupGame,
    checkPlayerExists,
    clearError,
  } = useGameContract()

  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  const [playerExists, setPlayerExists] = useState(false)
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)

  // Game session state
  const [gameSession, setGameSession] = useState<GameSessionState>({
    isPlaying: false,
    score: 0,
    timeLeft: 30,
    gameStarted: false,
    gameEnded: false,
  })

  // Enhanced player stats for display
  const [displayPlayerStats, setDisplayPlayerStats] = useState<Player | null>(null)

  // Check if player exists on wallet connection
  useEffect(() => {
    const checkPlayer = async () => {
      if (isConnected && authenticated) {
        const exists = await checkPlayerExists()
        setPlayerExists(exists)
        if (exists) {
          await fetchPlayerData()
        }
      }
    }

    checkPlayer()
  }, [isConnected, authenticated, checkPlayerExists, fetchPlayerData])

  // Update display player stats
  useEffect(() => {
    if (playerData) {
      setDisplayPlayerStats({
        ...playerData,
                  //@ts-ignore

        score: Math.max(playerData.highScore, gameSession.score),
        level: Math.floor(playerData.highScore / 1000) + 1,
        gamesPlayed: playerData.totalGames,
                  //@ts-ignore

        lastPlayed: playerData.lastPlayed ? new Date(playerData.lastPlayed * 1000).toLocaleDateString() : "Never",
        rank: 1, // Will be updated when leaderboard is generated
      })
    }
  }, [playerData, gameSession.score])

  // Generate leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!gameState || !isConnected) return

      try {
        const players = await anchorService.getAllPlayers()

        const sorted = players
          .sort((a, b) => b.highScore - a.highScore)
          .slice(0, 10)
          .map((player, index) => ({
            rank: index + 1,
            player: player.wallet,
            score: player.highScore,
            games: player.totalGames,
          }))

        setLeaderboardEntries(sorted)

        const current = sorted.find((entry) => entry.player === playerData?.wallet)
        if (current && displayPlayerStats) {
          setDisplayPlayerStats((prev) => (prev ? { ...prev, rank: current.rank } : null))
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error)
      }
    }

    fetchLeaderboard()
  }, [gameState, isConnected, playerData?.wallet])

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (gameSession.isPlaying && gameSession.timeLeft > 0) {
      interval = setInterval(() => {
        //@ts-ignore
        setGameSession((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }))
      }, 1000)
    } else if (gameSession.timeLeft === 0 && gameSession.isPlaying) {
      handleGameEnd()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameSession.isPlaying, gameSession.timeLeft])

  // Handle player creation
  const handleCreatePlayer = async () => {
    setIsCreatingPlayer(true)
    try {
      await createPlayer()
      setPlayerExists(true)
      setNotification({
        type: "success",
        message: "Player account created successfully!",
      })
      await fetchPlayerData()
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || "Failed to create player account",
      })
    } finally {
      setIsCreatingPlayer(false)
    }
  }

  // Handle game start
  const handleGameStart = () => {
    setGameSession({
      isPlaying: true,
      score: 0,
      timeLeft: 30,
      gameStarted: true,
      gameEnded: false,
    })
  }

  // Handle game end
  const handleGameEnd = async () => {
    //@ts-ignore
    setGameSession((prev) => ({
      ...prev,
      isPlaying: false,
      gameEnded: true,
    }))

    // Submit score if player exists and score > 0
    if (playerExists && gameSession.score > 0) {
      try {
        const success = await submitScore(gameSession.score)
        if (success) {
          setNotification({
            type: "success",
            message: `Score ${gameSession.score} submitted successfully!`,
          })
          await fetchPlayerData()
          await fetchGameState()
        } else {
          setNotification({
            type: "error",
            message: "Failed to submit score to blockchain",
          })
        }
      } catch (error) {
        console.error("Score submission error:", error)
        setNotification({
          type: "error",
          message: "Error submitting score",
        })
      }
    }
  }

  // Handle tap
  const handleTap = useCallback(() => {
    if (gameSession.isPlaying) {
      //@ts-ignore
      setGameSession((prev) => ({
        ...prev,
        score: prev.score + 1,
      }))
    }
  }, [gameSession.isPlaying])

  // Handle game reset
  const handleGameReset = () => {
    setGameSession({
      isPlaying: false,
      score: 0,
      timeLeft: 30,
      gameStarted: false,
      gameEnded: false,
    })
  }

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-6"></div>
            <Zap className="w-8 h-8 text-emerald-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-xl font-semibold">Loading Smash Cash...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-800/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Premium notification */}
      {notification && (
        <div
          className={`
          fixed top-6 right-6 z-50 p-5 rounded-lg border backdrop-blur-xl shadow-2xl transform transition-all duration-300 animate-in slide-in-from-right-5 font-medium
          ${
            notification.type === "success"
              ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
              : notification.type === "error"
                ? "bg-red-900/40 border-red-500/50 text-red-100"
                : "bg-blue-900/40 border-blue-500/50 text-blue-100"
          }
        `}
        >
          <div className="flex items-center space-x-3">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-300 drop-shadow-2xl">
                SMASH CASH
              </h1>
              <div className="absolute -top-3 -right-3">
                <Zap className="w-7 h-7 text-amber-300 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 mb-10">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <p className="text-sm tracking-widest text-slate-300 font-semibold uppercase">On-Chain Leaderboard • Tap Fast • Earn Big</p>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>

          {/* Wallet Connection */}
          {!authenticated ? (
            <div className="space-y-4">
              <button
                onClick={login}
                className="group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-600/40"
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-base font-semibold">Connect Wallet to Play</span>
                </div>
              </button>
              <p className="text-slate-400 text-sm font-medium">Connect your wallet to start smashing and earning rewards!</p>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-md rounded-lg px-6 py-3 border border-slate-700/50">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <User className="w-5 h-5 text-slate-300" />
                <span className="text-slate-100 font-medium text-sm">
                  {user?.wallet?.address
                    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                    : "Connected"}
                </span>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium">
                Disconnect
              </button>
            </div>
          )}
        </div>

        {authenticated && (
          <>
            {/* Player Creation */}
            {!playerExists && (
              <div className="text-center mb-16">
                <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl p-12 border border-slate-700/50 max-w-lg mx-auto shadow-2xl">
                  <div className="mb-8">
                    <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Join the Game</h3>
                    <p className="text-slate-300 text-base leading-relaxed">
                      Create your on-chain player account to start smashing, tracking scores, and climbing the
                      leaderboard!
                    </p>
                  </div>
                  <button
                    onClick={handleCreatePlayer}
                    disabled={isCreatingPlayer}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/25"
                  >
                    {isCreatingPlayer ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <Zap className="w-5 h-5" />
                        <span>Create Player Account</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Game Area */}
            {playerExists && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
                {/* Game Stats */}
                <div className="flex justify-center xl:justify-start">
                  <GameStats gameState={gameState} playerStats={displayPlayerStats} isLoading={loading} />
                </div>

                {/* Game Play Area */}
                <div className="flex flex-col items-center space-y-8">
                  {/* Timer */}
                  {(gameSession.isPlaying || gameSession.gameStarted) && (
                    <div className="bg-slate-800/60 backdrop-blur-xl rounded-lg p-8 border border-slate-700/50 shadow-2xl">
                      <div className="text-center">
                        <div
                          className={`text-6xl font-black mb-2 transition-colors duration-300 font-mono tracking-tight ${
                            gameSession.timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-amber-100"
                          }`}
                        >
                          {gameSession.timeLeft}
                        </div>
                        <div className="text-slate-300 text-sm font-semibold uppercase tracking-widest">Seconds Left</div>
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-4">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${(gameSession.timeLeft / 30) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Score Display */}
                  {gameSession.isPlaying && (
                    <div className="bg-gradient-to-br from-purple-900/40 to-slate-800/40 backdrop-blur-xl rounded-lg p-8 border border-purple-500/30 shadow-2xl">
                      <div className="text-center">
                        <div className="text-slate-300 text-xs font-semibold uppercase tracking-widest mb-2">Current Score</div>
                        <div className="text-5xl font-black text-amber-200 font-mono">{gameSession.score}</div>
                      </div>
                    </div>
                  )}

                  {/* Tap Button */}
                  <TapButton
                    onTap={handleTap}
                    disabled={!gameSession.isPlaying}
                    score={gameSession.score}
                    isPlaying={gameSession.isPlaying}
                  />

                  {/* Game Controls */}
                  <div className="flex flex-wrap justify-center gap-4">
                    {!gameSession.gameStarted && (
                      <button
                        onClick={handleGameStart}
                        className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/30"
                      >
                        <div className="flex items-center space-x-2">
                          <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="font-semibold">Start Smashing</span>
                        </div>
                      </button>
                    )}

                    {gameSession.isPlaying && (
                      <button
                        onClick={handleGameEnd}
                        className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-600/30"
                      >
                        <div className="flex items-center space-x-2">
                          <Pause className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="font-semibold">End Game</span>
                        </div>
                      </button>
                    )}

                    {gameSession.gameEnded && (
                      <button
                        onClick={handleGameReset}
                        className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/30"
                      >
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="w-5 h-5 group-hover:animate-spin" />
                          <span className="font-semibold">Smash Again</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Game Result */}
                  {gameSession.gameEnded && (
                    <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl p-10 border border-slate-700/50 text-center shadow-2xl max-w-md">
                      <div className="mb-6">
                        {gameSession.score > (displayPlayerStats?.highScore || 0) ? (
                          <div className="text-7xl mb-3 animate-bounce">🎉</div>
                        ) : (
                          <div className="text-7xl mb-3">💪</div>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">Game Over</h3>
                      <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 mb-6 font-mono">
                        {gameSession.score}
                      </div>
                      <p className="text-slate-300 text-base leading-relaxed font-medium">
                        {gameSession.score > (displayPlayerStats?.highScore || 0)
                          ? "New High Score! You're on fire! 🔥"
                          : "Great smashing! Try again to beat your record!"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Leaderboard */}
                <div className="flex justify-center xl:justify-end">
                  <Leaderboard
                    entries={leaderboardEntries}
                    currentPlayer={displayPlayerStats?.wallet}
                    isLoading={loading}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-6 left-6 bg-red-500/20 border border-red-400/40 text-red-200 p-4 rounded-xl backdrop-blur-lg shadow-2xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <span className="font-semibold">{error}</span>
              <button onClick={clearError} className="ml-2 text-red-300 hover:text-white transition-colors text-xl">
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

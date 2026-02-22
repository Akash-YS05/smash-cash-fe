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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle luxury background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-96 -right-96 w-[800px] h-[800px] bg-neutral-800/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-96 -left-96 w-[800px] h-[800px] bg-neutral-700/5 rounded-full blur-3xl"></div>
      </div>

      {/* Refined notification */}
      {notification && (
        <div
          className={`
          fixed top-8 right-8 z-50 px-6 py-4 rounded-sm border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-5 text-sm font-light
          ${
            notification.type === "success"
              ? "bg-neutral-900/60 border-neutral-700/80 text-neutral-100"
              : notification.type === "error"
                ? "bg-neutral-900/60 border-neutral-700/80 text-neutral-100"
                : "bg-neutral-900/60 border-neutral-700/80 text-neutral-100"
          }
        `}
        >
          <div className="flex items-center space-x-3">
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="mb-12">
            <h1 className="text-7xl md:text-8xl font-light tracking-tight text-white mb-2">
              SMASH CASH
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-neutral-600 to-transparent mx-auto"></div>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-12">
            <div className="w-1 h-1 bg-neutral-500 rounded-full"></div>
            <p className="text-xs tracking-widest text-neutral-400 uppercase font-light">On-Chain Leaderboard • Tap Fast • Earn Big</p>
            <div className="w-1 h-1 bg-neutral-500 rounded-full"></div>
          </div>

          {/* Wallet Connection */}
          {!authenticated ? (
            <div className="space-y-6">
              <button
                onClick={login}
                className="group relative bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 hover:border-neutral-500 px-8 py-3 transition-all duration-300 text-sm font-light tracking-wide uppercase"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Wallet className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Connect Wallet</span>
                </div>
              </button>
              <p className="text-neutral-500 text-xs font-light tracking-widest uppercase">Start playing to earn rewards</p>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-3 bg-neutral-900/80 backdrop-blur-md px-5 py-3 border border-neutral-700/50">
                <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></div>
                <User className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-300 font-light text-xs">
                  {user?.wallet?.address
                    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                    : "Connected"}
                </span>
              </div>
              <button onClick={logout} className="text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-light uppercase tracking-widest">
                Disconnect
              </button>
            </div>
          )}
        </div>

        {authenticated && (
          <>
            {/* Player Creation */}
            {!playerExists && (
              <div className="text-center mb-20">
                <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/60 max-w-lg mx-auto p-16">
                  <div className="mb-12">
                    <Crown className="w-12 h-12 text-neutral-600 mx-auto mb-8" />
                    <h3 className="text-2xl font-light text-white mb-4 tracking-tight">Join the Game</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed font-light">
                      Create your on-chain player account to start smashing, tracking scores, and climbing the leaderboard.
                    </p>
                  </div>
                  <button
                    onClick={handleCreatePlayer}
                    disabled={isCreatingPlayer}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white py-3 px-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light tracking-wide uppercase"
                  >
                    {isCreatingPlayer ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Creating Account</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Create Account</span>
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
                <div className="flex flex-col items-center space-y-12">
                  {/* Timer */}
                  {(gameSession.isPlaying || gameSession.gameStarted) && (
                    <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/50 p-12">
                      <div className="text-center">
                        <div
                          className={`text-7xl font-light mb-4 transition-colors duration-300 font-mono tracking-tight ${
                            gameSession.timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white"
                          }`}
                        >
                          {gameSession.timeLeft}
                        </div>
                        <div className="text-neutral-500 text-xs font-light uppercase tracking-widest">Seconds Left</div>
                        <div className="w-64 h-px bg-neutral-800 mt-6"></div>
                      </div>
                    </div>
                  )}

                  {/* Current Score Display */}
                  {gameSession.isPlaying && (
                    <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/50 p-12">
                      <div className="text-center">
                        <div className="text-neutral-500 text-xs font-light uppercase tracking-widest mb-4">Score</div>
                        <div className="text-6xl font-light text-white font-mono">{gameSession.score}</div>
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
                  <div className="flex flex-wrap justify-center gap-6">
                    {!gameSession.gameStarted && (
                      <button
                        onClick={handleGameStart}
                        className="group bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white py-3 px-8 transition-all duration-300 text-sm font-light tracking-wide uppercase"
                      >
                        <div className="flex items-center space-x-2">
                          <Play className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          <span>Start Game</span>
                        </div>
                      </button>
                    )}

                    {gameSession.isPlaying && (
                      <button
                        onClick={handleGameEnd}
                        className="group bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white py-3 px-8 transition-all duration-300 text-sm font-light tracking-wide uppercase"
                      >
                        <div className="flex items-center space-x-2">
                          <Pause className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                          <span>End Game</span>
                        </div>
                      </button>
                    )}

                    {gameSession.gameEnded && (
                      <button
                        onClick={handleGameReset}
                        className="group bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white py-3 px-8 transition-all duration-300 text-sm font-light tracking-wide uppercase"
                      >
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                          <span>Play Again</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Game Result */}
                  {gameSession.gameEnded && (
                    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/60 p-16 text-center max-w-md">
                      <div className="mb-8">
                        {gameSession.score > (displayPlayerStats?.highScore || 0) ? (
                          <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        ) : (
                          <div className="text-6xl mb-4">💪</div>
                        )}
                      </div>
                      <h3 className="text-2xl font-light text-white mb-8 tracking-tight">Game Over</h3>
                      <div className="text-7xl font-light text-white mb-8 font-mono">
                        {gameSession.score}
                      </div>
                      <p className="text-neutral-400 text-sm leading-relaxed font-light">
                        {gameSession.score > (displayPlayerStats?.highScore || 0)
                          ? "New High Score! You're on fire!"
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

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`
          fixed top-6 right-6 z-50 p-4 rounded-xl border backdrop-blur-lg shadow-2xl transform transition-all duration-300 animate-in slide-in-from-right-5
          ${
            notification.type === "success"
              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
              : notification.type === "error"
                ? "bg-red-500/20 border-red-400/40 text-red-200"
                : "bg-cyan-500/20 border-cyan-400/40 text-cyan-200"
          }
        `}
        >
          <div className="flex items-center space-x-3">
            {notification.type === "success" ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <span className="font-semibold text-lg">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-2xl">
                SMASH CASH
              </h1>
              <div className="absolute -top-2 -right-2">
                <Zap className="w-8 h-8 text-yellow-400 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-8">
            <Star className="w-5 h-5 text-yellow-400" />
            <p className="text-xl text-gray-200 font-medium">On-Chain Leaderboard • Tap Fast • Earn Big</p>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>

          {/* Wallet Connection */}
          {!authenticated ? (
            <div className="space-y-4">
              <button
                onClick={login}
                className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25"
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="w-6 h-6 group-hover:animate-pulse" />
                  <span className="text-lg">Connect Wallet to Play</span>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </button>
              <p className="text-gray-400 text-sm">Connect your wallet to start smashing and earning!</p>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-3 border border-emerald-500/30">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <User className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-semibold text-lg">
                  {user?.wallet?.address
                    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                    : "Connected"}
                </span>
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-white transition-colors font-medium">
                Disconnect
              </button>
              {/* <WalletStatus />
              <PrivyWalletDebug /> */}
            </div>
          )}
        </div>

        {authenticated && (
          <>
            {/* Player Creation */}
            {!playerExists && (
              <div className="text-center mb-12">
                <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-10 border border-emerald-500/30 max-w-lg mx-auto shadow-2xl">
                  <div className="mb-6">
                    <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-white mb-4">Join the Game!</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Create your on-chain player account to start smashing, tracking scores, and climbing the
                      leaderboard!
                    </p>
                  </div>
                  <button
                    onClick={handleCreatePlayer}
                    disabled={isCreatingPlayer}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {isCreatingPlayer ? (
                      <div className="flex items-center space-x-3">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span className="text-lg">Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5" />
                        <span className="text-lg">Create Player Account</span>
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
                    <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 shadow-2xl">
                      <div className="text-center">
                        <div
                          className={`text-5xl font-black mb-2 transition-colors duration-300 ${
                            gameSession.timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-white"
                          }`}
                        >
                          {gameSession.timeLeft}
                        </div>
                        <div className="text-emerald-300 text-lg font-semibold">seconds left</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                          <div
                            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(gameSession.timeLeft / 30) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Score Display */}
                  {gameSession.isPlaying && (
                    <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400/40 shadow-2xl">
                      <div className="text-center">
                        <div className="text-emerald-300 text-lg font-semibold mb-1">Current Score</div>
                        <div className="text-4xl font-black text-white">{gameSession.score}</div>
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
                        className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25"
                      >
                        <div className="flex items-center space-x-3">
                          <Play className="w-6 h-6 group-hover:animate-pulse" />
                          <span className="text-lg">Start Smashing!</span>
                        </div>
                      </button>
                    )}

                    {gameSession.isPlaying && (
                      <button
                        onClick={handleGameEnd}
                        className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-red-500/25"
                      >
                        <div className="flex items-center space-x-3">
                          <Pause className="w-6 h-6 group-hover:animate-pulse" />
                          <span className="text-lg">End Game</span>
                        </div>
                      </button>
                    )}

                    {gameSession.gameEnded && (
                      <button
                        onClick={handleGameReset}
                        className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-cyan-500/25"
                      >
                        <div className="flex items-center space-x-3">
                          <RotateCcw className="w-6 h-6 group-hover:animate-spin" />
                          <span className="text-lg">Smash Again!</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Game Result */}
                  {gameSession.gameEnded && (
                    <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 text-center shadow-2xl max-w-md">
                      <div className="mb-4">
                        {gameSession.score > (displayPlayerStats?.highScore || 0) ? (
                          <div className="text-6xl mb-2">🎉</div>
                        ) : (
                          <div className="text-6xl mb-2">💪</div>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">Game Over!</h3>
                      <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
                        {gameSession.score}
                      </div>
                      <p className="text-gray-300 text-lg leading-relaxed">
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

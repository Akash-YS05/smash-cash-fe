// app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, User, Trophy, AlertCircle, CheckCircle, Loader, Play, Pause, RotateCcw } from 'lucide-react';
import { useGameContract } from './hooks/useGameContract';
import { GameStats } from './components/GameStats';
import { Leaderboard } from './components/Leaderboard';
import { TapButton } from './components/TapButton';
import { Player, LeaderboardEntry, GameSessionState } from './types/game';
import { usePrivy } from '@privy-io/react-auth';
import { anchorService } from './lib/anchor';
import { WalletStatus } from './components/WalletStatus';
import { PrivyWalletDebug } from './components/PrivyDebug';

export default function HomePage() {
  const { user, authenticated, ready, login, logout } = usePrivy();
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
    checkPlayerExists,
    clearError
  } = useGameContract();

  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [playerExists, setPlayerExists] = useState(false);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  // Game session state
  const [gameSession, setGameSession] = useState<GameSessionState>({
    isPlaying: false,
    score: 0,
    timeLeft: 30,
    gameStarted: false,
    gameEnded: false
  });

  // Enhanced player stats for display
  const [displayPlayerStats, setDisplayPlayerStats] = useState<Player | null>(null);

  // Check if player exists on wallet connection
  useEffect(() => {
    const checkPlayer = async () => {
      if (isConnected && authenticated) {
        const exists = await checkPlayerExists();
        setPlayerExists(exists);
        if (exists) {
          await fetchPlayerData();
        }
      }
    };

    checkPlayer();
  }, [isConnected, authenticated, checkPlayerExists, fetchPlayerData]);

  // Update display player stats
  useEffect(() => {
    if (playerData) {
      setDisplayPlayerStats({
        ...playerData,
        score: Math.max(playerData.highScore, gameSession.score),
        level: Math.floor(playerData.highScore / 1000) + 1,
        gamesPlayed: playerData.totalGames,
        //@ts-ignore
        lastPlayed: new Date(playerData.lastPlayed * 1000),
        rank: 1 // Will be updated when leaderboard is generated
      });
    }
  }, [playerData, gameSession.score]);

  // Generate leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!gameState || !isConnected) return;
  
      try {
        const players = await anchorService.getAllPlayers();
  
        const sorted = players
          .sort((a, b) => b.highScore - a.highScore)
          .slice(0, 10)
          .map((player, index) => ({
            rank: index + 1,
            player: player.wallet,
            score: player.highScore,
            games: player.totalGames,
          }));
  
        setLeaderboardEntries(sorted);
  
        const current = sorted.find((entry) => entry.player === playerData?.wallet);
        if (current && displayPlayerStats) {
          setDisplayPlayerStats(prev =>
            prev ? { ...prev, rank: current.rank } : null
          );
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      }
    };
  
    fetchLeaderboard();
  }, [gameState, isConnected, playerData?.wallet]);
  

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameSession.isPlaying && gameSession.timeLeft > 0) {
      interval = setInterval(() => {
        //@ts-ignore
        setGameSession(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (gameSession.timeLeft === 0 && gameSession.isPlaying) {
      handleGameEnd();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameSession.isPlaying, gameSession.timeLeft]);

  // Handle player creation
  const handleCreatePlayer = async () => {
    setIsCreatingPlayer(true);
    try {
      await createPlayer();
      setPlayerExists(true);
      setNotification({
        type: 'success',
        message: 'Player account created successfully!'
      });
      await fetchPlayerData();
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to create player account'
      });
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  // Handle game start
  const handleGameStart = () => {
    setGameSession({
      isPlaying: true,
      score: 0,
      timeLeft: 30,
      gameStarted: true,
      gameEnded: false
    });
  };

  // Handle game end
  const handleGameEnd = async () => {
    //@ts-ignore
    setGameSession(prev => ({
      ...prev,
      isPlaying: false,
      gameEnded: true
    }));

    // Submit score if player exists and score > 0
    if (playerExists && gameSession.score > 0) {
      try {
        const success = await submitScore(gameSession.score);
        if (success) {
          setNotification({
            type: 'success',
            message: `Score ${gameSession.score} submitted successfully!`
          });
          await fetchPlayerData();
          await fetchGameState();
        } else {
          setNotification({
            type: 'error',
            message: 'Failed to submit score to blockchain'
          });
        }
      } catch (error) {
        console.error('Score submission error:', error);
        setNotification({
          type: 'error',
          message: 'Error submitting score'
        });
      }
    }
  };

  // Handle tap
  const handleTap = useCallback(() => {
    if (gameSession.isPlaying) {
      //@ts-ignore
      setGameSession(prev => ({
        ...prev,
        score: prev.score + 1
      }));
    }
  }, [gameSession.isPlaying]);

  // Handle game reset
  const handleGameReset = () => {
    setGameSession({
      isPlaying: false,
      score: 0,
      timeLeft: 30,
      gameStarted: false,
      gameEnded: false
    });
  };

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Notification */}
      {notification && (
        <div className={`
          fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm
          ${notification.type === 'success' 
            ? 'bg-green-500/20 border-green-400/30 text-green-300' 
            : notification.type === 'error'
            ? 'bg-red-500/20 border-red-400/30 text-red-300'
            : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
          }
        `}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tap to Win
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            On-Chain Leaderboard • Tap Fast • Climb the Ranks
          </p>

          {/* Wallet Connection */}
          {!authenticated ? (
            <button
              onClick={login}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </div>
            </button>
          ) : (
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 bg-black/20 rounded-full px-4 py-2">
                <User className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">
                  {user?.wallet?.address ? 
                    `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}` : 
                    'Connected'
                  }
                </span>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Disconnect
              </button>
              <WalletStatus/>
<PrivyWalletDebug/>
            </div>
          )}
        </div>

        {authenticated && (
          <>
            {/* Player Creation */}
            {!playerExists && (
              <div className="text-center mb-8">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-4">Create Player Account</h3>
                  <p className="text-gray-300 mb-6">
                    Create your on-chain player account to start playing and track your scores!
                  </p>
                  <button
                    onClick={handleCreatePlayer}
                    disabled={isCreatingPlayer}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingPlayer ? (
                      <div className="flex items-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Player Account'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Game Area */}
            {playerExists && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Game Stats */}
                <div className="flex justify-center">
                  <GameStats 
                    gameState={gameState}
                    playerStats={displayPlayerStats}
                    isLoading={loading}
                  />
                </div>

                {/* Game Play Area */}
                <div className="flex flex-col items-center space-y-6">
                  {/* Timer */}
                  {(gameSession.isPlaying || gameSession.gameStarted) && (
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          {gameSession.timeLeft}
                        </div>
                        <div className="text-purple-300 text-sm">seconds left</div>
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
                  <div className="flex space-x-4">
                    {!gameSession.gameStarted && (
                      <button
                        onClick={handleGameStart}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Play className="w-5 h-5" />
                          <span>Start Game</span>
                        </div>
                      </button>
                    )}

                    {gameSession.isPlaying && (
                      <button
                        onClick={handleGameEnd}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Pause className="w-5 h-5" />
                          <span>End Game</span>
                        </div>
                      </button>
                    )}

                    {gameSession.gameEnded && (
                      <button
                        onClick={handleGameReset}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="w-5 h-5" />
                          <span>Play Again</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Game Result */}
                  {gameSession.gameEnded && (
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">Game Over!</h3>
                      <div className="text-4xl font-bold text-purple-400 mb-2">
                        {gameSession.score}
                      </div>
                      <p className="text-gray-300">
                        {gameSession.score > (displayPlayerStats?.highScore || 0) ? 
                          'New High Score! 🎉' : 
                          'Good game! Try again to beat your record.'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Leaderboard */}
                <div className="flex justify-center">
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
          <div className="fixed bottom-4 left-4 bg-red-500/20 border border-red-400/30 text-red-300 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-2 text-red-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { PublicKey } from "@solana/web3.js";
import { anchorService } from "../lib/anchor";
import { GameState, Player } from "../types/game";

// Define wallet adapter interface for type safety
interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction: (tx: any) => Promise<any>;
  signAllTransactions: (txs: any[]) => Promise<any[]>;
  connected: boolean;
}

export const useGameContract = () => {
  const { ready, authenticated } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get the first available Solana wallet
  const solanaWallet = solanaWallets[0] ?? null;

  // Create wallet adapter compatible with Anchor
  const createWalletAdapter = useCallback((): WalletAdapter | null => {
    if (!solanaWallet || !solanaWallet.address) {
      console.log("No Solana wallet available");
      return null;
    }

    try {
      const publicKey = new PublicKey(solanaWallet.address);

      return {
        publicKey,
        connected: true,
        signTransaction: async (tx: any) => {
          if ("signTransaction" in solanaWallet && typeof solanaWallet.signTransaction === "function") {
            return await solanaWallet.signTransaction(tx);
          }
          throw new Error("Wallet does not support signTransaction");
        },
        signAllTransactions: async (txs: any[]) => {
          if ("signAllTransactions" in solanaWallet && typeof solanaWallet.signAllTransactions === "function") {
            return await solanaWallet.signAllTransactions(txs);
          }
          if ("signTransaction" in solanaWallet && typeof solanaWallet.signTransaction === "function") {
            const signedTxs = [];
            for (const tx of txs) {
              signedTxs.push(await solanaWallet.signTransaction(tx));
            }
            return signedTxs;
          }
          throw new Error("Wallet does not support transaction signing");
        },
      };
    } catch (err) {
      console.error("Error creating wallet adapter:", err);
      return null;
    }
  }, [solanaWallet]);

  // Initialize program when wallet is ready
  useEffect(() => {
    const initializeProgram = async () => {
      if (!ready) {
        console.log("Privy not ready yet");
        return;
      }

      if (!authenticated) {
        console.log("User not authenticated");
        setIsConnected(false);
        setError(null);
        return;
      }

      if (!solanaWallet || !solanaWallet.address) {
        console.log("No Solana wallet connected");
        setIsConnected(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const walletAdapter = createWalletAdapter();
        if (!walletAdapter) {
          throw new Error("Failed to create wallet adapter");
        }

        console.log("Initializing program with wallet:", solanaWallet.address);
        //@ts-ignore
        await anchorService.initializeProgram(walletAdapter);
        
        setIsConnected(true);
        console.log("✅ Program initialized successfully");
      } catch (err: any) {
        console.error("❌ Failed to initialize program:", err);
        setError(`Failed to connect to program: ${err.message || err}`);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure wallet is fully loaded
    const timeoutId = setTimeout(initializeProgram, 100);
    return () => clearTimeout(timeoutId);
  }, [ready, authenticated, solanaWallet, createWalletAdapter]);

  // Fetch data when connected
  useEffect(() => {
    if (isConnected && authenticated) {
      fetchGameState();
      if (solanaWallet && solanaWallet.address) {
        fetchPlayerData();
      }
    }
  }, [isConnected, authenticated, solanaWallet]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkPlayerExists = useCallback(async (): Promise<boolean> => {
    if (!solanaWallet || !solanaWallet.address || !isConnected) {
      console.log("Cannot check player: wallet not connected or program not initialized");
      return false;
    }

    try {
      const player = await anchorService.getPlayer(new PublicKey(solanaWallet.address));
      return player !== null;
    } catch (err) {
      console.error("Error checking player existence:", err);
      return false;
    }
  }, [solanaWallet, isConnected]);

  const createPlayer = useCallback(async (): Promise<void> => {
    if (!authenticated || !solanaWallet || !solanaWallet.address) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
    if (!isConnected) {
      throw new Error("Program not initialized. Please wait for connection.");
    }

    setLoading(true);
    setError(null);

    try {
      const walletAdapter = createWalletAdapter();
      if (!walletAdapter) {
        throw new Error("Failed to create wallet adapter");
      }

      // Check if game state is initialized, if not initialize it first
      const gameStateExists = await anchorService.isGameStateInitialized();
      if (!gameStateExists) {
        console.log("Game state not initialized, initializing first...");
        const initTx = await anchorService.initializeGameState(walletAdapter);
        console.log("✅ Game state initialized, transaction:", initTx);
      }

      console.log("Creating player for wallet:", solanaWallet.address);
      const tx = await anchorService.createPlayer(walletAdapter);
      console.log("✅ Player created, transaction:", tx);

      // Refresh data
      await Promise.all([fetchPlayerData(), fetchGameState()]);
    } catch (err: any) {
      console.error("❌ Error creating player:", err);
      setError(err.message || "Failed to create player");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authenticated, solanaWallet, isConnected, createWalletAdapter]);

  const submitScore = useCallback(
    async (score: number): Promise<boolean> => {
      if (!authenticated || !solanaWallet || !solanaWallet.address) {
        setError("Wallet not connected. Please connect your wallet first.");
        return false;
      }
      if (!isConnected) {
        setError("Program not initialized. Please wait for connection.");
        return false;
      }
      if (score <= 0) {
        setError("Score must be greater than 0");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const walletAdapter = createWalletAdapter();
        if (!walletAdapter) {
          throw new Error("Failed to create wallet adapter");
        }

        console.log("Submitting score:", score);
        const tx = await anchorService.submitScore(walletAdapter, score);
        console.log("✅ Score submitted, transaction:", tx);

        // Refresh data
        await Promise.all([fetchPlayerData(), fetchGameState()]);
        return true;
      } catch (err: any) {
        console.error("❌ Error submitting score:", err);
        setError(err.message || "Failed to submit score");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [authenticated, solanaWallet, isConnected, createWalletAdapter]
  );

  const fetchGameState = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      console.log("Cannot fetch game state: program not connected");
      return;
    }

    try {
      const state = await anchorService.getGameState();
      setGameState(state);
      if (!state) {
        console.log("Game state not found - may need initialization");
      }
    } catch (err: any) {
      console.error("❌ Error fetching game state:", err);
      setError("Failed to fetch game state");
    }
  }, [isConnected]);

  const fetchPlayerData = useCallback(async (): Promise<void> => {
    if (!solanaWallet || !solanaWallet.address || !isConnected) {
      console.log("Cannot fetch player data: wallet not connected or program not initialized");
      return;
    }

    try {
      const player = await anchorService.getPlayer(new PublicKey(solanaWallet.address));
      setPlayerData(player);
      if (!player) {
        console.log("Player not found - may need to create player");
      }
    } catch (err: any) {
      console.error("❌ Error fetching player data:", err);
      setError("Failed to fetch player data");
    }
  }, [solanaWallet, isConnected]);

  const initializeGameState = useCallback(async (): Promise<void> => {
    if (!authenticated || !solanaWallet || !solanaWallet.address) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
    if (!isConnected) {
      throw new Error("Program not initialized. Please wait for connection.");
    }

    setLoading(true);
    setError(null);

    try {
      const walletAdapter = createWalletAdapter();
      if (!walletAdapter) {
        throw new Error("Failed to create wallet adapter");
      }

      console.log("Initializing game state...");
      const tx = await anchorService.initializeGameState(walletAdapter);
      console.log("✅ Game state initialized, transaction:", tx);

      await fetchGameState();
    } catch (err: any) {
      console.error("❌ Error initializing game state:", err);
      setError(err.message || "Failed to initialize game state");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authenticated, solanaWallet, isConnected, createWalletAdapter]);

  // Helper function to setup the entire game (initialize game state + create player)
  const setupGame = useCallback(async (): Promise<void> => {
    if (!authenticated || !solanaWallet || !solanaWallet.address) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
    if (!isConnected) {
      throw new Error("Program not initialized. Please wait for connection.");
    }

    setLoading(true);
    setError(null);

    try {
      const walletAdapter = createWalletAdapter();
      if (!walletAdapter) {
        throw new Error("Failed to create wallet adapter");
      }

      // Use the setupGame method from anchorService
      const success = await anchorService.setupGame(walletAdapter);
      if (!success) {
        throw new Error("Failed to setup game");
      }

      console.log("✅ Game setup completed");

      // Refresh data
      await Promise.all([fetchPlayerData(), fetchGameState()]);
    } catch (err: any) {
      console.error("❌ Error setting up game:", err);
      setError(err.message || "Failed to setup game");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authenticated, solanaWallet, isConnected, createWalletAdapter]);

  return {
    // State
    gameState,
    playerData,
    loading,
    error,
    isConnected,
    
    // Wallet info
    walletAddress: solanaWallet?.address || null,
    
    // Actions
    createPlayer,
    checkPlayerExists,
    submitScore,
    initializeGameState,
    setupGame, // New helper function
    clearError,
    
    // Manual refresh functions
    fetchGameState,
    fetchPlayerData,
  };
};
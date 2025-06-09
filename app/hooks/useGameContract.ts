"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { PublicKey } from "@solana/web3.js";
import { anchorService } from "../lib/anchor";
import { GameState, Player } from "../types/game";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

export const useGameContract = () => {
  const { ready, authenticated } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const solanaWallet = solanaWallets[0] ?? null;

  const createWalletAdapter = useCallback(() => {
    if (!solanaWallet || !solanaWallet.address) return null;

    const publicKey = new PublicKey(solanaWallet.address);

    return {
      publicKey,
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
        throw new Error("Wallet does not support signAllTransactions or signTransaction");
      },
      connected: true,
    };
  }, [solanaWallet]);

  useEffect(() => {
    const initializeProgram = async () => {
      if (ready && authenticated && solanaWallet && solanaWallet.address) {
        try {
          setLoading(true);
          const walletAdapter = createWalletAdapter();
          if (!walletAdapter) throw new Error("Failed to create wallet adapter");

          await anchorService.initializeProgram(walletAdapter);
          setIsConnected(true);
          setError(null);
          console.log("✅ Program initialized successfully with Privy wallet");
        } catch (err: any) {
          console.error("❌ Failed to initialize program:", err);
          setError(`Failed to connect to program: ${err.message || err}`);
          setIsConnected(false);
        } finally {
          setLoading(false);
        }
      } else {
        setIsConnected(false);
        if (ready && !authenticated) {
          setError(null);
        }
      }
    };

    const timeoutId = setTimeout(initializeProgram, 100);
    return () => clearTimeout(timeoutId);
  }, [ready, authenticated, solanaWallet, createWalletAdapter]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkPlayerExists = useCallback(async (): Promise<boolean> => {
    if (!solanaWallet || !isConnected) {
      console.log("Cannot check player: wallet not connected");
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
      if (!walletAdapter) throw new Error("Failed to create wallet adapter");

      const tx = await anchorService.createPlayer(walletAdapter);
      console.log("✅ Player created, transaction:", tx);

      await fetchPlayerData();
      await fetchGameState();
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
        if (!walletAdapter) throw new Error("Failed to create wallet adapter");

        const tx = await anchorService.submitScore(walletAdapter, score);
        console.log("✅ Score submitted, transaction:", tx);

        await fetchPlayerData();
        await fetchGameState();

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
    setLoading(true);
    setError(null);

    try {
      const state = await anchorService.getGameState();
      if (state) {
        setGameState(state);
      } else {
        setError("Game state not found. Game may not be initialized.");
      }
    } catch (err: any) {
      console.error("❌ Error fetching game state:", err);
      setError("Failed to fetch game state");
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  const fetchPlayerData = useCallback(async (): Promise<void> => {
    if (!solanaWallet || !isConnected) {
      console.log("Cannot fetch player data: wallet not connected or program not initialized");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const player = await anchorService.getPlayer(new PublicKey(solanaWallet.address));
      setPlayerData(player);
    } catch (err: any) {
      console.error("❌ Error fetching player data:", err);
      setError("Failed to fetch player data");
    } finally {
      setLoading(false);
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
      if (!walletAdapter) throw new Error("Failed to create wallet adapter");

      const tx = await anchorService.initialiseGameState(walletAdapter);
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

  useEffect(() => {
    if (isConnected && authenticated) {
      fetchGameState();
      if (solanaWallet && solanaWallet.address) {
        fetchPlayerData();
      }
    }
  }, [isConnected, authenticated, solanaWallet, fetchGameState, fetchPlayerData]);

  return {
    gameState,
    playerData,
    loading,
    error,
    isConnected,
    createPlayer,
    checkPlayerExists,
    submitScore,
    initializeGameState,
    clearError,
  };
};

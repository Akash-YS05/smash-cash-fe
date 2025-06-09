// import * as anchor from "@coral-xyz/anchor";
// import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
// import { TapToWin } from "./idl/tap_to_win";
// import type { Idl } from "@coral-xyz/anchor";
// import idlJson from "./idl/tap_to_win.json";
// import { Player } from "../types/game";

// const idl = idlJson as Idl;
// const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
// const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet");

// export class AnchorService {
//   private connection: Connection;
//   private program: anchor.Program<TapToWin> | null = null;

//   constructor() {
//     this.connection = new Connection(RPC_URL, "confirmed");
//   }

//   async initializeProgram(walletAdapter: anchor.Wallet) {
//     try {
//       const provider = new anchor.AnchorProvider(
//         this.connection,
//         walletAdapter,
//         anchor.AnchorProvider.defaultOptions()
//       );
//       this.program = new anchor.Program<TapToWin>(idl, provider, PROGRAM_ID);
//       console.log("Anchor program initialized with wallet");
//     } catch (error) {
//       console.error("Anchor initialization failed:", error);
//       throw error;
//     }
//   }

//   async getGameStatePDA(): Promise<[PublicKey, number]> {
//     return PublicKey.findProgramAddressSync([Buffer.from("game_state")], PROGRAM_ID);
//   }

//   async getPlayerPDA(wallet: PublicKey): Promise<[PublicKey, number]> {
//     return PublicKey.findProgramAddressSync([Buffer.from("player"), wallet.toBuffer()], PROGRAM_ID);
//   }

//   async initialiseGameState(wallet: anchor.Wallet) {
//     if (!this.program) throw new Error("Program not initialized");

//     const [gameStatePDA] = await this.getGameStatePDA();

//     try {
//       const tx = await this.program.methods
//         .initialize()
//         .accounts({
//           gameState: gameStatePDA,
//           authority: wallet.publicKey,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .rpc();

//       return tx;
//     } catch (err) {
//       console.error("Error initializing game state:", err);
//       throw err;
//     }
//   }

//   async createPlayer(wallet: anchor.Wallet) {
//     if (!this.program) throw new Error("Program not initialized");

//     const [gameStatePDA] = await this.getGameStatePDA();
//     const [playerPDA] = await this.getPlayerPDA(wallet.publicKey);

//     try {
//       const tx = await this.program.methods
//         .createPlayer()
//         .accounts({
//           player: playerPDA,
//           gameState: gameStatePDA,
//           authority: wallet.publicKey,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .rpc();

//       return tx;
//     } catch (err) {
//       console.error("Error creating player:", err);
//       throw err;
//     }
//   }

//   async submitScore(wallet: anchor.Wallet, score: number) {
//     if (!this.program) throw new Error("Program not initialized");

//     const [gameStatePDA] = await this.getGameStatePDA();
//     const [playerPDA] = await this.getPlayerPDA(wallet.publicKey);

//     try {
//       const tx = await this.program.methods
//         .submitScore(score)
//         .accounts({
//           player: playerPDA,
//           gameState: gameStatePDA,
//           authority: wallet.publicKey,
//         })
//         .rpc();

//       return tx;
//     } catch (err) {
//       console.error("Error submitting score:", err);
//       throw err;
//     }
//   }

//   async getGameState() {
//     if (!this.program) throw new Error("Program not initialized");

//     const [gameStatePDA] = await this.getGameStatePDA();

//     try {
//       const gameState = await this.program.account.gameState.fetch(gameStatePDA);

//       return {
//         authority: gameState.authority.toString(),
//         totalPlayers: gameState.totalPlayers.toNumber(),
//         totalGames: gameState.totalGames.toNumber(),
//         topScore: gameState.topScore.toNumber(),
//         topPlayer: gameState.topPlayer ? gameState.topPlayer.toString() : null,
//         bump: gameState.bump,
//       };
//     } catch (err) {
//       console.error("Error fetching game state:", err);
//       return null;
//     }
//   }

//   async getPlayer(wallet: PublicKey): Promise<Player | null> {
//     if (!this.program) throw new Error("Program not initialized");

//     const [playerPDA] = await this.getPlayerPDA(wallet);

//     try {
//       const player = await this.program.account.player.fetch(playerPDA);

//       return {
//         wallet: player.wallet.toString(),
//         totalGames: player.totalGames.toNumber(),
//         highScore: player.highScore.toNumber(),
//         lastPlayed: player.lastPlayed.toNumber(),
//         bump: player.bump,
//       };
//     } catch (error) {
//       console.error("Error fetching player:", error);
//       return null;
//     }
//   }

//   async getAllPlayers(): Promise<Player[]> {
//     if (!this.program) throw new Error("Program not initialized");

//     try {
//       const playerAccounts = await this.program.account.player.all();

//       return playerAccounts.map(({ account }) => ({
//         wallet: account.wallet.toString(),
//         highScore: account.highScore.toNumber(),
//         totalGames: account.totalGames.toNumber(),
//         lastPlayed: account.lastPlayed.toNumber(),
//         bump: account.bump,
//       }));
//     } catch (err) {
//       console.error("Error fetching all players:", err);
//       return [];
//     }
//   }
// }

// export const anchorService = new AnchorService();
import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TapToWin } from './idl/tap_to_win';
import idl from './idl/tap_to_win.json';

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');

export class AnchorService {
  private connection: Connection;
  private program: anchor.Program<TapToWin> | null = null;

  constructor() {
    this.connection = new Connection(RPC_URL, 'confirmed');
  }

  async initializeProgram(wallet: anchor.Wallet) {
    try {
      const provider = new anchor.AnchorProvider(
        this.connection,
        wallet,
        { commitment: 'confirmed' }
      );
      
      // Set the provider as the default (optional but often useful)
      anchor.setProvider(provider);
      
      this.program = new anchor.Program(idl as any, provider);
      return this.program;
    } catch (error) {
      console.error('Failed to initialize program:', error);
      throw error;
    }
  }

  async getGameStatePDA(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('game_state')],
      PROGRAM_ID
    );
  }

  async getPlayerPDA(wallet: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('player'), wallet.toBuffer()],
      PROGRAM_ID
    );
  }

  // Helper methods to check account existence
  async isGameStateInitialized(): Promise<boolean> {
    const [gameStatePDA] = await this.getGameStatePDA();
    const accountInfo = await this.connection.getAccountInfo(gameStatePDA);
    return accountInfo !== null;
  }

  async isPlayerCreated(wallet: PublicKey): Promise<boolean> {
    const [playerPDA] = await this.getPlayerPDA(wallet);
    const accountInfo = await this.connection.getAccountInfo(playerPDA);
    return accountInfo !== null;
  }

  async initializeGameState(wallet: any) {
    if (!this.program) throw new Error('Program not initialized');
    
    // Check if already initialized
    if (await this.isGameStateInitialized()) {
      console.log('Game state already initialized');
      return null;
    }
    
    const [gameStatePDA] = await this.getGameStatePDA();
    
    try {
      const tx = await this.program.methods
        .initialize()
        .accounts({
          gameState: gameStatePDA,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error initializing game state:', error);
      throw error;
    }
  }

  async createPlayer(wallet: any) {
    if (!this.program) throw new Error('Program not initialized');
    
    // Check if player already exists
    if (await this.isPlayerCreated(wallet.publicKey)) {
      console.log('Player already exists');
      return null;
    }
    
    const [gameStatePDA] = await this.getGameStatePDA();
    const [playerPDA] = await this.getPlayerPDA(wallet.publicKey);
    
    try {
      const tx = await this.program.methods
        .createPlayer()
        .accounts({
          player: playerPDA,
          gameState: gameStatePDA,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  async submitScore(wallet: any, score: number) {
    if (!this.program) throw new Error('Program not initialized');
    
    const [gameStatePDA] = await this.getGameStatePDA();
    const [playerPDA] = await this.getPlayerPDA(wallet.publicKey);
    
    try {
      const tx = await this.program.methods
        .submitScore(new anchor.BN(score))
        .accounts({
          player: playerPDA,
          gameState: gameStatePDA,
          authority: wallet.publicKey,
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  async getGameState() {
    if (!this.program) throw new Error('Program not initialized');
    
    const [gameStatePDA] = await this.getGameStatePDA();
    
    try {
      // Check if account exists first
      const accountInfo = await this.connection.getAccountInfo(gameStatePDA);
      if (!accountInfo) {
        console.log('Game state not initialized yet');
        return null;
      }
      
      const gameState = await this.program.account.gameState.fetch(gameStatePDA);
      return {
        authority: gameState.authority.toString(),
        totalPlayers: gameState.totalPlayers.toNumber(),
        totalGames: gameState.totalGames.toNumber(),
        topScore: gameState.topScore.toNumber(),
        topPlayer: gameState.topPlayer?.toString(),
        bump: gameState.bump
      };
    } catch (error) {
      console.error('Error fetching game state:', error);
      return null;
    }
  }

  async getPlayer(wallet: PublicKey) {
    if (!this.program) throw new Error('Program not initialized');
    
    const [playerPDA] = await this.getPlayerPDA(wallet);
    
    try {
      // Check if account exists first
      const accountInfo = await this.connection.getAccountInfo(playerPDA);
      if (!accountInfo) {
        console.log('Player not created yet');
        return null;
      }
      
      const player = await this.program.account.player.fetch(playerPDA);
      return {
        wallet: player.wallet.toString(),
        highScore: player.highScore.toNumber(),
        totalGames: player.totalGames.toNumber(),
        lastPlayed: player.lastPlayed.toNumber(),
        bump: player.bump
      };
    } catch (error) {
      console.error('Error fetching player:', error);
      return null;
    }
  }

  // Convenience method to setup everything
  async setupGame(wallet: any) {
    try {
      // Initialize game state if not exists
      if (!await this.isGameStateInitialized()) {
        console.log('Initializing game state...');
        await this.initializeGameState(wallet);
      }
      
      // Create player if not exists
      if (!await this.isPlayerCreated(wallet.publicKey)) {
        console.log('Creating player...');
        await this.createPlayer(wallet);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting up game:', error);
      return false;
    }
  }
}

export const anchorService = new AnchorService();
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TapToWin } from './idl/tap_to_win';
import idl from './idl/tap_to_win.json';

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('devnet');

export class AnchorService {
    private connection: Connection;
    private program: anchor.Program<TapToWin> | null = null;

    constructor(){
        this.connection = new Connection(RPC_URL, 'confirmed');
        
    }

    async intialiseProgram(wallet: any) {
        const provider = new anchor.AnchorProvider(
            this.connection,
            wallet,
            { commitment: 'confirmed' }
        );

        this.program = new anchor.Program(idl as TapToWin, PROGRAM_ID, provider);
        return this.program;
    }

    async getGameStatePDA(): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('game_state')],
            PROGRAM_ID
        )
    }

    async getPlayerPDA(wallet: PublicKey): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('player'), wallet.toBuffer()],
            PROGRAM_ID
        )
    }

    async initialiseGameState(wallet: any) {
        if (!this.program) throw new Error("Program not initialized");

        const [gameStatePDA] = await this.getGameStatePDA();
        try {
            const tx = this.program.methods
                .initialize()
                .accounts({
                    gameState: gameStatePDA,
                    authority: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc()

            return tx;
        } catch(err) {
            console.error("Error initializing game state:", err);
            throw err;
            
        }
    }

    async createPlayer(wallet: any) {
        if (!this.program) throw new Error("Program not initialized");

        const [gameStatePDA] = await this.getGameStatePDA();
        const [playerPDA] = await this.getPlayerPDA(wallet.publicKey);

        try {
            const tx = this.program.methods
                .createPlayer()
                .accounts({
                    player: playerPDA,
                    gameState: gameStatePDA,
                    authority: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();

            return tx;
        } catch(err) {
            console.error("Error creating player:", err);
            throw err;
        }
    }

    async submitScore(wallet: any, score: number) {
        if (!this.program) throw new Error("Program not initialized");

        const [gameStatePDA] = await this.getGameStatePDA();
        const [playerPDA] = await this.getPlayerPDA(wallet.publicKey);

        try {
            const tx = this.program.methods
                .submitScore(score)
                .accounts({
                    player: playerPDA,
                    gameState: gameStatePDA,
                    authority: wallet.publicKey,
                })
                .rpc();

            return tx;
        } catch(err) {
            console.error("Error submitting score:", err);
            throw err;
        }
    }

    async getGameState() {
        if  (!this.program) throw new Error("Program not initialized");

        const [gameStatePDA] = await this.getGameStatePDA();

        try {
            const gameState = await this.program.account.gameState.fetch(gameStatePDA);
            return {
                authority: gameState.authority.toString(),
                totalPlayers: gameState.totalPlayers.toNumber(),
                totalGames: gameState.totalGames.toNumber(),
                topScore: gameState.topScore.toNumber(),
                topPlayer: gameState.topPlayer ? gameState.topPlayer.toString() : null,
                bump: gameState.bump,
            };
        } catch(err) {
            console.error("Error fetching game state:", err);
            return null;
        }
    }

    async getPlayer(wallet: PublicKey) {
        if (!this.program) throw new Error("Program not initialized");

        const [playerPDA] = await this.getPlayerPDA(wallet);

        try {
            const player = await this.program.account.player.fetch(playerPDA);

            return {
                wallet: player.wallet.toString(),
                totalGames: player.totalGames.toNumber(),
                highScore: player.highScore.toNumber(),
                lastPlayed: player.lastPlayed.toNumber(),
                bump: player.bump,
            }
        } catch (error) {
            console.error('Error fetching player:', error);
            return null;
        }
    }
}

export const anchorService = new AnchorService();
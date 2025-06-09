export interface GameState {
    authority: string;
    totalPlayers: number;
    totalGames: number;
    topScore: number;
    topPlayer?: string | null;
    bump: number;
  }
  
  export interface Player {
    wallet: string;
    highScore: number;
    totalGames: number;
    lastPlayed: string;
    bump: number;
  }
  
  export interface LeaderboardEntry {
    rank: number;
    player: string;
    score: number;
    games: number;
  }
  
  export interface GameSessionState {
    isPlaying: boolean;
    score: number;
    timeLeft: number;
    gameStarted: boolean;
    gameEnded: boolean;
  }
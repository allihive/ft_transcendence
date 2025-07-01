//service.ts - Updated MatchResult interface

/**
 * Represents a successful match between two players
 * Contains all the information needed to start a game session
 */
export interface MatchResult {
  player1: MatchmakingEntry;      // First player in the match
  player2: MatchmakingEntry;      // Second player in the match
  scoreDifference: number;        // Skill difference between players (lower = more balanced)
  matchId: string;               // Unique identifier for this match session
  createdAt: Date;               // When the match was created
}

// You'll need this interface too if you don't have it
export interface MatchmakingEntry {
  playerId: string;  // Changed from number to string to match UUID format
  score: number;     // Player's current skill rating
  status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
  updatedAt: string; // ISO string timestamp
}
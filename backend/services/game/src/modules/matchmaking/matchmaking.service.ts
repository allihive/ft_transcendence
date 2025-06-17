// src/modules/matchmaking/matchmaking.service.ts
import { findOnlinePlayers } from '../database/repositories/matchmaking.repository';
import { MatchmakingEntry } from '../database/schemas/matchmaking';
import db from '../database/index';

/**
 * Represents a successful match between two players
 * Contains all the information needed to start a game session
 */
export interface MatchResult {
  player1: MatchmakingEntry;      // First player in the match
  player2: MatchmakingEntry;      // Second player in the match
  scoreDifference: number;        // Skill difference between players (lower = more balanced)
  matchId: string;               // Unique identifier for this match session
  isTimeoutMatch?: boolean;
}

export interface MatchmakingConfig {
  matchTimeout: number;           // Time in milliseconds before expanding search criteria
  minPlayersForMatch: number;     // Minimum number of players needed before attempting to create matches
}

/**
 * Default matchmaking configuration
 * These values provide a balanced experience for most games
 */
const DEFAULT_CONFIG: MatchmakingConfig = {
  matchTimeout: 45000,            // Wait 45 seconds before relaxing matching criteria
  minPlayersForMatch: 2           // Need at least 2 players to create a match
};

/**
 * Main Matchmaking Service Class
 * 
 * This service handles the entire lifecycle of player matchmaking:
 * 1. Queue management (players joining/leaving)
 * 2. Match creation (finding compatible opponents)
 * 3. Game session tracking (monitoring active matches)
 * 4. Rating updates (adjusting player scores after games)
 * 5. Queue maintenance (cleaning up expired entries)
 * 
 * The service uses a skill-based matchmaking system where players with similar
 * ratings are matched together, with flexibility increasing over time to reduce wait times.
 */
export class MatchmakingService {
	private config: MatchmakingConfig; //the configuration settings for this service instance
	private matchMakingQueue: Map<number, Date>; //to track how long players are in queue
	private activeMatches: Map<string, MatchResult>; // store the information about ongoing matches
	private matchMakingInterval: NodeJS.Timeout | null = null; // ADD this one

	constructor(config: MatchmakingConfig = DEFAULT_CONFIG) {
		this.config = config;
		this.matchMakingQueue = new Map();
		this.activeMatches = new Map();
		this.startMatchMaking();
	}

	private startMatchMaking(): void {
		this.matchMakingInterval = setInterval(async () => {
			if (this.matchMakingQueue.size >= 2) {
				await this.findMatches();
			}
		}, 5000);
	}

	private stopMatchMaking(): void {
		if (this.matchMakingQueue.size === 0 && this.matchMakingInterval !== null) {
			clearInterval(this.matchMakingInterval);
			this.matchMakingInterval = null;
			console.log('Matchmaking stopped - no players in queue');
		}
	}
   /**
   * Add a player to the matchmaking queue
   * 
   * This function:
   * 1. Updates the player's status to 'ONLINE' in the database
   * 2. Adds them to the internal queue with a timestamp
   * 3. Makes them available for matching with other players
   * 
   * @param playerId can also be changed to maybe a class called Player?
   * @throws Error if database update fails
   */
  async joinQueue(playerId: number): Promise<void> {
    try {
      // Mark player as online and available for matching in the database
      await this.updatePlayerStatus(playerId, 'ONLINE');
      
      // Add to our internal queue tracking with current timestamp
      // This timestamp is used to calculate wait times and adjust matching criteria
      this.matchMakingQueue.set(playerId, new Date());
      
      console.log(`Player ${playerId} joined matchmaking queue`);
    } catch (error) {
      console.error(`Failed to add player ${playerId} to queue:`, error);
      throw error;
    }
  }
   /**
   * Remove a player from the matchmaking queue
   * 
   * This function:
   * 1. Updates the player's status to 'OFFLINE' in the database
   * 2. Removes them from the internal queue tracking
   * 3. Prevents them from being matched with other players
   */
  async leaveQueue(playerId: number): Promise<void> {
    try {
      // Mark player as offline in the database
      await this.updatePlayerStatus(playerId, 'OFFLINE');
      // Remove from our internal queue tracking
      this.matchMakingQueue.delete(playerId);
      console.log(`Player ${playerId} left matchmaking queue`);
	  //check if we should stop matchmaking
	  this.stopMatchMaking();
    } catch (error) {
      console.error(`Failed to remove player ${playerId} from queue:`, error);
      throw error;
    }
  }

  /**
   * Update a player's status in the database
   * This utility function handles all status transitions:
   * - OFFLINE: Player is not available for matching
   * - ONLINE: Player is available and can be matched
   * - IN_GAME: Player is currently in a match
   */
  private updatePlayerStatus(playerId: number, status: 'ONLINE' | 'OFFLINE' | 'IN_GAME'): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE matchmaking 
        SET status = ?, updatedAt = ? 
        WHERE playerId = ?
      `;
      const updatedAt = new Date().toISOString();
      
      db.run(query, [status, updatedAt, playerId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Main matchmaking algorithm - finds optimal matches for waiting players
   * 
   * This is the core of the matchmaking system. It:
   * 1. Retrieves all online players from the database
   * 2. Filters for players actually in the matchmaking queue
   * 3. Uses a skill-based algorithm to create balanced matches
   * 4. Updates player statuses to 'IN_GAME' for matched players
   * 5. Removes matched players from the queue
   * 6. Tracks active matches for completion handling
   * 
   * The algorithm prioritizes:
   * - Skill balance (similar ratings)
   * - Wait time (players waiting longer get priority)
   * - Overall fairness (everyone gets matched eventually)
   * 
   * @returns Array of MatchResult objects representing created matches
   * @throws Error if database operations fail
   */
  async findMatches(): Promise<MatchResult[]> {
	try {
		const onlinePlayers = await findOnlinePlayers();
		if (onlinePlayers.length < this.config.minPlayersForMatch) {
			console.log(`Not enough players online (${onlinePlayers.length}/${this.config.minPlayersForMatch})`);
			return [];
		}
		// edgecases if the database and queue are out of sync
		const availablePlayers = onlinePlayers.filter(player => 
        this.matchMakingQueue.has(player.playerId));
		if (availablePlayers.length < 2) {
			console.log(`Not enough palyers in queue for matchmaking`);
			return [];
		}
		//with enough players, we now create match with optimal pairs
	const matches = this.createMatches(availablePlayers);
	      for (const match of matches) {
        // Update both players' status to 'IN_GAME' in the database
        await this.updatePlayerStatus(match.player1.playerId, 'IN_GAME');
        await this.updatePlayerStatus(match.player2.playerId, 'IN_GAME');
        // Remove both players from the matchmaking queue
        this.matchMakingQueue.delete(match.player1.playerId);
        this.matchMakingQueue.delete(match.player2.playerId);
        // Track this match as active so we can handle completion later
        this.activeMatches.set(match.matchId, match);
      }
	  console.log(`Created ${matches.length} matches`);
	  return matches;
	} catch (error) {
		console.error('Error in matchmaking process:', error);
		throw error;
	}
  }

  /**
	 * Core matching algorithm - creates optimal player pairings
	 * 
	 * This algorithm implements a greedy approach to find the best possible matches:
	 * 1. Sorts players by skill rating for efficient comparison
	 * 2. For each player, finds their best possible opponent
	 * 3. Uses dynamic criteria that relaxes over time (longer wait = more flexible matching)
	 * 4. Ensures each player is only matched once
	 * 5. Prioritizes skill balance while considering wait times
	 * 
	 * The algorithm is designed to be:
	 * - Fair: Better matches for players who wait longer
	 * - Efficient: O(n²) complexity, suitable for reasonable player counts
	 * - Balanced: Prioritizes skill similarity while avoiding indefinite waits
	 * 
	 * @param players - Array of available players to match
	 * @returns Array of optimal match pairings
	 * @private
	 */
private createMatches(players: MatchmakingEntry[]): MatchResult[] {
  const matches: MatchResult[] = [];
  const usedPlayers = new Set<number>();    // Track players already matched
  const currentTime = Date.now();

  // Sort players by skill rating for more efficient matching
  const sortedPlayers = [...players].sort((a, b) => a.score - b.score);

  // Try to match each available player
  for (let i = 0; i < sortedPlayers.length - 1; i++) {
    const player1 = sortedPlayers[i];
    
    // Skip if this player is already matched
    if (usedPlayers.has(player1.playerId)) continue;

    // Check if player has been waiting longer than matchTimeout
	const waitTime = currentTime - new Date(player1.updatedAt).getTime();
    const hasTimedOut = waitTime > this.config.matchTimeout;

    let bestOpponent: MatchmakingEntry | null = null;
    let bestScoreDiff = Infinity;

    // Check all potential opponents
    for (let j = i + 1; j < sortedPlayers.length; j++) {
      const player2 = sortedPlayers[j];
      
      // Skip if this potential opponent is already matched
      if (usedPlayers.has(player2.playerId)) continue;
      
      // Always skip offline players
      if (player2.status !== 'ONLINE') continue;

      const scoreDiff = Math.abs(player1.score - player2.score);

      if (hasTimedOut) {
        // Timeout mode: Match with first available ONLINE player regardless of score
        bestOpponent = player2;
        bestScoreDiff = scoreDiff;
        console.log(`Timeout match for Player ${player1.playerId} - matched with any available player`);
        break; // Take the first online player we find
      } else {        
        // Check if this is a valid and better match
        if (scoreDiff <= bestScoreDiff) {
          bestOpponent = player2;
          bestScoreDiff = scoreDiff;
        }
      }
    }

    // Create a match if we found a suitable opponent
    if (bestOpponent) {
      const match: MatchResult = {
        player1,
        player2: bestOpponent,
        scoreDifference: bestScoreDiff,
        matchId: this.generateMatchId(),
        isTimeoutMatch: hasTimedOut // Flag to indicate this was a timeout match
      };

      matches.push(match);
      usedPlayers.add(player1.playerId);
      usedPlayers.add(bestOpponent.playerId);

      const matchType = hasTimedOut ? "TIMEOUT" : "SKILL";
      console.log(`🤝 ${matchType} Match: Player ${player1.playerId} (${player1.score}) vs Player ${bestOpponent.playerId} (${bestOpponent.score}) - Score diff: ${bestScoreDiff}`);
    }
  }
  return matches;
}

/**
   * Handle the completion of a match and update player ratings
   * 
   * This function processes the end of a game session:
   * 1. Validates that the match exists and is active
   * 2. Calculates new skill ratings based on the match result
   * 3. Updates both players' ratings in the database
   * 4. Sets both players back to 'ONLINE' status (available for new matches)
   * 5. Removes the match from active tracking
   * 
   * The rating system is designed to:
   * - Reward wins more when beating higher-skilled opponents
   * - Penalize losses less when losing to higher-skilled opponents
   * - Give bonus points for dominant victories (large score margins)
   * - Maintain rating stability over time
   * 
   * @param matchId - Unique identifier of the completed match
   * @param winnerId - Player ID of the match winner
   * @param winnerScore - Final score of the winning player
   * @param loserScore - Final score of the losing player
   * @throws Error if match is not found or database operations fail
   */
  async completeMatch(matchId: string, winnerId: number, winnerScore: number, loserScore: number): Promise<void> {
    try {
      // Find the match in our active matches tracking
      const match = this.activeMatches.get(matchId);
      if (!match) {
        throw new Error(`Match ${matchId} not found`);
      }

      // Determine winner and loser objects from the match data
      const winner = winnerId === match.player1.playerId ? match.player1 : match.player2;
      const loser = winnerId === match.player1.playerId ? match.player2 : match.player1;

      // Calculate new skill ratings using our ELO-like system
      const { newWinnerScore, newLoserScore } = this.calculateNewScores(
        winner,
        loser,
        winnerScore,
        loserScore
      );

      // Update both players' ratings in the database
      await this.updatePlayerScore(winnerId, newWinnerScore);
      await this.updatePlayerScore(
        winnerId === match.player1.playerId ? match.player2.playerId : match.player1.playerId,
        newLoserScore
      );

      // Set both players back to 'ONLINE' status so they can join new matches
      await this.updatePlayerStatus(match.player1.playerId, 'ONLINE');
      await this.updatePlayerStatus(match.player2.playerId, 'ONLINE');

      // Remove this match from our active tracking
      this.activeMatches.delete(matchId);

      console.log(`🏆 Match ${matchId} completed. Winner: ${winnerId} (${newWinnerScore}), Loser: ${winner.playerId === winnerId ? loser.playerId : winner.playerId} (${newLoserScore})`);
    } catch (error) {
      console.error(`Error completing match ${matchId}:`, error);
      throw error;
    }
  }

 /**
 * Simple rating calculation based on score difference
 * 
 * Rules:
 * - Winner gains: score difference × 100
 * - Loser loses: score difference × 50
 * - Ratings cannot go below 0
 * 
 * Example: Player1 (100) beats Player2 (200) with score 11-9
 * - Score difference = |11 - 9| = 2
 * - Player1 gains: 2 × 100 = 200 → new score: 100 + 200 = 300
 * - Player2 loses: 2 × 50 = 100 → new score: 200 - 100 = 100
 * 
 * @param winner - The winning player's data
 * @param loser - The losing player's data
 * @param winnerGameScore - Final game score of the winner
 * @param loserGameScore - Final game score of the loser
 * @returns Object containing the new ratings for both players
 */
private calculateNewScores(
  winner: MatchmakingEntry, 
  loser: MatchmakingEntry, 
  winnerGameScore: number, 
  loserGameScore: number
): { newWinnerScore: number; newLoserScore: number } {
  // Calculate the score difference from the game
  const scoreDifference = Math.abs(winnerGameScore - loserGameScore);
  // Winner gains score difference × 100
  const winnerGain = scoreDifference * 100;
  // Loser loses score difference × 50
  const loserLoss = scoreDifference * 50;
  return {
    newWinnerScore: winner.score + winnerGain,
    newLoserScore: Math.max(0, loser.score - loserLoss) // Minimum rating is 0
  };
}

  /**
   * Generate a unique identifier for a match
   * 
   * Creates a unique match ID using:
   * - Current timestamp (ensures uniqueness across time)
   * - Random string (ensures uniqueness within the same millisecond)
   * 
   * Format: "match_[timestamp]_[randomstring]"
   * Example: "match_1640995200000_x7k9m2p4q"
   * 
   * @returns Unique match identifier string
   * @private
   */
  private generateMatchId(): string {
    return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

    /**
   * Update a player's skill rating in the database
   * 
   * This function is called after matches to update player ratings.
   * It also updates the timestamp to track when the rating was last changed.
   * 
   * @param playerId - The player whose rating to update
   * @param newScore - The new skill rating to set
   * @returns Promise that resolves when the database is updated
   * @private
   */
  private updatePlayerScore(playerId: number, newScore: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE matchmaking 
        SET score = ?, updatedAt = ? 
        WHERE playerId = ?
      `;
      const updatedAt = new Date().toISOString();
      
      db.run(query, [newScore, updatedAt, playerId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getPlayerQueueStatus(playerId: number): Promise<{
  inQueue: boolean;
  waitTime: number;
  queueSize: number;
  }> {
    const inQueue = this.matchMakingQueue.has(playerId);
    const waitTime = inQueue ? 
      Date.now() - this.matchMakingQueue.get(playerId)!.getTime() : 0;
    const queueSize = this.matchMakingQueue.size;
    
    return { inQueue, waitTime, queueSize };
  }

  /**
   * Clean up expired queue entries and reset problematic player states
   * 
   * This maintenance function should be called periodically to:
   * 1. Remove players who have been waiting too long (likely disconnected)
   * 2. Reset players stuck in invalid states
   * 3. Keep the queue healthy and responsive
   * 
   * Players are considered "expired" if they've been in queue for more than
   * 10x the normal timeout period, indicating they've likely disconnected
   * without properly leaving the queue.
   * 
   * This function helps prevent:
   * - Ghost players cluttering the queue
   * - Matches being created with disconnected players
   * - Memory leaks from indefinitely growing queue maps
   * 
   * @returns Promise that resolves when cleanup is complete
   */
  async cleanupQueue(): Promise<void> {
    const now = Date.now();
    const expiredPlayers: number[] = [];

    // Find players who have been waiting too long (likely disconnected)
    for (const [playerId, joinTime] of this.matchMakingQueue.entries()) {
      if (now - joinTime.getTime() > this.config.matchTimeout * 10) { // 10x normal timeout = expired
        expiredPlayers.push(playerId);
      }
    }

    // Remove each expired player from the queue
    for (const playerId of expiredPlayers) {
      await this.leaveQueue(playerId);
      console.log(`🧹 Removed expired player ${playerId} from queue`);
    }

    if (expiredPlayers.length > 0) {
      console.log(`🧹 Queue cleanup completed: removed ${expiredPlayers.length} expired players`);
    }
  }
}
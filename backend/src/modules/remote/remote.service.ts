//service.ts - Updated MatchResult interface
import { EntityData, EntityManager, RequiredEntityData, UniqueConstraintViolationException } from "@mikro-orm/core";
import { RemoteGameRepository } from "./remote.repository";
import { Status, RemoteGame } from "./entities/remote.entity";
import { CreateRemotePlayerDto, updateRemotePlayerDto, MatchInfo, MatchResultDto } from "./remote.dto";
import { ConflictException } from "../../common/exceptions/ConflictException";
import { NotFoundException } from "../../common/exceptions/NotFoundException";
import { randomUUID } from "crypto";

export class RemoteGameService {
  constructor(
    private readonly remoteGameRepository: RemoteGameRepository
  ) { }

  // find player
  async findPlayer(em: EntityManager, where: Partial<RemoteGame>): Promise<RemoteGame | null> {
    return this.remoteGameRepository.findPlayer(em, where);
  }
  // changing status ONLINE to join remote game if it is a new player,
  // it creates a new player database and set the status to ONLINE
  async joinQueue(em: EntityManager, playerId: string): Promise<RemoteGame> {
    const existingPlayer = await this.remoteGameRepository.findPlayer(em, { playerId });

    if (existingPlayer) {
      // Use the updatePlayer method with DTO pattern
      const updateDto: updateRemotePlayerDto = {
        status: Status.ONLINE
      };
      return this.updatePlayer(em, playerId, updateDto);
    } else {
      // Create new player with ONLINE status
      const playerData: RequiredEntityData<RemoteGame> = {
        playerId: playerId,
        rating: 100,
        status: Status.ONLINE
      };

      try {
        return this.remoteGameRepository.createRemoteGamePlayer(em, playerData);
      } catch (error) {
        if (error instanceof UniqueConstraintViolationException) {
          throw new ConflictException(`Player with ID ${playerId} already exists`);
        }
        throw error;
      }
    }
  }
  //leave queue
  async leaveQueue(em: EntityManager, playerId: string): Promise<RemoteGame> {
    const updateDto: updateRemotePlayerDto = {
      status: Status.OFFLINE
    };
    return this.updatePlayer(em, playerId, updateDto);
  }
  //find all online players
  async findAllOnlinePlayers(em: EntityManager): Promise<{ players: RemoteGame[]; count: number }> {
    return this.remoteGameRepository.findAllOnlinePlayers(em);
  }

  async createMatch(em: EntityManager, playerId: string): Promise<MatchInfo> {
    // Use a transaction to ensure both updates happen atomically
    return em.transactional(async (em) => {
      // Find the requesting player
      const player1 = await this.findPlayer(em, { playerId });
      if (!player1) {
        throw new NotFoundException(`Player with ID ${playerId} not found`);
      }

      // Find an opponent
      const player2 = await this.findOpponent(em, playerId);

      // Update both players' status to IN_GAME using the repository method directly
      // This ensures both updates happen in the same transaction
      await this.remoteGameRepository.updateRemoteGamePlayer(em, player1.playerId, { status: Status.IN_GAME });
      await this.remoteGameRepository.updateRemoteGamePlayer(em, player2.playerId, { status: Status.IN_GAME });

      // Fetch the updated players to get the latest state
      const updatedPlayer1 = await this.findPlayer(em, { playerId: player1.playerId });
      const updatedPlayer2 = await this.findPlayer(em, { playerId: player2.playerId });

      if (!updatedPlayer1 || !updatedPlayer2) {
        throw new NotFoundException('Failed to update players');
      }

      // Create match info
      const matchFoundAt = new Date();
      
      const matchInfo: MatchInfo = {
        matchId: randomUUID(),
        player1: {
          playerId: updatedPlayer1.playerId,
          rating: updatedPlayer1.rating,
          status: updatedPlayer1.status
        },
        player2: {
          playerId: updatedPlayer2.playerId,
          rating: updatedPlayer2.rating,
          status: updatedPlayer2.status
        },
        matchFoundAt
      };

      return matchInfo;
    });
  }

  async findOpponent(em: EntityManager, playerId: string): Promise < RemoteGame > {
      // First, get the current player to know their rating
      const currentPlayer = await this.findPlayer(em, { playerId });
      if(!currentPlayer) {
        throw new NotFoundException(`Player with ID ${playerId} not found`);
      }

    // Get all online players excluding the current player
    const { players: allOnlinePlayers, count } = await this.remoteGameRepository.findAllOnlinePlayersExcluding(em, playerId);

      // Check if there are available opponents
      if(count < 1) {
        throw new NotFoundException('No opponents available for matching');
      }

    // Find the opponent with the closest rating
    const bestOpponent = allOnlinePlayers.reduce((closest, current) => {
        const currentDiff = Math.abs(current.rating - currentPlayer.rating);
        const closestDiff = Math.abs(closest.rating - currentPlayer.rating);
        return currentDiff < closestDiff ? current : closest;
      });

      return bestOpponent;
    }
  //Create player database if its their first time
  async createPlayer(em: EntityManager, createRemotePlayerDto: CreateRemotePlayerDto): Promise < RemoteGame > {
      const playerData: RequiredEntityData<RemoteGame> = {
      playerId: createRemotePlayerDto.playerId,
      rating: 100,
      status: Status.OFFLINE
    };

    try {
      return this.remoteGameRepository.createRemoteGamePlayer(em, playerData);
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

    async calculateAndUpdateRating(em: EntityManager, matchResultDto: MatchResultDto): Promise<{ winner: RemoteGame; loser: RemoteGame }> {
    return em.transactional(async (em) => {
      // Find both players
      const winner = await this.findPlayer(em, { playerId: matchResultDto.winnerId });
      const loser = await this.findPlayer(em, { playerId: matchResultDto.loserId });

      if (!winner) {
        throw new NotFoundException(`Winner with ID ${matchResultDto.winnerId} not found`);
      }
      if (!loser) {
        throw new NotFoundException(`Loser with ID ${matchResultDto.loserId} not found`);
      }

      const scoreDifference = matchResultDto.winnerScore - matchResultDto.loserScore;
      // Calculate rating changes based on score difference
      const winnerRatingGain = scoreDifference * 100;
      const loserRatingLoss = scoreDifference * 50;

      const winnerNewRating = winner.rating + winnerRatingGain;
      const loserNewRating = Math.max(0, loser.rating - loserRatingLoss); // Ensure rating doesn't go below 0

      // Update both players using repository method directly
      await this.remoteGameRepository.updateRemoteGamePlayer(em, winner.playerId, {
        rating: winnerNewRating,
        status: Status.OFFLINE
      });
      
      await this.remoteGameRepository.updateRemoteGamePlayer(em, loser.playerId, {
        rating: loserNewRating,
        status: Status.OFFLINE
      });

      // Fetch the updated players to return the latest state
      const updatedWinner = await this.findPlayer(em, { playerId: winner.playerId });
      const updatedLoser = await this.findPlayer(em, { playerId: loser.playerId });

      if (!updatedWinner || !updatedLoser) {
        throw new NotFoundException('Failed to update players after match completion');
      }

      return {
        winner: updatedWinner,
        loser: updatedLoser
      };
    });
  }

  async updatePlayer(em: EntityManager, playerId: string, updateRemotePlayerDto: updateRemotePlayerDto): Promise<RemoteGame> {
    const playerData = updateRemotePlayerDto satisfies EntityData<RemoteGame>;
    return this.remoteGameRepository.updateRemoteGamePlayer(em, playerId, playerData);
  }
}



import { EntityManager } from "@mikro-orm/core";
import { UserStatsService } from "./services/user-stats.service";
import { UpdateUserDto } from "../user/user.dto";
import { UserStats } from "./entities/user-stats.entity";
import { UserStatsRepository } from "./repositories/user-stats.repository";
import { UpdateUserStatsDto, MatchResultDto } from "./dtos/user-stats.dto";
import { NotFoundException } from "../../common/exceptions/NotFoundException";

export class StatsService {
	constructor(private readonly userStatsService: UserStatsService,
		private readonly userStatsRepository: UserStatsRepository
	) { }

	getUserStatsService(): UserStatsService {
		return this.userStatsService;
	}

	//added 21.7 this will validate if the Id is uuid, if it is, then its a player then it will update its stats
	// Helper function to check if string is a valid UUID
	private isValidUUID(str: string | null): boolean {
		if (!str) return false;
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegex.test(str);
	}

	async updateUserStats(em: EntityManager, matchResult: MatchResultDto): Promise<void> {
		const { winnerId, loserId, winnerScore, loserScore } = matchResult;

		// Process winner if winnerId is a valid UUID
		if (this.isValidUUID(winnerId)) {
			const winnerStats = await this.userStatsRepository.findOne(em, { userId: winnerId! });

			if (winnerStats) {
				// Calculate updated stats for winner
				const newMatchesPlayed = winnerStats.matchesPlayed + 1;
				const newMatchesWon = winnerStats.matchesWon + 1;
				const newWinRate = (newMatchesWon / newMatchesPlayed) * 100;
				const ratingBonus = (winnerScore - loserScore) * 100;
				const newRating = winnerStats.rating + ratingBonus;

				const winnerUpdateDto: UpdateUserStatsDto = {
					matchesPlayed: newMatchesPlayed,
					matchesWon: newMatchesWon,
					matchesLost: winnerStats.matchesLost,
					winRate: Math.round(newWinRate * 100) / 100, // Round to 2 decimal places
					rating: newRating
				};

				await this.userStatsRepository.updateById(em, winnerId!, winnerUpdateDto);
			}
			else {
				throw new NotFoundException(`Player with ID ${winnerId} not found`);
			}
		}

		// Process loser if loserId is a valid UUID
		if (this.isValidUUID(loserId)) {
			const loserStats = await this.userStatsRepository.findOne(em, { userId: loserId! });

			if (loserStats) {
				// Calculate updated stats for loser
				const newMatchesPlayed = loserStats.matchesPlayed + 1;
				const newMatchesLost = loserStats.matchesLost + 1;
				const newWinRate = (loserStats.matchesWon / newMatchesPlayed) * 100;
				const ratingPenalty = (loserScore - winnerScore) * 50; // This will be negative
				const newRating = loserStats.rating + ratingPenalty;

				const loserUpdateDto: UpdateUserStatsDto = {
					matchesPlayed: newMatchesPlayed,
					matchesWon: loserStats.matchesWon,
					matchesLost: newMatchesLost,
					winRate: Math.round(newWinRate * 100) / 100, // Round to 2 decimal places
					rating: Math.max(0, newRating) // Ensure rating doesn't go below 0
				};
				await this.userStatsRepository.updateById(em, loserId!, loserUpdateDto);
			} else {
				throw new NotFoundException(`Player with ID ${loserId} not found`);
			}
		}
	}
}
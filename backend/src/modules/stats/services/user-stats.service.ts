import { EntityData, EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { UserStatsRepository } from "../repositories/user-stats.repository";
import { UpsertUserStatsDto, UpdateUserStatsDto, MatchResultDto, UpdateUserRatingDto } from "../dtos/user-stats.dto";
import { UserStats } from "../entities/user-stats.entity";
import { NotFoundException } from "../../../common/exceptions/NotFoundException";

export class UserStatsService {
	constructor(private readonly userStatsRepository: UserStatsRepository) {}

	async find(em: EntityManager, userId: string): Promise<UserStats> {
		const userStats = await this.userStatsRepository.findOne(em, { userId });

		if (!userStats) {
			throw new NotFoundException("User not found");
		}

		return userStats;
	}

	async upsert(em: EntityManager, upsertUserStatsDto: UpsertUserStatsDto): Promise<UserStats> {
		const { userId, won } = upsertUserStatsDto;
		const userStats = await this.userStatsRepository.findOne(em, { userId });

		if (!userStats) {
			const userStatsData: RequiredEntityData<UserStats> = {
				userId,
				matchesPlayed: 1,
				matchesWon: won ? 1 : 0,
				matchesLost: won ? 0 : 1,
				winRate: won ? 100.00 : 0.00,
				rating: 100 // Default starting rating
			};
			return this.userStatsRepository.create(em, userStatsData);
		}

		const matchesPlayed = userStats.matchesPlayed + 1;
		const matchesWon = won ? (userStats.matchesWon + 1) : userStats.matchesWon;
		const matchesLost = won ? userStats.matchesLost : (userStats.matchesLost + 1);
		const winRate = won ? Math.round((matchesWon / matchesPlayed) * 100 * 100) / 100 : userStats.winRate;

		return this.userStatsRepository.update(em, userStats, {
			matchesPlayed,
			matchesWon,
			matchesLost,
			winRate
		});
	}

	async updateById(em: EntityManager, userId: string, updateUserStatsDto: UpdateUserStatsDto): Promise<UserStats> {
		return this.userStatsRepository.updateById(em, userId, updateUserStatsDto satisfies EntityData<UserStats>);
	}

	async update(em: EntityManager, userStats: UserStats, updateUserStatsDto: UpdateUserStatsDto): Promise<UserStats> {
		return this.userStatsRepository.update(em, userStats, updateUserStatsDto satisfies EntityData<UserStats>);
	}
	//updated 23.7 this will validate if the Id is uuid, if it is, then its a player then it will update its stats
	// Helper function to check if string is a valid UUID
	private isValidUUID(str: string | null): boolean {
		if (!str) return false;
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegex.test(str);
	}

	async updateUserRating(em: EntityManager, matchResult: MatchResultDto): Promise<void> {
		const { winnerId, loserId, winnerScore, loserScore } = matchResult;

		// Process winner if winnerId is a valid UUID
		if (this.isValidUUID(winnerId)) {
			const winnerStats = await this.userStatsRepository.findOne(em, { userId: winnerId! });

			if (winnerStats) {
				// Calculate updated stats for winner
				const ratingBonus = (winnerScore - loserScore) * 100;
				const newRating = winnerStats.rating + ratingBonus;

				const winnerUpdateDto: UpdateUserRatingDto = {
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
				const ratingPenalty = (loserScore - winnerScore) * 50; // This will be negative
				const newRating = loserStats.rating + ratingPenalty;

				const loserUpdateDto: UpdateUserRatingDto = {
					rating: Math.max(0, newRating) // Ensure rating doesn't go below 0
				};
				await this.userStatsRepository.updateById(em, loserId!, loserUpdateDto);
			} else {
				throw new NotFoundException(`Player with ID ${loserId} not found`);
			}
		}
	}
}
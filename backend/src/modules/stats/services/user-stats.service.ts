import { EntityData, EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { UserStatsRepository } from "../repositories/user-stats.repository";
import { UpsertUserStatsDto, UpdateUserStatsDto } from "../dtos/user-stats.dto";
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
}
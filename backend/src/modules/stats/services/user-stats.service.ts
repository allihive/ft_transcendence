import { EntityData, EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { UserStatsRepository } from "../repositories/user-stats.repository";
import { CreateUserStatsDto, UpdateUserStatsDto } from "../dtos/user-stats.dto";
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

	async create(em: EntityManager, createUserStatsDto: CreateUserStatsDto): Promise<UserStats> {
		const { userId, matchesPlayed, matchesWon, matchesLost } = createUserStatsDto;

		const userStatsData: RequiredEntityData<UserStats> = {
			userId,
			matchesPlayed,
			matchesWon,
			matchesLost,
			winRate: (matchesPlayed > 0
				? Math.round((matchesWon / matchesPlayed) * 100 * 100) / 100
				: 0
			)
		};

		return this.userStatsRepository.create(em, userStatsData);
	}

	async updateById(em: EntityManager, userId: string, updateUserStatsDto: UpdateUserStatsDto): Promise<UserStats> {
		return this.userStatsRepository.updateById(em, userId, updateUserStatsDto satisfies EntityData<UserStats>);
	}

	async update(em: EntityManager, userStats: UserStats, updateUserStatsDto: UpdateUserStatsDto): Promise<UserStats> {
		return this.userStatsRepository.update(em, userStats, updateUserStatsDto satisfies EntityData<UserStats>);
	}
}
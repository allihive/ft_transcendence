import { EntityData, EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { UserStats } from "../entities/user-stats.entity";
import { NotFoundException } from "../../../common/exceptions/NotFoundException";

export class UserStatsRepository {
	async findOne(em: EntityManager, where: Partial<UserStats>): Promise<UserStats | null> {
		return em.findOne(UserStats, where);
	}

	async create(em: EntityManager, userStatsData: RequiredEntityData<UserStats>): Promise<UserStats> {
		const userStats = em.create(UserStats, userStatsData);
		await em.persistAndFlush(userStats);
		return userStats;
	}

	async updateById(em: EntityManager, userId: string, userStatsData: EntityData<UserStats>): Promise<UserStats> {
		const userStats = await em.findOne(UserStats, { userId });

		if (!userStats) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}

		em.assign(userStats, userStatsData);
		await em.flush();
		return userStats;
	}

	async update(em: EntityManager, userStats: UserStats, userStatsData: EntityData<UserStats>): Promise<UserStats> {
		em.assign(userStats, userStatsData);
		await em.flush();
		return userStats;
	}
}
import { EntityManager } from "@mikro-orm/core";
import { UserStatsService } from "./services/user-stats.service";
import { UpdateUserDto } from "../user/user.dto";
import { UserStats } from "./entities/user-stats.entity";
import { UserStatsRepository } from "./repositories/user-stats.repository";
import { NotFoundException } from "../../common/exceptions/NotFoundException";

export class StatsService {
	constructor(private readonly userStatsService: UserStatsService,
		private readonly userStatsRepository: UserStatsRepository
	) { }

	getUserStatsService(): UserStatsService {
		return this.userStatsService;
	}
}
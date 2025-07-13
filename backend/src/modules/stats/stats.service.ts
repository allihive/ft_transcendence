import { UserStatsService } from "./services/user-stats.service";

export class StatsService {
	constructor(private readonly userStatsService: UserStatsService) {}

	getUserStatsService(): UserStatsService {
		return this.userStatsService;
	}
}
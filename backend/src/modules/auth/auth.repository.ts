import { EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { UserProvider } from "./entities/user-provider.entity";

export class AuthRepository {
	async findUserProvider(em: EntityManager, where: Partial<UserProvider>): Promise<UserProvider | null> {
		return em.findOne(UserProvider, where);;
	}

	async createUserProvider(em: EntityManager, userProviderData: RequiredEntityData<UserProvider>): Promise<UserProvider> {
		const userProvider = em.create(UserProvider, userProviderData);
		await em.persistAndFlush(userProvider);
		return userProvider;
	}
}
